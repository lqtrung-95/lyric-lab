-- Ảnh chụp số liệu chuỗi ngày học tại thời điểm chia sẻ, để trang chia sẻ công khai (/share/streak/[token]) và ảnh
-- og:image luôn hiện đúng số đã chia sẻ, không đổi theo tiến độ sau này của người dùng. Không lưu user_id (ẩn danh
-- hoàn toàn với người xem link). Chỉ server (service role) đọc/ghi: bật RLS và không có policy.
create table public.streak_shares (
  token text primary key,
  current_streak integer not null,
  learned_words integer not null,
  week_count integer not null,
  created_at timestamptz not null default now()
);
alter table public.streak_shares enable row level security;
