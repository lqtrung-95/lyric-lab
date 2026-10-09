-- Người học báo một dòng dịch của video là sai. Dòng đang dùng bản dịch có sẵn thì AI dịch lại ngay (outcome 'retranslated'); dòng vốn đã là bản AI
-- thì chỉ ghi nhận cho quản trị sửa tay (outcome 'reported'). Chỉ server (service role) ghi/đọc nên bật RLS và không có policy cho client.
-- Gỡ người dùng thì giữ báo cáo, chỉ bỏ liên kết (user_id set null).
create table public.video_translation_reports (
  id bigint generated always as identity primary key,
  video_id text not null references public.video_lessons (video_id) on delete cascade,
  line_idx integer not null,
  user_id uuid references auth.users (id) on delete set null,
  -- Bản dịch tại thời điểm bị báo sai, để quản trị đối chiếu với bản AI mới.
  old_translation text,
  outcome text not null check (outcome in ('retranslated', 'reported')),
  created_at timestamptz not null default now()
);
create index video_translation_reports_user_idx on public.video_translation_reports (user_id, created_at desc) where user_id is not null;
create index video_translation_reports_line_idx on public.video_translation_reports (video_id, line_idx);
create index video_translation_reports_outcome_idx on public.video_translation_reports (outcome, created_at desc);

alter table public.video_translation_reports enable row level security;
