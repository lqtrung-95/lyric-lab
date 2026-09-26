-- Bảng xếp hạng luyện tập: điểm mỗi lượt chơi và hồ sơ (biệt danh) của người tự nguyện tham gia.
-- Chỉ server (service role) đọc/ghi: bật RLS và không có policy, người dùng đi qua API của app.

create table public.leaderboard_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 3 and 20),
  opted_in boolean not null default true,   -- false = đã rời bảng xếp hạng (giữ biệt danh để quay lại)
  hidden boolean not null default false,    -- quản trị ẩn một hồ sơ vi phạm mà không xóa dữ liệu
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Biệt danh duy nhất, không phân biệt hoa thường.
create unique index leaderboard_profiles_nickname_key on public.leaderboard_profiles (lower(nickname));

create table public.practice_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('pinyin', 'cloze', 'listen', 'match', 'karaoke')),
  points integer not null check (points >= 0 and points <= 6000),
  correct smallint not null check (correct >= 0),
  total smallint not null check (total between 1 and 20),
  duration_sec integer not null check (duration_sec >= 0),
  played_at timestamptz not null default now()
);
create index practice_scores_user_idx on public.practice_scores (user_id, played_at desc);
create index practice_scores_played_idx on public.practice_scores (played_at);

alter table public.leaderboard_profiles enable row level security;
alter table public.practice_scores enable row level security;

-- Cho phép sổ đếm lượt dùng ghi nhận loại 'score' (giới hạn số lượt chơi gửi điểm mỗi giờ).
alter table public.usage_events drop constraint usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check check (kind in ('analyze', 'explain', 'tts', 'score'));

-- Bảng xếp hạng: chỉ người đã bật tham gia và không bị ẩn. Tuần bắt đầu thứ Hai 00:00 giờ Việt Nam.
-- Hạng đồng điểm chia sẻ cùng một hạng. Trả cả user_id để API đánh dấu "bạn"; API không đưa user_id ra ngoài.
create function public.leaderboard_top(p_scope text, p_limit integer default 50)
returns table (rank bigint, user_id uuid, nickname text, points bigint)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh') as week_start
  ),
  totals as (
    select s.user_id, sum(s.points)::bigint as points
    from public.practice_scores s, bounds b
    where p_scope = 'all' or s.played_at >= b.week_start
    group by s.user_id
  )
  select rank() over (order by t.points desc) as rank, t.user_id, p.nickname, t.points
  from totals t
  join public.leaderboard_profiles p on p.user_id = t.user_id and p.opted_in and not p.hidden
  order by t.points desc, p.nickname
  limit greatest(p_limit, 1);
$$;

-- Hạng và điểm của một người (kể cả khi nằm ngoài top), chỉ khi người đó đang tham gia.
create function public.leaderboard_rank(p_user uuid, p_scope text)
returns table (rank bigint, points bigint)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh') as week_start
  ),
  totals as (
    select s.user_id, sum(s.points)::bigint as points
    from public.practice_scores s, bounds b
    where p_scope = 'all' or s.played_at >= b.week_start
    group by s.user_id
  ),
  ranked as (
    select rank() over (order by t.points desc) as rank, t.user_id, t.points
    from totals t
    join public.leaderboard_profiles p on p.user_id = t.user_id and p.opted_in and not p.hidden
  )
  select r.rank, r.points from ranked r where r.user_id = p_user;
$$;

revoke all on function public.leaderboard_top(text, integer) from public, anon, authenticated;
revoke all on function public.leaderboard_rank(uuid, text) from public, anon, authenticated;
grant execute on function public.leaderboard_top(text, integer) to service_role;
grant execute on function public.leaderboard_rank(uuid, text) to service_role;
