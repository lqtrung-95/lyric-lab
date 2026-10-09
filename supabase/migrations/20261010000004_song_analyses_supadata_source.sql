-- Cho phép nguồn lời "supadata": phụ đề có sẵn của YouTube lấy qua Supadata, dùng khi mọi nguồn khác (YouTube trực tiếp, LRCLIB, NetEase) đều không có lời.
alter table public.song_analyses drop constraint song_analyses_lyrics_source_check;
alter table public.song_analyses add constraint song_analyses_lyrics_source_check
  check (lyrics_source in ('youtube_caption', 'lrclib', 'netease', 'supadata'));
