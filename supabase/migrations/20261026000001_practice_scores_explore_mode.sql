-- Thêm chế độ `explore` (nhiệm vụ ở cảnh Khám phá) vào các chế độ hợp lệ của điểm luyện tập, để lượt nhiệm vụ được tính XP, chuỗi ngày và nhiệm vụ ngày
-- giống các lượt luyện tập khác. Chạy một lần trong Supabase SQL editor; chưa chạy thì game vẫn chơi bình thường, chỉ chưa ghi được điểm Khám phá.
alter table public.practice_scores drop constraint if exists practice_scores_mode_check;
alter table public.practice_scores add constraint practice_scores_mode_check
  check (mode in ('pinyin', 'cloze', 'listen', 'match', 'karaoke', 'explore'));
