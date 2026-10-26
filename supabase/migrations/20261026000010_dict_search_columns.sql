-- Chỉ mục cho trang Tra từ: tìm theo pinyin không dấu, theo nghĩa tiếng Anh và tiền tố chữ Hán trên ~125 nghìn mục.
-- Code tra từ vẫn chạy khi chưa áp migration này (rớt về truy vấn chậm hơn); áp xong là dùng chỉ mục ngay, không cần deploy lại.

create extension if not exists pg_trgm with schema extensions;

-- Pinyin "phẳng": chỉ a–z, không dấu thanh/khoảng trắng, ü → v ("nǚ" → "nv"). Phải khớp `plainPinyin` ở lib/tra-tu/pinyin-plain.ts.
create or replace function public.dict_pinyin_plain(p text) returns text
language sql immutable parallel safe as $$
  select regexp_replace(
    translate(lower(p), 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü', 'aaaaeeeeiiiioooouuuuvvvvv'),
    '[^a-z]', '', 'g')
$$;

-- Nghĩa tiếng Anh gộp thành một chuỗi thường để dùng chỉ mục trigram (array_to_string chỉ STABLE nên bọc thành hàm immutable cho cột sinh).
create or replace function public.dict_meanings_text(m text[]) returns text
language sql immutable parallel safe as $$ select lower(array_to_string(m, ' | ')) $$;

alter table public.dict_words
  add column if not exists pinyin_plain text generated always as (public.dict_pinyin_plain(pinyin)) stored,
  add column if not exists meanings_text text generated always as (public.dict_meanings_text(meanings)) stored;

create index if not exists dict_words_pinyin_plain_idx on public.dict_words (pinyin_plain text_pattern_ops);
create index if not exists dict_words_simplified_prefix_idx on public.dict_words (simplified text_pattern_ops);
create index if not exists dict_words_traditional_prefix_idx on public.dict_words (traditional text_pattern_ops);
create index if not exists dict_words_meanings_trgm_idx on public.dict_words using gin (meanings_text extensions.gin_trgm_ops);
