-- Báo sai thẻ học (PV-09). Chưa có tài khoản nên `user_id` để trống; chỉ server (service role) ghi/đọc.
create table public.item_reports (
  id bigint generated always as identity primary key,
  video_id text not null references public.songs (video_id) on delete cascade,
  prompt_version text not null,
  item_id text not null,        -- PreviewItem.id, vd. 'vocab:城市'
  reason text not null check (reason in ('wrong_meaning', 'wrong_pinyin', 'not_worth_learning')),
  user_id uuid,                 -- gắn ở M3 khi có tài khoản ẩn danh
  created_at timestamptz not null default now()
);
create index item_reports_item_idx on public.item_reports (video_id, prompt_version, item_id);

alter table public.item_reports enable row level security;
