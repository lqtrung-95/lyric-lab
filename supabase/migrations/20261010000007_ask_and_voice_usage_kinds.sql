-- Hạn mức cho hai tính năng AI mới: hỏi thêm về một câu ('ask') và nhờ AI nhận xét phát âm từ ghi âm ('voice'), tính theo 24 giờ.
-- Chạy bằng Supabase SQL Editor; chạy lại được (xóa constraint cũ rồi tạo lại).
alter table public.usage_events drop constraint if exists usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('analyze', 'explain', 'tts', 'score', 'room', 'room_join', 'ask', 'voice'));
