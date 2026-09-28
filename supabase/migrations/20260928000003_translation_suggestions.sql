-- Góp ý bản dịch từng câu (RV-xx): người dùng thấy câu dịch chưa tự nhiên có thể đề xuất bản khác.
-- Chỉ server (service role) ghi/đọc: bật RLS và không có policy. Admin duyệt qua /api/admin/translation-suggestions,
-- áp dụng thì ghi thẳng vào song_analyses.analysis (không có bảng riêng lưu bản dịch: bản dịch nằm trong JSON phân tích).
create table public.translation_suggestions (
  id bigint generated always as identity primary key,
  video_id text not null references public.songs (video_id) on delete cascade,
  prompt_version text not null,
  line_index integer not null,
  current_translation text not null,
  suggested_translation text not null check (char_length(suggested_translation) between 3 and 500),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'applied', 'dismissed')),
  created_at timestamptz not null default now()
);
create index translation_suggestions_status_idx on public.translation_suggestions (status, created_at desc);
create index translation_suggestions_video_idx on public.translation_suggestions (video_id, prompt_version, line_index);

alter table public.translation_suggestions enable row level security;
