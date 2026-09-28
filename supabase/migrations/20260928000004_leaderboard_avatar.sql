-- Avatar bảng xếp hạng: bucket công khai (đọc không cần RLS vì public=true), chỉ server (service role) ghi nên
-- không cần policy insert/update trên storage.objects.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;

alter table public.leaderboard_profiles add column avatar_url text;

-- Trả kèm avatar_url trong bảng xếp hạng (ảnh đại diện công khai, không lộ thêm gì so với biệt danh đã công khai).
create or replace function public.leaderboard_top(p_scope text, p_limit integer default 50)
returns table (rank bigint, user_id uuid, nickname text, points bigint, avatar_url text)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh') as week_start
  ),
  totals as (
    select s.user_id, sum(s.points)::bigint as points
    from public.practice_scores s, bounds b
    where p_scope = 'all' or s.played_at >= b.week_start
    group by s.user_id
  )
  select rank() over (order by t.points desc) as rank, t.user_id, p.nickname, t.points, p.avatar_url
  from totals t
  join public.leaderboard_profiles p on p.user_id = t.user_id and p.opted_in and not p.hidden
  order by t.points desc, p.nickname
  limit greatest(p_limit, 1);
$$;

revoke all on function public.leaderboard_top(text, integer) from public, anon, authenticated;
grant execute on function public.leaderboard_top(text, integer) to service_role;
