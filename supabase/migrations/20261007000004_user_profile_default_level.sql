-- Level mặc định của tài khoản mới là HSK 1 ("chưa biết gì"), khớp DEFAULT_LEVEL ở app. Đặt tường minh để cột DB và app luôn cùng một giá trị: nếu đã
-- chạy bản trước của migration này (đặt mặc định 3), chạy lại bản này để đưa về 1. Chỉ ảnh hưởng các hàng tạo SAU migration; hàng đã có giữ nguyên level.
-- Chạy bằng Supabase SQL Editor.
alter table public.user_profiles alter column level set default 1;
