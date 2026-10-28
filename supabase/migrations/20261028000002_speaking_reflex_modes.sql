-- Nói phản xạ (Hỏi nhanh - Đáp nhanh, Dùng 5 từ, Trò chuyện tự do): thêm loại hạn mức 'stt' (nhận diện giọng nói) và 'roleplay' (lượt trò chuyện với AI),
-- và ba chế độ điểm luyện tập 'reflex', 'fiveword', 'roleplay' để các bài này được tính XP, chuỗi ngày, nhiệm vụ ngày.
-- Chạy một lần trong Supabase SQL editor. Chưa chạy thì API trả lỗi khi trừ hạn mức, bài nói không dùng được; điểm XP chỉ bị bỏ qua.
alter table public.usage_events drop constraint if exists usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('analyze', 'explain', 'tts', 'score', 'room', 'room_join', 'ask', 'voice', 'translate', 'chat', 'transcribe', 'stt', 'roleplay'));

alter table public.practice_scores drop constraint if exists practice_scores_mode_check;
alter table public.practice_scores add constraint practice_scores_mode_check
  check (mode in ('pinyin', 'cloze', 'listen', 'match', 'karaoke', 'dictation', 'shadowing', 'explore', 'truth', 'truthduo', 'order', 'reflex', 'fiveword', 'roleplay'));
