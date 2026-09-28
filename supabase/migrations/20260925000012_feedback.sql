-- Góp ý / báo lỗi từ trang Cài đặt. Chỉ server (service role) ghi/đọc: bật RLS và không có policy.
create table public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  category text not null check (category in ('bug', 'feature', 'other')),
  message text not null check (char_length(message) between 5 and 2000),
  page_url text,
  created_at timestamptz not null default now()
);
create index feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;
