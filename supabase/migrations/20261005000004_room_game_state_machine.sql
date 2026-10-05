-- Máy trạng thái ván chơi của phòng thi đấu: mở câu, tiến câu (idempotent), kết thúc, xử thua khi rời/bỏ đi, và công bố
-- thay đổi cho Realtime. Mọi chuyển trạng thái nằm trong các hàm SQL (có khóa dòng phòng) để hai máy cùng gọi không nhảy hai câu.
-- Chạy bằng Supabase SQL Editor sau các migration phòng thi đấu trước đó.
--
-- Điểm số mà client đọc được (room_players.score/correct/total_ms) chỉ được cập nhật khi một câu ĐÓNG (mọi người đã trả lời hoặc hết
-- hạn), tính lại từ room_answers. Nếu cập nhật ngay lúc trả lời thì Realtime/đọc bảng cho đối thủ biết người kia vừa đúng hay sai
-- trước khi họ tự chọn. Lúc trả lời chỉ đánh dấu answered_idx và thời gian trả lời (không lộ đúng/sai hay lựa chọn).

alter table public.rooms
  add column current_question smallint,
  add column finished_at timestamptz,
  add column winner_id uuid references auth.users (id) on delete set null,
  add column forfeit boolean not null default false;

alter table public.room_players
  add column answered_idx smallint not null default -1,
  add column last_answer_ms integer;

-- Tính lại điểm hiển thị của mọi người chơi từ các câu trả lời đã ghi.
create function public.recompute_room_scores(p_room uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.room_players p
    set score = s.points, correct = s.correct, total_ms = s.ms
    from (
      select user_id, sum(points)::integer as points, (count(*) filter (where correct))::integer as correct, sum(elapsed_ms)::integer as ms
      from public.room_answers where room_id = p_room group by user_id
    ) s
    where p.room_id = p_room and p.user_id = s.user_id;
$$;

-- Kết thúc ván. `p_forfeit_winner` có giá trị khi ván kết thúc vì có người rời/bỏ đi (người còn lại thắng); null thì xét theo số câu đúng
-- rồi tổng điểm (khớp decideWinner ở TypeScript): hòa cả hai thì không có người thắng.
create function public.finish_room(p_room uuid, p_forfeit boolean, p_forfeit_winner uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_winner uuid;
  v_first record;
  v_second record;
begin
  perform public.recompute_room_scores(p_room);
  if p_forfeit then
    v_winner := p_forfeit_winner;
  else
    select user_id, correct, score into v_first from public.room_players where room_id = p_room order by correct desc, score desc limit 1;
    select user_id, correct, score into v_second from public.room_players where room_id = p_room order by correct desc, score desc offset 1 limit 1;
    if v_second.user_id is null or v_first.correct <> v_second.correct or v_first.score <> v_second.score then
      v_winner := v_first.user_id;
    end if;
  end if;
  update public.rooms set status = 'finished', finished_at = now(), winner_id = v_winner, forfeit = p_forfeit where id = p_room;
end;
$$;

-- Bắt đầu ván (thay bản cũ): thêm kiểm tra đã có bộ câu hỏi và lên lịch mở câu đầu tiên sau 3 giây (để hai máy kịp nhận trước khi đếm giờ).
create or replace function public.start_room(p_room uuid, p_host uuid, p_video text)
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
  if not exists (select 1 from public.room_questions where room_id = p_room and idx = 0) then
    return 'no_questions';
  end if;
  update public.room_questions
    set opens_at = now() + interval '3 seconds', deadline_at = now() + interval '18 seconds'
    where room_id = p_room and idx = 0;
  update public.rooms
    set status = 'playing', started_at = now(), current_question = 0, video_id = coalesce(video_id, p_video),
        expires_at = now() + interval '2 hours'
    where id = p_room;
  return 'ok';
end;
$$;

-- Rời phòng (thay bản cũ): đang chơi mà rời thì ván kết thúc xử người còn lại thắng (hết người thì không ai thắng).
create or replace function public.leave_room(p_room uuid, p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_other uuid;
  v_active integer;
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
  elsif v_room.status = 'playing' then
    select count(*), min(user_id::text)::uuid into v_active, v_other from public.room_players where room_id = p_room and left_at is null;
    if v_active < 2 then
      perform public.finish_room(p_room, true, v_other);
    end if;
  end if;
end;
$$;

-- Nhận câu trả lời (thay bản cũ): chỉ đánh dấu đã trả lời và thời gian; điểm hiển thị cập nhật khi câu đóng (xem advance_room).
create or replace function public.submit_room_answer(p_room uuid, p_user uuid, p_idx smallint, p_choice smallint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_question public.room_questions;
  v_correct_index smallint;
  v_elapsed integer;
  v_is_correct boolean;
  v_points integer;
  v_rows integer;
begin
  select status into v_status from public.rooms where id = p_room;
  if v_status is distinct from 'playing' then
    return jsonb_build_object('result', 'not_playing');
  end if;
  if not exists (select 1 from public.room_players where room_id = p_room and user_id = p_user and left_at is null) then
    return jsonb_build_object('result', 'not_in_room');
  end if;
  select * into v_question from public.room_questions where room_id = p_room and idx = p_idx;
  if not found then
    return jsonb_build_object('result', 'no_question');
  end if;
  if v_question.opens_at is null or now() < v_question.opens_at then
    return jsonb_build_object('result', 'not_open');
  end if;
  if v_question.deadline_at is null or now() > v_question.deadline_at + interval '1 second' then
    return jsonb_build_object('result', 'closed');
  end if;

  select correct_index into v_correct_index from public.room_question_keys where room_id = p_room and idx = p_idx;
  v_elapsed := least(15000, greatest(0, floor(extract(epoch from (now() - v_question.opens_at)) * 1000)::integer));
  v_is_correct := p_choice = v_correct_index;
  v_points := public.room_answer_points(v_is_correct, v_elapsed);

  insert into public.room_answers (room_id, idx, user_id, choice, correct, points, elapsed_ms)
    values (p_room, p_idx, p_user, p_choice, v_is_correct, v_points, v_elapsed)
    on conflict (room_id, idx, user_id) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return jsonb_build_object('result', 'already_answered');
  end if;

  update public.room_players set answered_idx = p_idx, last_answer_ms = v_elapsed where room_id = p_room and user_id = p_user;
  return jsonb_build_object('result', 'ok', 'correct', v_is_correct, 'points', v_points, 'elapsed_ms', v_elapsed, 'correct_index', v_correct_index);
end;
$$;

-- Tiến câu. Mọi client gọi được, idempotent: chỉ chuyển khi câu hiện tại đã ĐÓNG (đã mở, và mọi người còn trong phòng đã trả lời hoặc
-- quá hạn + 1 giây ân hạn). Gọi thừa thì trả not_ready. Khi chuyển: tính lại điểm hiển thị; người vắng 3 câu liền bị coi là đã rời
-- (không cần heartbeat); còn dưới 2 người hoặc hết câu thì kết thúc ván; ngược lại mở câu kế sau 3 giây.
-- Trả jsonb {result: advanced | finished | not_ready | not_playing, current_question}.
create function public.advance_room(p_room uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
  v_question public.room_questions;
  v_active integer;
  v_answered integer;
  v_cur smallint;
  v_total integer;
  v_remaining uuid;
begin
  select * into v_room from public.rooms where id = p_room for update;
  if not found or v_room.status <> 'playing' then
    return jsonb_build_object('result', 'not_playing');
  end if;
  v_cur := v_room.current_question;
  select * into v_question from public.room_questions where room_id = p_room and idx = v_cur;
  if not found or v_question.opens_at is null or now() < v_question.opens_at then
    return jsonb_build_object('result', 'not_ready', 'current_question', v_cur);
  end if;

  select count(*) into v_active from public.room_players where room_id = p_room and left_at is null;
  select count(*) into v_answered from public.room_answers a
    join public.room_players p on p.room_id = a.room_id and p.user_id = a.user_id and p.left_at is null
    where a.room_id = p_room and a.idx = v_cur;
  if not (v_answered >= v_active or now() > v_question.deadline_at + interval '1 second') then
    return jsonb_build_object('result', 'not_ready', 'current_question', v_cur);
  end if;

  perform public.recompute_room_scores(p_room);

  if v_cur >= 2 then
    update public.room_players p set left_at = now(), ready = false
      where p.room_id = p_room and p.left_at is null
        and not exists (select 1 from public.room_answers a where a.room_id = p_room and a.user_id = p.user_id and a.idx between v_cur - 2 and v_cur);
  end if;

  select count(*), min(user_id::text)::uuid into v_active, v_remaining from public.room_players where room_id = p_room and left_at is null;
  if v_active < 2 then
    perform public.finish_room(p_room, true, case when v_active = 1 then v_remaining else null end);
    return jsonb_build_object('result', 'finished', 'current_question', v_cur);
  end if;

  select count(*) into v_total from public.room_questions where room_id = p_room;
  if v_cur + 1 >= v_total then
    perform public.finish_room(p_room, false, null);
    return jsonb_build_object('result', 'finished', 'current_question', v_cur);
  end if;

  update public.room_questions
    set opens_at = now() + interval '3 seconds', deadline_at = now() + interval '18 seconds'
    where room_id = p_room and idx = v_cur + 1;
  update public.rooms set current_question = v_cur + 1 where id = p_room;
  return jsonb_build_object('result', 'advanced', 'current_question', v_cur + 1);
end;
$$;

revoke all on function public.recompute_room_scores(uuid) from public, anon, authenticated;
revoke all on function public.finish_room(uuid, boolean, uuid) from public, anon, authenticated;
revoke all on function public.advance_room(uuid) from public, anon, authenticated;
grant execute on function public.recompute_room_scores(uuid) to service_role;
grant execute on function public.finish_room(uuid, boolean, uuid) to service_role;
grant execute on function public.advance_room(uuid) to service_role;

-- Realtime: chỉ phát thay đổi của phòng và người chơi (RLS thành viên áp dụng). Câu hỏi và đáp án không đi qua Realtime:
-- client chỉ dùng sự kiện này làm tín hiệu để tải lại trạng thái từ API.
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
