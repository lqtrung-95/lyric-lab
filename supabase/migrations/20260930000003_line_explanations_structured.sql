-- Giải nghĩa cả câu đổi sang cấu trúc đầy đủ (dịch, từ vựng, điểm ngữ pháp, ghi chú khác) thay vì 2 cột text đơn
-- giản (meaning, grammar_note). Gộp vào một cột jsonb duy nhất để không phải thêm cột mỗi khi cấu trúc đổi.
-- Cache cũ (nếu có) không còn khớp cấu trúc mới nên xóa hẳn, LLM sẽ tạo lại khi người dùng bấm Giải thích lần sau.
alter table public.line_explanations drop column meaning;
alter table public.line_explanations drop column grammar_note;
alter table public.line_explanations add column data jsonb not null default '{}'::jsonb;
alter table public.line_explanations alter column data drop default;
