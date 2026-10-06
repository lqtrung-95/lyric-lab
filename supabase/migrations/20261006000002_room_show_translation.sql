-- Tùy chọn của phòng: hiện nghĩa tiếng Việt của cả dòng lời ngay khi câu đang mở hay không. Mặc định ẩn (nghĩa dòng thường trùng nghĩa của
-- một đáp án nên người chơi có thể chọn mà không cần nghe); sau khi trả lời hoặc câu đóng thì luôn hiện.
alter table public.rooms add column show_translation boolean not null default false;
