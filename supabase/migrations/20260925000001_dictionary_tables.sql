-- Từ điển tiếng Trung dùng chung (chỉ đọc với client, ghi bằng service role).
-- Nguồn: CC-CEDICT (CC BY-SA 4.0, MDBG), danh sách HSK 3.0 từ complete-hsk-vocabulary (MIT),
-- Unihan kVietnamese (Unicode License). Cần ghi công CC-CEDICT trong sản phẩm.

create table public.dict_words (
  id bigint generated always as identity primary key,
  simplified text not null,
  traditional text not null,
  pinyin text not null,            -- pinyin có dấu thanh
  meanings text[] not null default '{}',
  hsk_level smallint check (hsk_level between 1 and 7),  -- 1–6; 7 = nhóm 7–9 của HSK 3.0
  frequency integer,
  unique (simplified, traditional, pinyin)
);
create index dict_words_simplified_idx on public.dict_words (simplified);

create table public.dict_hanzi_sino_viet (
  hanzi text primary key,
  readings text[] not null         -- âm Hán Việt (Unihan kVietnamese)
);

alter table public.dict_words enable row level security;
alter table public.dict_hanzi_sino_viet enable row level security;

-- Dữ liệu công khai: ai cũng đọc được; không có policy ghi nên chỉ service role (bỏ qua RLS) ghi được.
create policy "dict_words public read" on public.dict_words for select using (true);
create policy "dict_hanzi_sino_viet public read" on public.dict_hanzi_sino_viet for select using (true);
