-- Báo cả bài phân tích sai (lời không khớp video, sai ngôn ngữ, không phải bài hát). Mỗi người dùng báo một bài một lần.
-- Chỉ server (service role) ghi/đọc: bật RLS và không có policy. Đủ số người báo thì server đặt songs.listed = false.
create table public.song_reports (
  id bigint generated always as identity primary key,
  video_id text not null references public.songs (video_id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (reason in ('lyrics_mismatch', 'wrong_language', 'not_a_song')),
  created_at timestamptz not null default now(),
  unique (video_id, user_id)
);
create index song_reports_video_idx on public.song_reports (video_id);

alter table public.song_reports enable row level security;
