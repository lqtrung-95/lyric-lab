-- Kênh theo dõi (VD-04): admin đánh dấu kênh nào được quét video mới bằng nút "Nạp video mới của các kênh đang theo dõi" ở /admin/videos.
-- Chưa chạy migration này thì danh sách kênh ở trang quản trị báo thiếu cột; nạp video thủ công theo kênh/từ khóa vẫn chạy bình thường.
alter table public.video_sources add column if not exists watching boolean not null default false;
