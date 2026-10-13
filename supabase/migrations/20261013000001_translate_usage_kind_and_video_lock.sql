-- Người học tự bấm "Dịch phần còn lại bằng AI" cho video còn câu chưa có bản dịch:
-- (1) loại hạn mức mới 'translate' (theo 24 giờ); (2) khóa ngắn theo video để hai người không cùng dịch một video một lúc.
-- Chạy bằng Supabase SQL Editor, chạy TRƯỚC khi deploy; chạy lại được.
alter table public.usage_events drop constraint if exists usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('analyze', 'explain', 'tts', 'score', 'room', 'room_join', 'ask', 'voice', 'translate'));

-- Hết hạn tự động (khóa cũ không chặn mãi nếu tiến trình chết giữa chừng).
alter table public.video_lessons add column if not exists translate_lock_until timestamptz;
