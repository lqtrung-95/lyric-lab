-- Video luyện nghe (chép chính tả, shadowing): kho video tiếng Trung do admin tuyển chọn, tách khỏi bài hát (songs/song_analyses).
-- Dữ liệu do script `scripts/ingest-video-source.mts` ghi bằng service role; người dùng chỉ đọc qua API server nên bảng bật RLS và
-- KHÔNG có policy cho client. Không có cột user_id nên không phải thêm vào `merge_user_data`.
-- Gỡ nội dung theo yêu cầu: `delete from video_lessons where video_id = '...'`.

create table public.video_sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'channel' check (kind in ('channel', 'playlist')),
  -- Mã kênh (UC...) hoặc playlist trên YouTube.
  youtube_ref text not null unique,
  title text not null,
  -- Kênh của chính chủ dự án (không vướng bản quyền).
  owned boolean not null default false,
  -- Admin xác nhận nguồn có phụ đề tiếng Trung do người làm (không phải phụ đề tự động).
  human_zh_captions boolean not null default true,
  license_note text,
  created_at timestamptz not null default now()
);

create table public.video_lessons (
  video_id text primary key check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  source_id uuid references public.video_sources (id) on delete set null,
  title text not null,
  channel_title text not null,
  duration_sec integer not null,
  -- Cấp HSK trung bình của các từ trong video (từ từ điển, không dùng LLM); null nếu không từ nào có cấp.
  level_avg numeric(3, 1),
  -- draft: mới đưa vào, chờ admin duyệt; listed: hiện cho người dùng; hidden: ẩn (vẫn giữ dữ liệu).
  status text not null default 'draft' check (status in ('draft', 'listed', 'hidden')),
  -- Nguồn bản dịch tiếng Việt: phụ đề YouTube, AI dịch, hoặc chưa có.
  translation_source text not null default 'none' check (translation_source in ('youtube', 'ai', 'none')),
  line_count integer not null,
  translated_line_count integer not null,
  -- Mảng LessonLine (idx, start, end, text, pinyin, translation, tokens); luôn đọc cả bài nên lưu một cột jsonb.
  lines jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index video_lessons_status_idx on public.video_lessons (status, created_at desc);

alter table public.video_sources enable row level security;
alter table public.video_lessons enable row level security;
