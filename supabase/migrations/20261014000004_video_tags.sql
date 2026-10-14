-- Thẻ chủ đề của video (hoạt hình, vlog, đời sống, du lịch, hài, thiếu nhi, phim ngắn, podcast) để lọc ở trang Video.
-- Danh sách thẻ hợp lệ nằm ở code (lib/video/video-tags.ts), cột chỉ lưu mã thẻ; AI gán lúc nạp video, admin sửa tay ở /admin/videos/<id>.
-- Chạy bằng Supabase SQL Editor; chạy lại được. Code đã chịu được việc cột chưa có (danh sách video vẫn hiện, chỉ chưa có thẻ), nhưng cần cột này để lưu thẻ.
alter table public.video_lessons add column if not exists tags text[] not null default '{}';
