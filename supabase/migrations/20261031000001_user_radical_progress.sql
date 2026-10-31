-- Tiến độ học bộ thủ: mỗi người một dòng, `progress` là JSON { known: [số thứ tự bộ], stats: { "85": { right, wrong, last } } }.
-- Trình duyệt đọc/ghi thẳng bằng RLS theo chủ sở hữu, không qua API; gộp hai bản bằng hợp các bộ đã biết và số lớn hơn của từng trường nên chạy lại an toàn.
-- Chạy bằng Supabase SQL Editor; chạy lại được. Chưa chạy thì tiến độ vẫn dùng được, chỉ lưu ở trình duyệt.
create table if not exists public.user_radical_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  progress jsonb not null default '{}'::jsonb check (jsonb_typeof(progress) = 'object' and pg_column_size(progress) < 20000),
  updated_at timestamptz not null default now()
);

alter table public.user_radical_progress enable row level security;

drop policy if exists user_radical_progress_own on public.user_radical_progress;
create policy user_radical_progress_own on public.user_radical_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
