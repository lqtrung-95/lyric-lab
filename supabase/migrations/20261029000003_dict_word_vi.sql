-- Nghĩa tiếng Việt ngắn của từ HSK (từ điển CC-CEDICT chỉ có tiếng Anh), sinh bằng AI rồi người duyệt (scripts/gloss-hsk-vocab.mts).
-- Dùng cho trang Từ vựng HSK và để tạo thẻ ôn từ trang đó. `reviewed` = người đã rà (sửa tay thì đặt true); `prompt_version` đổi khi prompt đổi.
-- Chỉ server (service role) đọc/ghi: bật RLS và không có policy. Chạy trong Supabase SQL Editor; chạy lại được.
create table if not exists public.dict_word_vi (
  term text primary key,
  meaning text not null check (char_length(meaning) between 1 and 120),
  -- Cách đọc (pinyin của từ điển) AI chọn là thông dụng nhất cho chữ nhiều âm; null = để trang tự chọn.
  reading text,
  model text not null,
  prompt_version text not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Bảng đã tạo từ bản đầu (chưa có cột reading) thì thêm vào.
alter table public.dict_word_vi add column if not exists reading text;

alter table public.dict_word_vi enable row level security;
