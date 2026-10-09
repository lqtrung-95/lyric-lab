-- Lọc bài theo cảm xúc ở Thư viện. `mood_groups` là các nhóm cảm xúc cố định (id trong lib/library/mood-groups.ts) gộp từ tag cảm xúc do AI viết
-- cho từng bài. Điền cho bài mới lúc phân tích xong, và cho bài cũ bằng scripts/backfill-mood-groups.mts.
alter table public.songs add column mood_groups text[] not null default '{}';
create index songs_mood_groups_idx on public.songs using gin (mood_groups);

-- View "Khám phá" thêm cột mood_groups (giữ nguyên điều kiện và các cột cũ).
drop view public.discover_songs;

create view public.discover_songs with (security_invoker = false) as
select
  s.video_id, s.title, s.channel_title, s.duration_sec, s.level_avg, s.created_at, s.mood_groups,
  (select count(*) from public.user_song_progress p where p.video_id = s.video_id) as listeners,
  (select count(*) from public.user_song_likes l where l.video_id = s.video_id) as likes
from public.songs s
where s.listed
  and exists (select 1 from public.song_analyses a where a.video_id = s.video_id)
  and (select count(*) from public.item_reports r where r.video_id = s.video_id) < 5;

revoke all on public.discover_songs from public, anon, authenticated;
grant select on public.discover_songs to service_role;
