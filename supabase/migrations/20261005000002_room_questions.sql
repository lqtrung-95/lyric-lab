-- Câu hỏi, đáp án và câu trả lời của phòng thi đấu, cùng hàm chấm điểm ở server.
-- Đáp án đúng (room_question_keys) và câu trả lời của từng người (room_answers) KHÔNG có policy cho client: không đường nào
-- (kể cả Realtime sau này) để một người đọc được đáp án hay lựa chọn của đối thủ trước khi tự trả lời. Chạy bằng Supabase SQL Editor.

create table public.room_questions (
  room_id uuid not null references public.rooms (id) on delete cascade,
  idx smallint not null check (idx >= 0),
  -- Câu hỏi công khai (RoomQuestionPublic): đã bỏ đáp án đúng.
  payload jsonb not null,
  -- Mốc giờ server mở câu và hạn trả lời; null cho tới khi ván chơi mở câu đó.
  opens_at timestamptz,
  deadline_at timestamptz,
  primary key (room_id, idx)
);

create table public.room_question_keys (
  room_id uuid not null,
  idx smallint not null,
  correct_index smallint not null check (correct_index between 0 and 3),
  correct_term text not null,
  primary key (room_id, idx),
  foreign key (room_id, idx) references public.room_questions (room_id, idx) on delete cascade
);

create table public.room_answers (
  room_id uuid not null,
  idx smallint not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  choice smallint not null check (choice between 0 and 3),
  correct boolean not null,
  points integer not null check (points >= 0),
  elapsed_ms integer not null check (elapsed_ms >= 0),
  answered_at timestamptz not null default now(),
  primary key (room_id, idx, user_id),
  foreign key (room_id, idx) references public.room_questions (room_id, idx) on delete cascade
);
create index room_answers_user_idx on public.room_answers (user_id);

alter table public.room_questions enable row level security;
alter table public.room_question_keys enable row level security;
alter table public.room_answers enable row level security;

-- Thành viên chỉ đọc được câu hỏi đã được lên lịch mở (opens_at có giá trị), không đọc trước cả bộ.
create policy room_questions_member_read on public.room_questions for select to authenticated
  using (public.is_room_member(room_id) and opens_at is not null);

-- Điểm một câu: đúng 100 + thưởng tốc độ 0–30 giảm tuyến tính trong 15 giây; sai hoặc hết giờ 0. Phải trùng roomAnswerPoints
-- trong lib/rooms/room-scoring.ts (test tích hợp đối chiếu hai bản).
create function public.room_answer_points(p_correct boolean, p_elapsed_ms integer)
returns integer
language sql
immutable
as $$
  select case when p_correct
    then 100 + round(30 * (1 - least(15000, greatest(0, p_elapsed_ms)) / 15000.0))::integer
    else 0 end;
$$;

-- Nhận câu trả lời, chấm và cộng điểm trong một giao dịch. Thời gian trả lời tính bằng giờ server (now() − opens_at), không tin client.
-- Trả jsonb {result, ...}: ok (kèm correct, points, elapsed_ms, correct_index) | not_playing | not_in_room | no_question |
-- not_open | closed | already_answered. Cho phép trễ tối đa 1 giây sau hạn để bù độ trễ mạng (lúc đó thưởng tốc độ về 0).
create function public.submit_room_answer(p_room uuid, p_user uuid, p_idx smallint, p_choice smallint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_question public.room_questions;
  v_correct_index smallint;
  v_elapsed integer;
  v_is_correct boolean;
  v_points integer;
  v_rows integer;
begin
  select status into v_status from public.rooms where id = p_room;
  if v_status is distinct from 'playing' then
    return jsonb_build_object('result', 'not_playing');
  end if;
  if not exists (select 1 from public.room_players where room_id = p_room and user_id = p_user and left_at is null) then
    return jsonb_build_object('result', 'not_in_room');
  end if;
  select * into v_question from public.room_questions where room_id = p_room and idx = p_idx;
  if not found then
    return jsonb_build_object('result', 'no_question');
  end if;
  if v_question.opens_at is null or now() < v_question.opens_at then
    return jsonb_build_object('result', 'not_open');
  end if;
  if v_question.deadline_at is null or now() > v_question.deadline_at + interval '1 second' then
    return jsonb_build_object('result', 'closed');
  end if;

  select correct_index into v_correct_index from public.room_question_keys where room_id = p_room and idx = p_idx;
  v_elapsed := least(15000, greatest(0, floor(extract(epoch from (now() - v_question.opens_at)) * 1000)::integer));
  v_is_correct := p_choice = v_correct_index;
  v_points := public.room_answer_points(v_is_correct, v_elapsed);

  insert into public.room_answers (room_id, idx, user_id, choice, correct, points, elapsed_ms)
    values (p_room, p_idx, p_user, p_choice, v_is_correct, v_points, v_elapsed)
    on conflict (room_id, idx, user_id) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return jsonb_build_object('result', 'already_answered');
  end if;

  update public.room_players
    set score = score + v_points, correct = correct + (case when v_is_correct then 1 else 0 end), total_ms = total_ms + v_elapsed
    where room_id = p_room and user_id = p_user;
  return jsonb_build_object('result', 'ok', 'correct', v_is_correct, 'points', v_points, 'elapsed_ms', v_elapsed, 'correct_index', v_correct_index);
end;
$$;

revoke all on function public.submit_room_answer(uuid, uuid, smallint, smallint) from public, anon, authenticated;
grant execute on function public.submit_room_answer(uuid, uuid, smallint, smallint) to service_role;
