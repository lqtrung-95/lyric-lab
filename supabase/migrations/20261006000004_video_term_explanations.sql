-- Cache nghĩa theo ngữ cảnh của từ trong video luyện nghe (người dùng bấm vào một từ). Cùng dạng với `term_explanations` của bài hát
-- nhưng gắn với `video_lessons`: xóa video thì cache của nó xóa theo (gỡ nội dung theo yêu cầu). Chỉ server (service role) đọc/ghi.
create table public.video_term_explanations (
  id bigint generated always as identity primary key,
  video_id text not null references public.video_lessons (video_id) on delete cascade,
  line_index integer not null,
  term text not null,
  explain_lang text not null,
  prompt_version text not null,
  meaning_in_context text not null,
  note text,
  model text not null,
  created_at timestamptz not null default now(),
  unique (video_id, line_index, term, explain_lang, prompt_version)
);

alter table public.video_term_explanations enable row level security;
