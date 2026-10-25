-- Tiến độ Khám phá theo tài khoản: mỗi người một dòng cho mỗi loại ('progress' = từ đã học ở các cảnh, 'story' = cốt truyện phá án),
-- lưu nguyên khối JSON do trình duyệt gửi (đã kiểm tra khi đọc lại). Trình duyệt đọc/ghi thẳng bằng RLS theo chủ sở hữu, không qua API.
-- Chạy bằng Supabase SQL Editor; chạy lại được. Chưa chạy thì game vẫn chơi bình thường (chỉ lưu ở trình duyệt).
-- Không thêm vào hàm gộp tài khoản: dữ liệu vẫn còn trong trình duyệt và được gộp lại khi vào Khám phá.
create table if not exists public.user_explore_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('progress', 'story')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table public.user_explore_state enable row level security;

drop policy if exists user_explore_state_own on public.user_explore_state;
create policy user_explore_state_own on public.user_explore_state for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
