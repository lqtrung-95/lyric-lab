-- Cache giải nghĩa theo ngữ cảnh khi người dùng bấm một từ bất kỳ trong lời (LS-06). Chỉ server (service role) đọc/ghi.
create table public.term_explanations (
  id bigint generated always as identity primary key,
  video_id text not null references public.songs (video_id) on delete cascade,
  line_index integer not null,
  term text not null,             -- dạng chữ như trong lời (có thể là phồn thể)
  explain_lang text not null,
  prompt_version text not null,
  meaning_in_context text not null,
  note text,
  model text not null,
  created_at timestamptz not null default now(),
  unique (video_id, line_index, term, explain_lang, prompt_version)
);

alter table public.term_explanations enable row level security;
