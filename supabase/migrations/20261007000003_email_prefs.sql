-- Tùy chọn email của từng tài khoản có email thật (đăng nhập Google): đã gửi chào mừng chưa, bật/tắt tổng kết tuần và nhắc quay lại,
-- mốc lần gửi gần nhất (để không gửi dồn) và mã hủy nhận dùng trong link cuối email. Bật RLS và không có policy: chỉ server đọc/ghi.
-- Chạy bằng Supabase SQL Editor.
create table public.email_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  welcome_sent_at timestamptz,
  weekly_enabled boolean not null default true,
  reminder_enabled boolean not null default true,
  last_weekly_at timestamptz,
  last_reminder_at timestamptz,
  unsubscribe_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now()
);
alter table public.email_prefs enable row level security;

-- Người đã có tài khoản Google từ trước không nhận email chào mừng muộn: đánh dấu đã gửi. (Họ vẫn nhận tổng kết tuần và nhắc quay lại
-- theo mặc định, có link hủy ở mọi email.)
insert into public.email_prefs (user_id, welcome_sent_at)
select id, now() from auth.users where email is not null and coalesce(is_anonymous, false) = false
on conflict (user_id) do nothing;
