-- Bổ sung NetEase Cloud Music vào danh sách nguồn lời hợp lệ (đã thêm ở code nhưng quên sửa constraint này):
-- ghi phân tích của bài lấy lời từ NetEase bị chặn ở DB, dù đã tốn tiền gọi LLM.
alter table public.song_analyses drop constraint song_analyses_lyrics_source_check;
alter table public.song_analyses add constraint song_analyses_lyrics_source_check
  check (lyrics_source in ('youtube_caption', 'lrclib', 'netease'));
