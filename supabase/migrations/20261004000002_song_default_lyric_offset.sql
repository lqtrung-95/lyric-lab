-- Độ lệch lời mặc định của từng bài, do quản trị viên chỉnh một lần và áp cho mọi người dùng (giây; dương = lời hiện muộn
-- hơn so với bản gốc). Độ lệch người dùng tự chỉnh (user_song_progress.lyric_offset_sec) cộng thêm lên trên mức này.
-- Đặt ở bảng songs (không phải song_analyses) để không mất khi phân tích lại bài.
alter table public.songs
  add column lyric_offset_sec real not null default 0 check (lyric_offset_sec between -60 and 60);
