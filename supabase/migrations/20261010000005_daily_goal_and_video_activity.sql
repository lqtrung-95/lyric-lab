-- Mục tiêu học mỗi ngày và hoạt động học video.
-- 1) `user_profiles.daily_goal`: số mục học mỗi ngày (0 = tắt). "Mục" = một lần chấm thẻ ôn, một câu chép/nói theo video, hoặc một câu hỏi trong lượt luyện tập.
-- 2) `practice_scores.mode` nhận thêm 'dictation' (chép chính tả video) và 'shadowing' (luyện nói video): mỗi câu làm xong là một dòng với 0 điểm
--    (không cộng vào bảng xếp hạng), để chuỗi ngày học và mục tiêu hằng ngày tính cả việc học video.
-- 3) Hàm gộp tài khoản mang theo `daily_goal`. Chạy bằng Supabase SQL Editor; chạy lại được.
alter table public.user_profiles add column if not exists daily_goal smallint not null default 10;
alter table public.user_profiles drop constraint if exists user_profiles_daily_goal_check;
alter table public.user_profiles add constraint user_profiles_daily_goal_check check (daily_goal in (0, 5, 10, 20, 30));

alter table public.practice_scores drop constraint if exists practice_scores_mode_check;
alter table public.practice_scores add constraint practice_scores_mode_check
  check (mode in ('pinyin', 'cloze', 'listen', 'match', 'karaoke', 'dictation', 'shadowing'));

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

  delete from public.user_song_progress where user_id = p_from;
  delete from public.user_cards where user_id = p_from;
  delete from public.user_known_terms where user_id = p_from;
  delete from public.user_profiles where user_id = p_from;
  delete from public.user_song_likes where user_id = p_from;
  delete from public.leaderboard_profiles where user_id = p_from;
  delete from public.song_reports where user_id = p_from;
end;
$$;

revoke all on function public.merge_user_data(uuid, uuid) from public, anon, authenticated;
grant execute on function public.merge_user_data(uuid, uuid) to service_role;
