-- Cache giải nghĩa cả câu (khác term_explanations, vốn cache theo từng từ). Chỉ server (service role) ghi/đọc.
create table public.line_explanations (
  video_id text not null,
  line_index integer not null,
  explain_lang text not null,
  prompt_version text not null,
  meaning text not null,
  grammar_note text,
  model text not null,
  created_at timestamptz not null default now(),
  primary key (video_id, line_index, explain_lang, prompt_version)
);

alter table public.line_explanations enable row level security;
