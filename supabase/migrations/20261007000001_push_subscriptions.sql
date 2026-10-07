-- Đăng ký nhận thông báo đẩy (nhắc học). Mỗi dòng là một trình duyệt/thiết bị; khóa chính là endpoint do trình duyệt cấp.
-- Bật RLS và không có policy: chỉ server (service role) đọc/ghi. Chạy bằng Supabase SQL Editor.
create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  -- Lần gửi nhắc gần nhất, để không gửi hai lần trong cùng một ngày dù cron chạy lại.
  last_sent_at timestamptz
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
