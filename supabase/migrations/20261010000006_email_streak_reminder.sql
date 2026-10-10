-- Email "chuỗi ngày sắp đứt": mốc lần gửi gần nhất để không gửi dồn (tối đa một email mỗi 3 ngày). Dùng chung công tắc `reminder_enabled`
-- và link hủy nhận với email nhắc quay lại. Chạy bằng Supabase SQL Editor; chạy lại được.
alter table public.email_prefs add column if not exists last_streak_at timestamptz;
