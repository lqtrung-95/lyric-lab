-- Bộ thủ, cấu tạo (IDS) và nguồn gốc từng chữ Hán cho mục Chiết tự của trang Tra từ.
-- Nguồn: Make Me a Hanzi dictionary.txt (LGPL v3+, từ Unihan và CJKlib). Nạp bằng scripts/dictionary/import-hanzi-info.mts.
-- Dữ liệu công khai: ai cũng đọc được; chỉ service role ghi (không có policy ghi).
create table public.dict_hanzi_info (
  hanzi text primary key,
  radical text not null,
  decomposition text,
  etymology jsonb,
  definition text
);

alter table public.dict_hanzi_info enable row level security;
create policy "dict_hanzi_info public read" on public.dict_hanzi_info for select using (true);
