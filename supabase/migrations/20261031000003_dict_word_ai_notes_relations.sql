-- Thêm loại 'relations' (từ đồng nghĩa, trái nghĩa do AI gợi ý, chỉ lưu danh sách chữ Hán; pinyin và nghĩa lấy từ từ điển khi hiển thị) vào `dict_word_ai_notes`.
-- Chạy bằng Supabase SQL Editor; chạy lại được. Chưa chạy thì nút "Tìm từ đồng nghĩa, trái nghĩa" báo chưa dùng được, trang Tra từ vẫn hoạt động.
alter table public.dict_word_ai_notes drop constraint if exists dict_word_ai_notes_kind_check;
alter table public.dict_word_ai_notes add constraint dict_word_ai_notes_kind_check check (kind in ('meaning', 'etymology', 'relations'));
