-- Bản giải nghĩa/chiết tự tiếng Việt do AI viết cho trang Tra từ, lưu đệm theo từ (không theo ngữ cảnh câu).
-- `kind`: 'meaning' (giải nghĩa từ), 'etymology' (chiết tự chữ). Đổi `prompt_version` trong code để vô hiệu hóa bản cũ.
-- Chỉ server (service role) đọc/ghi: bật RLS và không có policy.
create table public.dict_word_ai_notes (
  term text not null,
  kind text not null check (kind in ('meaning', 'etymology')),
  prompt_version text not null,
  data jsonb not null,
  model text not null,
  created_at timestamptz not null default now(),
  primary key (term, kind, prompt_version)
);

alter table public.dict_word_ai_notes enable row level security;
