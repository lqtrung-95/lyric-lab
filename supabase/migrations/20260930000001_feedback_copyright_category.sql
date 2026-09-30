-- Thêm hạng mục "copyright" (yêu cầu gỡ nội dung do vi phạm bản quyền) vào feedback, để tách biệt khỏi báo lỗi/đề xuất
-- tính năng và admin ưu tiên xử lý đúng hạn 72 giờ theo cam kết ở docs/PRD.md mục 8.
alter table public.feedback drop constraint feedback_category_check;
alter table public.feedback add constraint feedback_category_check check (category in ('bug', 'feature', 'copyright', 'other'));
