-- Level mặc định của tài khoản mới là HSK 3 (khớp DEFAULT_LEVEL ở app). Trước đây cột mặc định là 1: khi app ghi hồ sơ lần đầu mà chưa kèm level
-- (ví dụ đổi số thẻ mới mỗi ngày), hàng mới nhận level = 1 và đè lên mặc định của app. Chỉ ảnh hưởng các hàng tạo SAU migration này; tài khoản đã có
-- giữ nguyên level hiện tại (không phân biệt được "đã chọn 1" với "nhận mặc định 1"). Chạy bằng Supabase SQL Editor.
alter table public.user_profiles alter column level set default 3;
