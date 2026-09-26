-- Cho phép sổ đếm lượt dùng ghi nhận thêm loại 'tts' (tổng hợp giọng đọc mới, tốn hạn mức dịch vụ bên ngoài).
alter table public.usage_events drop constraint usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check check (kind in ('analyze', 'explain', 'tts'));
