-- Độ lệch lời so với video do người dùng tự chỉnh, theo từng bài (giây; dương = lời hiện muộn hơn so với bản gốc).
alter table public.user_song_progress
  add column lyric_offset_sec real not null default 0 check (lyric_offset_sec between -60 and 60);
