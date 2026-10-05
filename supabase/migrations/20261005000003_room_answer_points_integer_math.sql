-- Sửa room_answer_points: phép chia số thập phân (… / 15000.0) bị cắt chữ số cuối nên ở các mốc đúng .5 (vd. 250 ms: 29,5)
-- kết quả hơi thấp hơn một chút và làm tròn xuống (129 thay vì 130). Tính bằng số nguyên, làm tròn nửa lên, để chính xác và
-- trùng roomAnswerPoints trong lib/rooms/room-scoring.ts ở mọi giá trị. Chạy được nhiều lần (create or replace).
create or replace function public.room_answer_points(p_correct boolean, p_elapsed_ms integer)
returns integer
language sql
immutable
as $$
  select case when p_correct
    then 100 + (30 * (15000 - least(15000, greatest(0, p_elapsed_ms))) * 2 + 15000) / 30000
    else 0 end;
$$;
