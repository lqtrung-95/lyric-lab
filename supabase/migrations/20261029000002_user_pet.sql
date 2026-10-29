-- Linh vật đồng hành: mỗi người một dòng (loài, tên, ngày nhận nuôi). Giai đoạn và tâm trạng không lưu, tính lại từ XP và tiến độ hôm nay.
-- Trình duyệt đọc/ghi thẳng bằng RLS theo chủ sở hữu, không qua API.
-- Chạy bằng Supabase SQL Editor; chạy lại được. Chưa chạy thì pet vẫn dùng được, chỉ lưu ở trình duyệt.
create table if not exists public.user_pet (
  user_id uuid primary key references auth.users (id) on delete cascade,
  species text not null check (species in ('dragon', 'cat', 'dog', 'panda', 'owl', 'rabbit', 'fox', 'penguin')),
  name text not null check (char_length(name) between 1 and 16),
  adopted_at timestamptz not null default now(),
  -- Tổng XP lúc nhận nuôi: pet chỉ lớn nhờ XP kiếm được từ đó.
  base_xp integer not null default 0 check (base_xp >= 0),
  updated_at timestamptz not null default now()
);

-- Bảng đã tạo từ bản cũ chưa có cột base_xp thì thêm vào.
alter table public.user_pet add column if not exists base_xp integer not null default 0 check (base_xp >= 0);

-- Bảng tạo từ bản cũ thì mở rộng danh sách loài (thêm thỏ, cáo, cánh cụt).
alter table public.user_pet drop constraint if exists user_pet_species_check;
alter table public.user_pet add constraint user_pet_species_check check (species in ('dragon', 'cat', 'dog', 'panda', 'owl', 'rabbit', 'fox', 'penguin'));

alter table public.user_pet enable row level security;

drop policy if exists user_pet_own on public.user_pet;
create policy user_pet_own on public.user_pet for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
