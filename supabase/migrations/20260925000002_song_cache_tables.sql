-- Cache phân tích bài hát dùng chung. Chỉ server (service role) đọc/ghi: RLS bật và KHÔNG có policy,
-- nên client dùng anon key không đọc được (lời bài hát chỉ trả qua route của app, trang bài học noindex).
-- Gỡ nội dung theo yêu cầu: `delete from songs where video_id = '...'` (xóa cascade cả phân tích).

create table public.songs (
  video_id text primary key check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null,
  channel_title text not null,
  duration_sec integer not null,
  created_at timestamptz not null default now()
);

create table public.song_analyses (
  id bigint generated always as identity primary key,
  video_id text not null references public.songs (video_id) on delete cascade,
  learn_lang text not null,       -- ngôn ngữ học, vd. 'zh'
  explain_lang text not null,     -- ngôn ngữ giải thích, vd. 'vi'
  prompt_version text not null,
  lyrics_source text not null check (lyrics_source in ('youtube_caption', 'lrclib')),
  model text not null,
  analysis jsonb not null,        -- SongAnalysis
  created_at timestamptz not null default now(),
  unique (video_id, learn_lang, explain_lang, prompt_version)
);

alter table public.songs enable row level security;
alter table public.song_analyses enable row level security;
