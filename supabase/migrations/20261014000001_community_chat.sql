-- Chat cộng đồng và thông báo của quản trị viên.
-- Chỉ server (service role) đọc/ghi: bật RLS và không có policy, người dùng đi qua API của app (như bảng xếp hạng).
-- Chạy bằng Supabase SQL Editor, chạy TRƯỚC khi deploy; chạy lại được.

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Bản chụp biệt danh và ảnh lúc gửi: tin cũ không đổi theo khi người gửi đổi biệt danh.
  nickname text not null,
  avatar_url text,
  -- Do SERVER đặt theo tài khoản quản trị lúc gửi (client không gửi được), dùng để hiện huy hiệu Admin.
  is_admin boolean not null default false,
  kind text not null default 'chat' check (kind in ('chat', 'announcement')),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  -- Xóa mềm: quản trị xóa tin vi phạm nhưng còn dữ liệu để xem lại.
  deleted_at timestamptz
);
create index if not exists chat_messages_live_idx on public.chat_messages (id desc) where deleted_at is null;
create index if not exists chat_messages_user_idx on public.chat_messages (user_id, created_at desc);

-- Người bị quản trị chặn gửi tin trong cộng đồng (vẫn đọc được).
create table if not exists public.chat_blocked_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  blocked_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;
alter table public.chat_blocked_users enable row level security;

-- Hạn mức gửi tin (theo 1 giờ).
alter table public.usage_events drop constraint if exists usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('analyze', 'explain', 'tts', 'score', 'room', 'room_join', 'ask', 'voice', 'translate', 'chat'));
