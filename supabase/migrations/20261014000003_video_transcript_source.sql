-- Video không có phụ đề: người học nhờ AI nhận dạng giọng nói (Gemini nghe link YouTube) hoặc admin chạy Whisper trên máy.
-- (1) loại hạn mức mới 'transcribe' (mỗi đoạn 4 phút nghe tính 1 lượt, theo 24 giờ);
-- (2) video_lessons.transcript_source: 'captions' = phụ đề có sẵn (người làm/người dùng dán), 'auto' = nhận dạng tự động, có thể sai chữ hoặc lệch giờ (giao diện hiện cảnh báo).
-- Chạy bằng Supabase SQL Editor, chạy TRƯỚC khi deploy; chạy lại được.
alter table public.usage_events drop constraint if exists usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('analyze', 'explain', 'tts', 'score', 'room', 'room_join', 'ask', 'voice', 'translate', 'chat', 'transcribe'));

alter table public.video_lessons add column if not exists transcript_source text not null default 'captions';
alter table public.video_lessons drop constraint if exists video_lessons_transcript_source_check;
alter table public.video_lessons add constraint video_lessons_transcript_source_check check (transcript_source in ('captions', 'auto'));
