-- Khung khóa học và chỉ mục từ↔câu.
-- 1) `courses` / `course_units`: lộ trình (HSK, tình huống, tập viết), mỗi bài (unit) có nội dung jsonb. Dữ liệu công khai (ai cũng đọc), chỉ service role ghi.
-- 2) `user_unit_progress`: tiến độ từng người theo từng bài, RLS theo chủ sở hữu; hàm gộp tài khoản mang theo.
-- 3) `term_sentences`: từ nào xuất hiện ở dòng nào của video đã duyệt, kèm điểm chất lượng câu. Chỉ tham chiếu (video_id + line_idx), KHÔNG lưu lời;
--    lời đọc từ `video_lessons` khi hiển thị. Script `scripts/build-term-sentences.mts` xây lại được bất cứ lúc nào (idempotent).
-- Chạy bằng Supabase SQL Editor; chạy lại được. Hàm gộp là bản `create or replace` đầy đủ, thay bản của migration video yêu thích (và khôi phục việc mang theo `daily_goal`).
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  kind text not null check (kind in ('hsk', 'situation', 'writing')),
  title text not null,
  -- Cấp HSK của khóa (1-6); null nếu không gắn cấp.
  level smallint check (level between 1 and 7),
  sort_order integer not null default 0,
  -- draft: đang soạn; listed: hiện cho người học.
  status text not null default 'draft' check (status in ('draft', 'listed')),
  created_at timestamptz not null default now()
);

create table if not exists public.course_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  idx integer not null,
  title text not null,
  summary text not null default '',
  -- Danh sách mục học (từ, hội thoại, chữ cần viết...) và các bước; cấu trúc do `lib/courses` định nghĩa và kiểm tra bằng zod.
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'listed')),
  created_at timestamptz not null default now(),
  unique (course_id, idx)
);

create table if not exists public.user_unit_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  unit_id uuid not null references public.course_units (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  best_score smallint not null default 0 check (best_score between 0 and 100),
  -- Bước đang làm dở và điểm từng bước (ví dụ {"step":2,"scores":{"quiz":80}}).
  step_state jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

create table if not exists public.term_sentences (
  term text not null,
  video_id text not null references public.video_lessons (video_id) on delete cascade,
  line_idx integer not null,
  -- 0-100, cao hơn = câu ví dụ tốt hơn (xem lib/courses/score-sentence.ts).
  quality smallint not null check (quality between 0 and 100),
  primary key (term, video_id, line_idx)
);
create index if not exists term_sentences_term_quality_idx on public.term_sentences (term, quality desc);

alter table public.courses enable row level security;
alter table public.course_units enable row level security;
alter table public.user_unit_progress enable row level security;
alter table public.term_sentences enable row level security;

drop policy if exists courses_public_read on public.courses;
create policy courses_public_read on public.courses for select using (status = 'listed');
drop policy if exists course_units_public_read on public.course_units;
create policy course_units_public_read on public.course_units for select using (status = 'listed');
-- term_sentences chỉ chứa tham chiếu, đọc bằng service role ở server; không mở cho client.
drop policy if exists user_unit_progress_own on public.user_unit_progress;
create policy user_unit_progress_own on public.user_unit_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.merge_user_data(p_from uuid, p_to uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_from = p_to then
    return;
  end if;

  -- Gồm cả daily_goal: các hàm gộp từ migration chat đến nay đã làm rơi cột này (mục tiêu ngày không theo sang tài khoản Google), bản này sửa lại.
  insert into public.user_profiles (user_id, level, new_cards_per_day, timezone, onboarded, daily_goal)
    select p_to, level, new_cards_per_day, timezone, onboarded, daily_goal from public.user_profiles where user_id = p_from
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

  -- Bài đã thích: hợp lại.
  insert into public.user_song_likes (user_id, video_id, created_at)
    select p_to, video_id, created_at from public.user_song_likes where user_id = p_from
    on conflict (user_id, video_id) do nothing;

  -- Video đã thích: hợp lại.
  insert into public.user_video_likes (user_id, video_id, created_at)
    select p_to, video_id, created_at from public.user_video_likes where user_id = p_from
    on conflict (user_id, video_id) do nothing;

  -- Tiến độ bài học: giữ điểm cao hơn, đã hoàn thành thì giữ hoàn thành, bước dở lấy của bản cập nhật gần nhất.
  insert into public.user_unit_progress (user_id, unit_id, status, best_score, step_state, completed_at, updated_at)
    select p_to, unit_id, status, best_score, step_state, completed_at, updated_at from public.user_unit_progress where user_id = p_from
    on conflict (user_id, unit_id) do update set
      status = case when public.user_unit_progress.status = 'completed' or excluded.status = 'completed' then 'completed' else 'in_progress' end,
      best_score = greatest(public.user_unit_progress.best_score, excluded.best_score),
      step_state = case when excluded.updated_at > public.user_unit_progress.updated_at then excluded.step_state else public.user_unit_progress.step_state end,
      completed_at = coalesce(public.user_unit_progress.completed_at, excluded.completed_at),
      updated_at = greatest(excluded.updated_at, public.user_unit_progress.updated_at);

  -- Điểm luyện tập: mỗi dòng là một lượt chơi riêng, chuyển nguyên sang.
  update public.practice_scores set user_id = p_to where user_id = p_from;

  -- Hồ sơ bảng xếp hạng (mỗi người một hồ sơ, biệt danh duy nhất): chỉ chuyển khi đích chưa có, còn lại đích thắng.
  update public.leaderboard_profiles set user_id = p_to
    where user_id = p_from and not exists (select 1 from public.leaderboard_profiles where user_id = p_to);

  -- Báo sai bài (mỗi người một lần cho một bài): bỏ qua bài đích đã báo rồi.
  update public.song_reports s set user_id = p_to
    where s.user_id = p_from
      and not exists (select 1 from public.song_reports t where t.video_id = s.video_id and t.user_id = p_to);

  -- Phòng thi đấu: lịch sử chơi đi theo tài khoản đích. Nếu hai tài khoản từng chơi cùng một phòng (người ẩn danh gộp vào chính
  -- tài khoản đã đấu với mình) thì giữ hàng và câu trả lời của đích, bỏ phía nguồn (khóa (room_id, user_id) không cho giữ cả hai).
  delete from public.room_answers where user_id = p_from and room_id in (select room_id from public.room_players where user_id = p_to);
  delete from public.room_players where user_id = p_from and room_id in (select room_id from public.room_players where user_id = p_to);
  update public.room_answers set user_id = p_to where user_id = p_from;
  update public.room_players set user_id = p_to where user_id = p_from;
  update public.rooms set host_id = p_to where host_id = p_from;
  update public.rooms set winner_id = p_to where winner_id = p_from;

  -- Chat cộng đồng: tin nhắn đi theo tài khoản đích (giữ nguyên biệt danh đã chụp lúc gửi). Lệnh chặn của tài khoản nguồn chuyển sang đích: nếu không thì người bị
  -- chặn chỉ cần đăng nhập Google vào một tài khoản khác là gửi tin lại được.
  update public.chat_messages set user_id = p_to where user_id = p_from;
  insert into public.chat_blocked_users (user_id) select p_to from public.chat_blocked_users where user_id = p_from
    on conflict (user_id) do nothing;
  delete from public.chat_blocked_users where user_id = p_from;

  delete from public.user_unit_progress where user_id = p_from;
  delete from public.user_song_progress where user_id = p_from;
  delete from public.user_cards where user_id = p_from;
  delete from public.user_known_terms where user_id = p_from;
  delete from public.user_profiles where user_id = p_from;
  delete from public.user_song_likes where user_id = p_from;
  delete from public.user_video_likes where user_id = p_from;
  delete from public.leaderboard_profiles where user_id = p_from;
  delete from public.song_reports where user_id = p_from;
end;
$$;

revoke all on function public.merge_user_data(uuid, uuid) from public, anon, authenticated;
grant execute on function public.merge_user_data(uuid, uuid) to service_role;
