# Giai đoạn 1: Khung khóa học + chỉ mục từ↔câu (cỡ L)

## Mục tiêu
Một mô hình dữ liệu chung cho mọi loại bài (HSK, tình huống, tập viết, trò chơi) và một chỉ mục cho biết từ nào xuất hiện ở câu video nào, để chọn câu ví dụ nhanh và tốt.

## Mô hình (đề xuất, chốt khi làm)
- `courses` (id, slug, kind `hsk|situation|writing`, title, level, order) và `course_units` (course_id, idx, title, summary, content jsonb): một chặng/bài gồm danh sách mục (`items`: từ, câu video, hội thoại, chữ để viết) và các bước (`steps`: học thẻ → nghe câu thật → trò chơi → kiểm tra). Dữ liệu công khai, bật RLS cho phép đọc, ghi bằng service role (giống `dict_words`).
- `user_unit_progress` (user_id, unit_id, status, best_score, completed_at, step_state jsonb): RLS theo người dùng; thêm vào `merge_user_data`; chịu được chưa chạy migration (đọc/ghi bỏ qua nhẹ nhàng như các bảng mới trước đây).
- `term_sentences` (term, video_id, line_idx, quality smallint): chỉ mục xây bằng script từ `video_lessons.lines` cho các từ có cấp HSK (≈ 11 nghìn từ, 78 nghìn dòng). Không lưu lời, chỉ tham chiếu; lời đọc từ `video_lessons` lúc hiển thị.

## Chọn câu tốt (điểm `quality`)
Ưu tiên câu: 4-14 chữ, có bản dịch, từ đích ở vị trí rõ, các từ khác phần lớn ≤ cấp của bài (+1), không chứa từ nhạy cảm (danh sách chặn), từ đích đúng nghĩa (loại câu dùng nghĩa hiếm: so với nghĩa chính trong từ điển bằng tần suất; từ đa âm/đa nghĩa gắn cờ để duyệt). Mỗi từ giữ tối đa 5 câu, đa dạng video.

## Các bước
1. Spec chốt bảng + migration (người dùng tự chạy) + cập nhật `merge_user_data`.
2. Script `scripts/build-term-sentences.mts` (dry-run, idempotent, in thống kê phủ theo cấp) + test cho hàm chấm điểm câu (`lib/courses/score-sentence.ts`).
3. Thư viện `lib/courses/*`: đọc khóa/chặng, đọc/ghi tiến độ (an toàn khi thiếu bảng), chọn câu cho một từ.
4. API đọc `GET /api/courses`, `GET /api/courses/[slug]` (cache), tiến độ qua Supabase client như các repo hiện có.
5. Tài liệu: `system-architecture`, `operations-runbook` (chạy script khi nạp video mới), `code-standards`.

## Tiêu chí xong
Script chạy trên DB thật cho ra chỉ mục; thống kê khớp số đo (HSK 1 ≥ 95% từ có ≥1 câu); hàm chọn câu có test; migration chạy lại được; đọc tiến độ không lỗi khi bảng chưa tồn tại.

## Rủi ro
- Tách từ của video có thể sai ở từ ghép (từ đích bị tách nhỏ): dùng token sẵn có, kiểm tra mẫu 100 câu.
- Chỉ mục lỗi thời khi nạp video mới: thêm bước chạy lại vào quy trình nạp (idempotent).
