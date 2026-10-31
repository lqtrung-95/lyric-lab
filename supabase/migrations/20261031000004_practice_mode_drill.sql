-- Chế độ "Luyện từ đã lưu": thêm 'drill' vào các chế độ điểm luyện tập để làm xong một lượt được tính XP, chuỗi ngày và bảng xếp hạng.
-- Chạy một lần trong Supabase SQL editor (chạy lại được). Chưa chạy thì điểm XP của chế độ này bị bỏ qua (bài tập và lịch ôn FSRS vẫn hoạt động).
alter table public.practice_scores drop constraint if exists practice_scores_mode_check;
alter table public.practice_scores add constraint practice_scores_mode_check
  check (mode in ('pinyin', 'cloze', 'listen', 'match', 'karaoke', 'dictation', 'shadowing', 'explore', 'truth', 'truthduo', 'order', 'reflex', 'fiveword', 'roleplay', 'blaster', 'rain', 'whack', 'daily', 'duel', 'write', 'radical', 'drill'));
