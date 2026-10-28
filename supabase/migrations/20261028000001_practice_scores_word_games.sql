-- Thêm ba chế độ vào các chế độ hợp lệ của điểm luyện tập để các trò mới được tính XP, chuỗi ngày và nhiệm vụ ngày giống các lượt luyện tập khác:
-- 'truth' (Hai thật một giả chơi một mình), 'truthduo' (Hai thật một giả chơi cùng bạn), 'order' (Xếp câu). Giữ nguyên các chế độ đã có.
-- Chạy một lần trong Supabase SQL editor; chưa chạy thì các trò vẫn chơi bình thường, chỉ chưa ghi được điểm.
alter table public.practice_scores drop constraint if exists practice_scores_mode_check;
alter table public.practice_scores add constraint practice_scores_mode_check
  check (mode in ('pinyin', 'cloze', 'listen', 'match', 'karaoke', 'dictation', 'shadowing', 'explore', 'truth', 'truthduo', 'order'));
