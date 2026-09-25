-- Dữ liệu theo người dùng (tài khoản ẩn danh hoặc Google): hồ sơ, từ đã biết, thẻ ôn FSRS, nhật ký ôn, tiến độ bài.
-- Mọi bảng bật RLS: chỉ chủ sở hữu (auth.uid()) đọc/ghi hàng của mình. Người dùng ẩn danh cũng có vai trò `authenticated`.

create table public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  level smallint not null default 1 check (level between 1 and 7),
  new_cards_per_day smallint not null default 15 check (new_cards_per_day between 0 and 100),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_known_terms (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,           -- vd. 'vocab:城市'
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

-- Thẻ ôn: ảnh chụp tối thiểu của mục học + trạng thái FSRS. Không lưu lời bài hát:
-- khi ôn, lời câu lấy từ cache toàn cục theo (video_id, line_index), nên gỡ bài thì thẻ không còn lời.
create table public.user_cards (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  kind text not null check (kind in ('vocab', 'grammar')),
  term text not null,
  pinyin text,
  han_viet text,
  hsk_level smallint,
  meaning text not null,
  video_id text,                    -- bài nguồn để nghe lại đúng câu
  line_index integer,
  -- Trạng thái FSRS (state: 0 New, 1 Learning, 2 Review, 3 Relearning)
  due timestamptz not null default now(),
  stability real not null default 0,
  difficulty real not null default 0,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state smallint not null default 0 check (state between 0 and 3),
  last_review timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_key)
);
create index user_cards_due_idx on public.user_cards (user_id, due);

create table public.review_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  rating smallint not null check (rating between 1 and 4),   -- 1 Quên, 2 Khó, 3 Được, 4 Dễ
  state smallint not null check (state between 0 and 3),     -- trạng thái thẻ trước khi chấm
  due timestamptz not null,
  stability real not null,
  difficulty real not null,
  elapsed_days integer not null,
  scheduled_days integer not null,
  reviewed_at timestamptz not null default now()
);
create index review_logs_user_idx on public.review_logs (user_id, reviewed_at desc);

create table public.user_song_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null references public.songs (video_id) on delete cascade,
  last_position_sec real not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

-- Sổ đếm lượt dùng tốn tài nguyên (phân tích bài mới, giải nghĩa bằng LLM) để giới hạn theo tài khoản.
-- Chỉ server (service role) ghi/đọc: bật RLS và không có policy.
create table public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('analyze', 'explain')),
  created_at timestamptz not null default now()
);
create index usage_events_user_kind_idx on public.usage_events (user_id, kind, created_at desc);

alter table public.usage_events enable row level security;

-- RLS theo chủ sở hữu.
alter table public.user_profiles enable row level security;
alter table public.user_known_terms enable row level security;
alter table public.user_cards enable row level security;
alter table public.review_logs enable row level security;
alter table public.user_song_progress enable row level security;

create policy user_profiles_own on public.user_profiles for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_known_terms_own on public.user_known_terms for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_cards_own on public.user_cards for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy review_logs_own_read on public.review_logs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy review_logs_own_insert on public.review_logs for insert to authenticated
  with check ((select auth.uid()) = user_id);
-- Hoàn tác lần chấm vừa rồi cần xóa log của chính mình.
create policy review_logs_own_delete on public.review_logs for delete to authenticated
  using ((select auth.uid()) = user_id);
create policy user_song_progress_own on public.user_song_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Ghi nhận một lượt dùng nếu còn hạn mức trong `p_window_hours` giờ gần nhất. Trả true nếu được phép.
-- Khóa tư vấn theo (user, kind) để hai yêu cầu song song không cùng vượt hạn mức.
create function public.consume_usage(p_user uuid, p_kind text, p_limit integer, p_window_hours integer default 24)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  used integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':' || p_kind, 0));
  delete from public.usage_events
    where user_id = p_user and kind = p_kind and created_at < now() - make_interval(hours => p_window_hours);
  select count(*) into used from public.usage_events where user_id = p_user and kind = p_kind;
  if used >= p_limit then
    return false;
  end if;
  insert into public.usage_events (user_id, kind) values (p_user, p_kind);
  return true;
end;
$$;

-- Gộp dữ liệu của tài khoản ẩn danh `p_from` vào tài khoản đã đăng nhập `p_to` (dùng khi Google đó đã có tài khoản).
-- Luật: cài đặt của `p_to` thắng; thẻ trùng giữ bản nhiều lượt ôn hơn (bằng nhau thì bản ôn gần nhất);
-- từ đã biết hợp lại; nhật ký ôn chuyển sang; tiến độ bài giữ bản mới hơn. Cả hàm chạy trong một giao dịch.
create function public.merge_user_data(p_from uuid, p_to uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_from = p_to then
    return;
  end if;

  insert into public.user_profiles (user_id, level, new_cards_per_day, timezone, onboarded)
    select p_to, level, new_cards_per_day, timezone, onboarded from public.user_profiles where user_id = p_from
    on conflict (user_id) do nothing;

  insert into public.user_known_terms (user_id, item_key, created_at)
    select p_to, item_key, created_at from public.user_known_terms where user_id = p_from
    on conflict (user_id, item_key) do nothing;

  -- Thẻ trùng: bản của p_from thay bản của p_to khi có nhiều lượt ôn hơn (hoặc bằng nhau và ôn gần nhất hơn).
  update public.user_cards t set
      kind = f.kind, term = f.term, pinyin = f.pinyin, han_viet = f.han_viet, hsk_level = f.hsk_level,
      meaning = f.meaning, video_id = f.video_id, line_index = f.line_index, due = f.due,
      stability = f.stability, difficulty = f.difficulty, elapsed_days = f.elapsed_days,
      scheduled_days = f.scheduled_days, learning_steps = f.learning_steps, reps = f.reps,
      lapses = f.lapses, state = f.state, last_review = f.last_review, updated_at = now()
    from public.user_cards f
    where f.user_id = p_from and t.user_id = p_to and t.item_key = f.item_key
      and (f.reps > t.reps
           or (f.reps = t.reps and coalesce(f.last_review, 'epoch') > coalesce(t.last_review, 'epoch')));

  insert into public.user_cards (user_id, item_key, kind, term, pinyin, han_viet, hsk_level, meaning, video_id, line_index,
      due, stability, difficulty, elapsed_days, scheduled_days, learning_steps, reps, lapses, state, last_review, created_at)
    select p_to, item_key, kind, term, pinyin, han_viet, hsk_level, meaning, video_id, line_index,
      due, stability, difficulty, elapsed_days, scheduled_days, learning_steps, reps, lapses, state, last_review, created_at
    from public.user_cards where user_id = p_from
    on conflict (user_id, item_key) do nothing;

  update public.review_logs set user_id = p_to where user_id = p_from;
  update public.usage_events set user_id = p_to where user_id = p_from;

  insert into public.user_song_progress (user_id, video_id, last_position_sec, completed, updated_at)
    select p_to, video_id, last_position_sec, completed, updated_at from public.user_song_progress where user_id = p_from
    on conflict (user_id, video_id) do update set
      last_position_sec = case when excluded.updated_at > public.user_song_progress.updated_at
                               then excluded.last_position_sec else public.user_song_progress.last_position_sec end,
      completed = public.user_song_progress.completed or excluded.completed,
      updated_at = greatest(excluded.updated_at, public.user_song_progress.updated_at);

  delete from public.user_song_progress where user_id = p_from;
  delete from public.user_cards where user_id = p_from;
  delete from public.user_known_terms where user_id = p_from;
  delete from public.user_profiles where user_id = p_from;
end;
$$;

-- Hai hàm này chỉ server (service role) được gọi.
revoke all on function public.consume_usage(uuid, text, integer, integer) from public, anon, authenticated;
revoke all on function public.merge_user_data(uuid, uuid) from public, anon, authenticated;
grant execute on function public.consume_usage(uuid, text, integer, integer) to service_role;
grant execute on function public.merge_user_data(uuid, uuid) to service_role;
