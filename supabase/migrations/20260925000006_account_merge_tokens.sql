-- Mã một lần chứng minh quyền sở hữu tài khoản ẩn danh khi gộp dữ liệu vào tài khoản Google đã có.
-- Chỉ lưu băm của mã. Chỉ server (service role) đọc/ghi: bật RLS và không có policy.
create table public.account_merge_tokens (
  token_hash text primary key,
  from_user uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index account_merge_tokens_from_idx on public.account_merge_tokens (from_user);
alter table public.account_merge_tokens enable row level security;
