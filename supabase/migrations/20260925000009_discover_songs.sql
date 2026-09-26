-- Tab "Khám phá": danh sách bài đã được phân tích để người dùng khác chọn học. Chỉ metadata (tên bài, kênh, ảnh bìa lấy từ YouTube), không có lời.
-- `listed` cho phép ẩn một bài khỏi danh sách mà không xóa phân tích; `level_avg` là cấp HSK trung bình của từ vựng đã chọn.
alter table public.songs add column listed boolean not null default true;
alter table public.songs add column level_avg real;

-- Bài đủ điều kiện hiển thị: được phép niêm yết, có phân tích, và chưa bị báo sai từ 5 lần trở lên.
-- `listeners` = số người dùng đã nghe (đếm gộp, không lộ danh tính). Chỉ server (service role) đọc.
create view public.discover_songs with (security_invoker = false) as
select
  s.video_id, s.title, s.channel_title, s.duration_sec, s.level_avg, s.created_at,
  (select count(*) from public.user_song_progress p where p.video_id = s.video_id) as listeners
from public.songs s
where s.listed
  and exists (select 1 from public.song_analyses a where a.video_id = s.video_id)
  and (select count(*) from public.item_reports r where r.video_id = s.video_id) < 5;

revoke all on public.discover_songs from public, anon, authenticated;
grant select on public.discover_songs to service_role;
