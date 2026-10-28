-- Game giải trí (Bắn chữ, Nhạc rơi, Đập chữ, Hán tự mỗi ngày, Đấu 1-1): thêm năm chế độ điểm luyện tập để các game này được tính XP, chuỗi ngày và bảng xếp hạng.
-- Chạy một lần trong Supabase SQL editor. Chưa chạy thì điểm XP của các game này bị bỏ qua (game vẫn chơi được).
alter table public.practice_scores drop constraint if exists practice_scores_mode_check;
alter table public.practice_scores add constraint practice_scores_mode_check
  check (mode in ('pinyin', 'cloze', 'listen', 'match', 'karaoke', 'dictation', 'shadowing', 'explore', 'truth', 'truthduo', 'order', 'reflex', 'fiveword', 'roleplay', 'blaster', 'rain', 'whack', 'daily', 'duel'));
