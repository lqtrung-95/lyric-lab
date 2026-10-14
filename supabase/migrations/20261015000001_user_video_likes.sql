-- Yêu thích video: người học bấm tim trên thẻ video hoặc ở màn xem để đánh dấu, dùng lọc lại "Yêu thích" ở trang Video. Giống user_song_likes: RLS theo chủ sở hữu,
-- không có số lượt thích công khai (chưa dùng để xếp hạng). Tài khoản ẩn danh cũng thích được; khi đăng nhập Google, danh sách được gộp theo (hàm gộp bên dưới).
-- Chạy bằng Supabase SQL Editor; chạy lại được. Cần migration video_lessons đã có. Hàm gộp là bản `create or replace` đầy đủ, thay bản của migration chat.
create table if not exists public.user_video_likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null references public.video_lessons (video_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.user_video_likes enable row level security;

drop policy if exists user_video_likes_own on public.user_video_likes;
create policy user_video_likes_own on public.user_video_likes for all to authenticated
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

  -- Bài đã thích: hợp lại.
  insert into public.user_song_likes (user_id, video_id, created_at)
    select p_to, video_id, created_at from public.user_song_likes where user_id = p_from
    on conflict (user_id, video_id) do nothing;

  -- Video đã thích: hợp lại.
  insert into public.user_video_likes (user_id, video_id, created_at)
    select p_to, video_id, created_at from public.user_video_likes where user_id = p_from
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

  -- Chat cộng đồng: tin nhắn đi theo tài khoản đích (giữ nguyên biệt danh đã chụp lúc gửi). Lệnh chặn của tài khoản nguồn chuyển sang đích: nếu không thì người bị
  -- chặn chỉ cần đăng nhập Google vào một tài khoản khác là gửi tin lại được.
  update public.chat_messages set user_id = p_to where user_id = p_from;
  insert into public.chat_blocked_users (user_id) select p_to from public.chat_blocked_users where user_id = p_from
    on conflict (user_id) do nothing;
  delete from public.chat_blocked_users where user_id = p_from;

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
