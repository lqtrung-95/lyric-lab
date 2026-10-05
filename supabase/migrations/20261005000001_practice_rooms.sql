-- Phòng thi đấu 1v1: phòng, người chơi trong phòng, và các hàm nguyên tử cho vòng đời phòng.
-- Chỉ server (service role) ghi; người dùng chỉ đọc phòng của chính mình qua RLS (cũng là điều kiện để Realtime chỉ phát
-- sự kiện cho thành viên). Chạy bằng Supabase SQL Editor; không chạy lại được (create table), các hàm thì create or replace.

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  -- Mã 6 chữ số (100000–999999) dùng để vào phòng; chỉ duy nhất trong các phòng còn hiệu lực (xem chỉ mục bên dưới).
  code text not null check (code ~ '^[1-9][0-9]{5}$'),
  host_id uuid references auth.users (id) on delete set null,
  -- Null = chọn ngẫu nhiên khi bắt đầu.
  video_id text references public.songs (video_id) on delete set null,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished', 'expired')),
  -- Hạt giống cố định bộ câu hỏi để hai người nhận cùng một bộ.
  seed integer not null default (floor(random() * 2147483647))::integer,
  question_count smallint not null default 10 check (question_count between 5 and 20),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  -- Phòng chờ sống 10 phút; khi bắt đầu được gia hạn (xem start_room) để phòng treo không giữ mã mãi.
  expires_at timestamptz not null default now() + interval '10 minutes'
);
create unique index rooms_active_code_key on public.rooms (code) where status in ('waiting', 'playing');

create table public.room_players (
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 3 and 20),
  ready boolean not null default false,
  score integer not null default 0,
  correct smallint not null default 0,
  total_ms integer not null default 0,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (room_id, user_id)
);
-- "Bạn luyện cùng gần đây" suy ra từ lịch sử này theo người dùng.
create index room_players_user_idx on public.room_players (user_id, joined_at desc);

alter table public.rooms enable row level security;
alter table public.room_players enable row level security;

-- Hàm kiểm tra thành viên chạy với quyền chủ hàm: policy trên room_players mà tự truy vấn room_players sẽ lặp vô hạn.
create function public.is_room_member(p_room uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.room_players where room_id = p_room and user_id = (select auth.uid()));
$$;

create policy rooms_member_read on public.rooms for select to authenticated using (public.is_room_member(id));
create policy room_players_member_read on public.room_players for select to authenticated using (public.is_room_member(room_id));

-- Hạn mức: tạo phòng ('room', theo 24 giờ) và số lần thử vào phòng ('room_join', theo 1 giờ, chống đoán mã).
alter table public.usage_events drop constraint usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('analyze', 'explain', 'tts', 'score', 'room', 'room_join'));

-- Rời phòng. Phòng chờ: chủ phòng rời thì chuyển chủ cho người còn lại, hết người thì phòng hết hạn.
-- Phòng đang chơi: chỉ đánh dấu đã rời (việc xử thua do logic ván chơi).
create function public.leave_room(p_room uuid, p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_other uuid;
begin
  select * into v_room from public.rooms where id = p_room for update;
  if not found then
    return;
  end if;
  update public.room_players set left_at = now(), ready = false
    where room_id = p_room and user_id = p_user and left_at is null;
  if v_room.status = 'waiting' then
    select user_id into v_other from public.room_players
      where room_id = p_room and left_at is null order by joined_at limit 1;
    if v_other is null then
      update public.rooms set status = 'expired' where id = p_room;
    elsif v_room.host_id is not distinct from p_user then
      update public.rooms set host_id = v_other where id = p_room;
    end if;
  end if;
end;
$$;

-- Một người chỉ ở một phòng còn hiệu lực: rời mọi phòng khác (trừ `p_except`) trước khi vào/tạo phòng mới.
create function public.leave_active_rooms(p_user uuid, p_except uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  for v_room_id in
    select rp.room_id from public.room_players rp
      join public.rooms r on r.id = rp.room_id
      where rp.user_id = p_user and rp.left_at is null and r.status in ('waiting', 'playing')
        and (p_except is null or r.id <> p_except)
  loop
    perform public.leave_room(v_room_id, p_user);
  end loop;
end;
$$;

-- Tạo phòng và đưa chủ phòng vào luôn (chủ phòng mặc định sẵn sàng). Mã trùng với phòng còn hiệu lực ném unique_violation
-- để nơi gọi sinh mã khác; cả hàm là một giao dịch nên lúc đó không có thay đổi nào được giữ lại.
create function public.create_room(p_host uuid, p_code text, p_video text, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.rooms set status = 'expired' where status in ('waiting', 'playing') and expires_at < now();
  perform public.leave_active_rooms(p_host, null);
  insert into public.rooms (code, host_id, video_id) values (p_code, p_host, p_video) returning id into v_id;
  insert into public.room_players (room_id, user_id, display_name, ready) values (v_id, p_host, p_name, true);
  return v_id;
end;
$$;

-- Vào phòng bằng mã. Trả: ok | not_found | expired | full | not_waiting. Khóa dòng phòng để hai người cùng vào chỗ cuối không lọt cả hai.
create function public.join_room(p_code text, p_user uuid, p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_active integer;
begin
  select * into v_room from public.rooms where code = p_code and status in ('waiting', 'playing') for update;
  if not found then
    return 'not_found';
  end if;
  if v_room.expires_at < now() then
    update public.rooms set status = 'expired' where id = v_room.id;
    return 'expired';
  end if;
  -- Đã là người chơi còn trong phòng (vào lại / mở link lần nữa): coi như thành công, giữ nguyên trạng thái.
  if exists (select 1 from public.room_players where room_id = v_room.id and user_id = p_user and left_at is null) then
    update public.room_players set display_name = p_name where room_id = v_room.id and user_id = p_user;
    return 'ok';
  end if;
  if v_room.status <> 'waiting' then
    return 'not_waiting';
  end if;
  select count(*) into v_active from public.room_players where room_id = v_room.id and left_at is null;
  if v_active >= 2 then
    return 'full';
  end if;
  perform public.leave_active_rooms(p_user, v_room.id);
  insert into public.room_players (room_id, user_id, display_name, ready)
    values (v_room.id, p_user, p_name, false)
    on conflict (room_id, user_id) do update set left_at = null, ready = false, display_name = excluded.display_name;
  return 'ok';
end;
$$;

-- Đặt trạng thái sẵn sàng (chỉ khi phòng còn chờ). Trả false nếu không có thay đổi (không ở trong phòng / phòng đã bắt đầu).
create function public.set_room_ready(p_room uuid, p_user uuid, p_ready boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  update public.room_players p set ready = p_ready
    from public.rooms r
    where r.id = p_room and r.status = 'waiting' and p.room_id = r.id and p.user_id = p_user and p.left_at is null;
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

-- Chủ phòng bắt đầu ván. Trả: ok | not_found | not_host | not_waiting | expired | need_two | not_ready.
-- `p_video` là bài chọn ngẫu nhiên khi phòng chưa có bài. Đặt hạn 2 giờ cho phòng đang chơi để không giữ mã mãi nếu ván treo.
create function public.start_room(p_room uuid, p_host uuid, p_video text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_total integer;
  v_ready integer;
begin
  select * into v_room from public.rooms where id = p_room for update;
  if not found then
    return 'not_found';
  end if;
  if v_room.host_id is distinct from p_host then
    return 'not_host';
  end if;
  if v_room.status <> 'waiting' then
    return 'not_waiting';
  end if;
  if v_room.expires_at < now() then
    update public.rooms set status = 'expired' where id = p_room;
    return 'expired';
  end if;
  select count(*), count(*) filter (where ready) into v_total, v_ready
    from public.room_players where room_id = p_room and left_at is null;
  if v_total <> 2 then
    return 'need_two';
  end if;
  if v_ready <> 2 then
    return 'not_ready';
  end if;
  update public.rooms
    set status = 'playing', started_at = now(), video_id = coalesce(video_id, p_video), expires_at = now() + interval '2 hours'
    where id = p_room;
  return 'ok';
end;
$$;

-- Các hàm này chỉ server (service role) được gọi.
revoke all on function public.leave_room(uuid, uuid) from public, anon, authenticated;
revoke all on function public.leave_active_rooms(uuid, uuid) from public, anon, authenticated;
revoke all on function public.create_room(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.join_room(text, uuid, text) from public, anon, authenticated;
revoke all on function public.set_room_ready(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.start_room(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.leave_room(uuid, uuid) to service_role;
grant execute on function public.leave_active_rooms(uuid, uuid) to service_role;
grant execute on function public.create_room(uuid, text, text, text) to service_role;
grant execute on function public.join_room(text, uuid, text) to service_role;
grant execute on function public.set_room_ready(uuid, uuid, boolean) to service_role;
grant execute on function public.start_room(uuid, uuid, text) to service_role;
