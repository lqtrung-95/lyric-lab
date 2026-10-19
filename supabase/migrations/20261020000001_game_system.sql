-- Hệ thống game hóa (XP, cấp, huy hiệu, nhiệm vụ, đóng băng chuỗi).
-- XP và cấp KHÔNG có bảng riêng: suy ra từ review_logs, practice_scores, user_song_progress, user_unit_progress, rooms (xem lib/game).
-- Ba bảng mới chỉ lưu những gì không suy ra được:
-- 1) `user_badges`: huy hiệu đã mở, mỗi bậc một hàng (giữ ngày nhận).
-- 2) `user_quest_claims`: thưởng nhiệm vụ đã nhận; khóa chính (user, nhiệm vụ) làm việc nhận thưởng idempotent.
-- 3) `user_streak_freezes`: ngày đã được đóng băng chuỗi tự động; số đóng băng đang giữ = số đã kiếm (claims có freeze_granted) − số hàng ở đây.
-- RLS: chủ sở hữu chỉ ĐỌC; ghi chỉ qua service role ở server (client không tự cấp thưởng). Hàm gộp tài khoản là bản `create or replace` đầy đủ.
-- Chạy bằng Supabase SQL Editor; chạy lại được.
create table if not exists public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null check (char_length(badge_id) between 1 and 60),
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'diamond')),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id, tier)
);

create table if not exists public.user_quest_claims (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Dạng kind:kỳ:mẫu, ví dụ daily:2026-10-20:review10 hoặc weekly:2026-10-19:days5.
  quest_id text not null check (char_length(quest_id) between 1 and 80),
  kind text not null check (kind in ('daily', 'weekly')),
  reward_xp integer not null check (reward_xp between 0 and 1000),
  -- false khi đang giữ đủ số đóng băng tối đa lúc nhận.
  freeze_granted boolean not null default false,
  claimed_at timestamptz not null default now(),
  primary key (user_id, quest_id)
);

create table if not exists public.user_streak_freezes (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  used_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.user_badges enable row level security;
alter table public.user_quest_claims enable row level security;
alter table public.user_streak_freezes enable row level security;

drop policy if exists user_badges_own_read on public.user_badges;
create policy user_badges_own_read on public.user_badges for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists user_quest_claims_own_read on public.user_quest_claims;
create policy user_quest_claims_own_read on public.user_quest_claims for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists user_streak_freezes_own_read on public.user_streak_freezes;
create policy user_streak_freezes_own_read on public.user_streak_freezes for select to authenticated using ((select auth.uid()) = user_id);

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

  -- Game hóa: huy hiệu giữ ngày nhận sớm hơn; thưởng nhiệm vụ đã nhận và ngày đóng băng hợp lại (trùng thì giữ bản của đích).
  insert into public.user_badges (user_id, badge_id, tier, earned_at)
    select p_to, badge_id, tier, earned_at from public.user_badges where user_id = p_from
    on conflict (user_id, badge_id, tier) do update set earned_at = least(public.user_badges.earned_at, excluded.earned_at);
  insert into public.user_quest_claims (user_id, quest_id, kind, reward_xp, freeze_granted, claimed_at)
    select p_to, quest_id, kind, reward_xp, freeze_granted, claimed_at from public.user_quest_claims where user_id = p_from
    on conflict (user_id, quest_id) do nothing;
  insert into public.user_streak_freezes (user_id, day, used_at)
    select p_to, day, used_at from public.user_streak_freezes where user_id = p_from
    on conflict (user_id, day) do nothing;

  delete from public.user_unit_progress where user_id = p_from;
  delete from public.user_badges where user_id = p_from;
  delete from public.user_quest_claims where user_id = p_from;
  delete from public.user_streak_freezes where user_id = p_from;
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
