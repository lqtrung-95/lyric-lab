-- Yêu thích bài hát: người dùng bấm tim trên thẻ bài để đánh dấu, dùng lọc lại trong "Bài hát của tôi"
-- và tính vào độ phổ biến ở Khám phá. RLS theo chủ sở hữu, giống user_song_progress.
create table public.user_song_likes (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null references public.songs (video_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.user_song_likes enable row level security;

create policy user_song_likes_own on public.user_song_likes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Khám phá cần số lượt thích công khai (không lộ danh tính) để xếp "Phổ biến"; view hiện có đã ẩn danh theo cách này cho `listeners`.
drop view public.discover_songs;

create view public.discover_songs with (security_invoker = false) as
select
  s.video_id, s.title, s.channel_title, s.duration_sec, s.level_avg, s.created_at,
  (select count(*) from public.user_song_progress p where p.video_id = s.video_id) as listeners,
  (select count(*) from public.user_song_likes l where l.video_id = s.video_id) as likes
from public.songs s
where s.listed
  and exists (select 1 from public.song_analyses a where a.video_id = s.video_id)
  and (select count(*) from public.item_reports r where r.video_id = s.video_id) < 5;

revoke all on public.discover_songs from public, anon, authenticated;
grant select on public.discover_songs to service_role;
