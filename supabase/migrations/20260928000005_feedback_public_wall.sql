-- Trang Góp ý công khai: mỗi góp ý cần admin duyệt mới hiện cho người khác thấy.
alter table public.feedback add column status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'));
create index feedback_status_idx on public.feedback (status, created_at desc);

-- Danh sách công khai: chỉ góp ý đã duyệt, kèm biệt danh/avatar bảng xếp hạng nếu người gửi đã đặt (không thì "ẩn danh").
-- Không lộ user_id hay bất cứ gì định danh khác ngoài biệt danh đã công khai sẵn ở bảng xếp hạng.
create view public.feedback_public with (security_invoker = false) as
select f.id, f.category, f.message, f.created_at, p.nickname, p.avatar_url
from public.feedback f
left join public.leaderboard_profiles p on p.user_id = f.user_id and p.opted_in and not p.hidden
where f.status = 'approved';

revoke all on public.feedback_public from public, anon, authenticated;
grant select on public.feedback_public to service_role;
