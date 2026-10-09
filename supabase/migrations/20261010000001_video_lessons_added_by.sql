-- Video do người dùng tự thêm (dán link + phụ đề) vào kho video dùng chung. `added_by` để giới hạn số video mỗi người mỗi ngày và để admin
-- biết ai thêm; xóa tài khoản thì giữ video (dùng chung), chỉ bỏ liên kết. Video do admin nạp có added_by null.
alter table public.video_lessons
  add column added_by uuid references auth.users (id) on delete set null;

create index video_lessons_added_by_idx on public.video_lessons (added_by, created_at desc) where added_by is not null;
