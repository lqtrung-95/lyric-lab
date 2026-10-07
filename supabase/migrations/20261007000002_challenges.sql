-- Thách đấu không cần cùng lúc: một bộ 10 câu cố định, mỗi người chơi lúc nào cũng được rồi so điểm. Và báo cáo người chơi.
-- Tất cả bảng bật RLS và không có policy: chỉ server (service role) đọc/ghi; đáp án đúng nằm ở challenge_questions nên không lộ cho client.
-- Chạy bằng Supabase SQL Editor.
create table public.challenges (
  code text primary key,
  creator_id uuid references auth.users (id) on delete set null,
  creator_name text not null,
  video_id text not null,
  question_count smallint not null check (question_count > 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create table public.challenge_questions (
  code text not null references public.challenges (code) on delete cascade,
  idx smallint not null check (idx >= 0),
  payload jsonb not null,
  correct_index smallint not null check (correct_index between 0 and 3),
  correct_term text not null,
  primary key (code, idx)
);

create table public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.challenges (code) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  player_name text not null,
  started_at timestamptz not null default now(),
  last_answer_at timestamptz,
  finished_at timestamptz,
  total_points integer not null default 0,
  correct_count smallint not null default 0,
  answered_count smallint not null default 0
);
-- Mỗi người chỉ có một lượt cho mỗi thử thách (làm lại để nâng điểm sẽ phá tính công bằng của bảng điểm).
create unique index challenge_attempts_one_per_user on public.challenge_attempts (code, user_id) where user_id is not null;
create index challenge_attempts_rank_idx on public.challenge_attempts (code, total_points desc) where finished_at is not null;

create table public.challenge_answers (
  attempt_id uuid not null references public.challenge_attempts (id) on delete cascade,
  idx smallint not null check (idx >= 0),
  -- -1 = hết giờ, không chọn.
  choice smallint not null check (choice between -1 and 3),
  correct boolean not null,
  points integer not null check (points >= 0),
  elapsed_ms integer not null check (elapsed_ms >= 0),
  primary key (attempt_id, idx)
);

create table public.player_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid references auth.users (id) on delete set null,
  -- Nơi xảy ra: 'room' hoặc 'challenge', kèm mã phòng/thử thách.
  context text not null check (context in ('room', 'challenge')),
  context_code text not null,
  reported_name text not null,
  reason text not null check (reason in ('offensive_name', 'cheating', 'harassment', 'other')),
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;
alter table public.challenge_questions enable row level security;
alter table public.challenge_attempts enable row level security;
alter table public.challenge_answers enable row level security;
alter table public.player_reports enable row level security;
