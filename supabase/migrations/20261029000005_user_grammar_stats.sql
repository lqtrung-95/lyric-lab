-- Thống kê đúng/sai theo mẫu ngữ pháp (bản đồ lỗi cá nhân): mỗi người một dòng, `stats` là JSON { idMẫu: { right, wrong, last } }.
-- Trình duyệt đọc/ghi thẳng bằng RLS theo chủ sở hữu, không qua API; gộp hai bản bằng cách lấy số lớn hơn của từng trường nên chạy lại an toàn.
-- Chạy bằng Supabase SQL Editor; chạy lại được. Chưa chạy thì thống kê vẫn dùng được, chỉ lưu ở trình duyệt.
create table if not exists public.user_grammar_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stats jsonb not null default '{}'::jsonb check (jsonb_typeof(stats) = 'object' and pg_column_size(stats) < 20000),
  updated_at timestamptz not null default now()
);

alter table public.user_grammar_stats enable row level security;

drop policy if exists user_grammar_stats_own on public.user_grammar_stats;
create policy user_grammar_stats_own on public.user_grammar_stats for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
