-- Người thắng ván là người có tổng điểm cao hơn (trước đây xét số câu đúng trước rồi mới tới điểm). Bằng điểm thì hòa.
-- Khớp decideWinner ở TypeScript. Chỉ đổi cách chọn người thắng; phần còn lại giữ nguyên bản cũ của hàm.
create or replace function public.finish_room(p_room uuid, p_forfeit boolean, p_forfeit_winner uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_winner uuid;
  v_first record;
  v_second record;
begin
  perform public.recompute_room_scores(p_room);
  if p_forfeit then
    v_winner := p_forfeit_winner;
  else
    select user_id, score into v_first from public.room_players where room_id = p_room order by score desc limit 1;
    select user_id, score into v_second from public.room_players where room_id = p_room order by score desc offset 1 limit 1;
    if v_second.user_id is null or v_first.score <> v_second.score then
      v_winner := v_first.user_id;
    end if;
  end if;
  update public.rooms set status = 'finished', finished_at = now(), winner_id = v_winner, forfeit = p_forfeit where id = p_room;
end;
$$;
