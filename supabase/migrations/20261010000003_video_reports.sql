-- Người học báo cả một video luyện nghe có vấn đề (phụ đề sai/lệch, không phải tiếng Trung, nội dung không phù hợp, bản dịch sai nhiều).
-- Mỗi người một báo cáo cho mỗi video (báo lại thì đổi lý do). Chỉ server (service role) ghi/đọc nên bật RLS và không có policy.
-- Đủ số người khác nhau báo thì server ẩn video do người dùng thêm chờ admin xem; admin "bỏ qua" bằng cách đặt resolved_at.
-- Gỡ người dùng thì giữ báo cáo, chỉ bỏ liên kết (user_id set null).
create table public.video_reports (
  id bigint generated always as identity primary key,
  video_id text not null references public.video_lessons (video_id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  reason text not null check (reason in ('wrong_subtitles', 'wrong_translation', 'not_chinese', 'inappropriate')),
  -- Admin đã xem và bỏ qua (hoặc xử lý xong): báo cáo không còn tính vào huy hiệu và ngưỡng tự ẩn.
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (video_id, user_id)
);
create index video_reports_open_idx on public.video_reports (video_id) where resolved_at is null;
create index video_reports_user_idx on public.video_reports (user_id, created_at desc) where user_id is not null;

alter table public.video_reports enable row level security;
