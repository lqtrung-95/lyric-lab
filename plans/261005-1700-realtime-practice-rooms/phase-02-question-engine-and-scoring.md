# Giai đoạn 2: Bộ câu hỏi chung và chấm điểm

## Context
- [plan.md](plan.md). Tái dùng `lib/practice/cloze.ts` (`buildCloze`, `buildChoices`), `lib/practice/random.ts` (`shuffle`, `seededRng`), `lib/practice/scoring.ts`.
- Dữ liệu nguồn: `readCachedAnalysis` (`lib/analysis/server-deps.ts`) trả `SongAnalysis` có `items` (từ vựng + `occurrences` gồm `lineIndex`) và `lines`.

## Tổng quan
Ưu tiên cao. Chưa làm. Sinh **cùng một bộ 10 câu Điền lời** cho cả hai người từ phân tích của bài, chấm ở server, tính điểm "đúng là chính".

## Điểm then chốt
- Các game hiện tại sinh câu từ **thẻ ôn của từng người** (phía client). Phòng cần bộ câu hỏi **giống nhau**, sinh từ **bài hát** ở server, cố định bằng `seed`.
- Đáp án đúng không bao giờ gửi xuống client trước khi người đó trả lời.

## Yêu cầu
- Bài đủ điều kiện: có ít nhất 12 từ vựng mà dòng chứa từ đó cho phép đục lỗ (`buildCloze` khác null) và đủ từ nhiễu. Bài không đủ thì không cho chọn; "Ngẫu nhiên" chỉ chọn trong các bài đủ điều kiện và đã phân tích.
- Mỗi câu: dòng lời có ô trống, gợi ý (bản dịch dòng đó), 4 đáp án (1 đúng + 3 nhiễu lấy từ các từ vựng khác của chính bài, ưu tiên cùng độ dài chữ), thứ tự đáp án cố định theo `seed` để hai người thấy giống nhau.
- Thời gian mỗi câu 15 giây (số đồng hồ trong thiết kế là giả định, chốt khi thử cảm giác thật); hết giờ tính là sai.

## Tính điểm (đúng là chính, tốc độ là phụ; khớp thiết kế)
- Đúng: 100 điểm cố định + **thưởng tốc độ 0–30** giảm tuyến tính trong 15 giây (ví dụ trả lời sau 1,8 giây được khoảng +26, thiết kế minh họa +25), tính từ lúc server mở câu tới lúc server nhận đáp án. Sai hoặc hết giờ: 0.
- **Người thắng là người có nhiều câu đúng hơn.** Cùng số câu đúng thì so tổng điểm (thưởng tốc độ chỉ có tác dụng ở đây); vẫn bằng thì hòa. Lý do: nếu so thẳng tổng điểm thì 9 câu đúng với thưởng tối đa (1170) vẫn thắng 10 câu đúng không có thưởng (1000), trái với "đúng là tiên quyết" mà thiết kế ghi.
- Số điểm vẫn hiện trực tiếp cho cả hai bên trong lúc chơi (thiết kế có thanh so sánh tỉ lệ), nhưng kết quả thắng thua theo quy tắc trên.

## Nội dung mỗi câu (theo thiết kế)
- Dòng lời có ô trống (chữ Hán + pinyin có ô trống), nghĩa tiếng Việt của dòng, gợi ý Hán-Việt của dòng (suy ra từ từ điển, ẩn phần ô trống) nếu có.
- Bốn đáp án, mỗi đáp án hiện chữ Hán, pinyin, âm Hán-Việt và nghĩa; lấy từ các từ vựng khác của chính bài (đã có sẵn `reading`, `sinoViet`, `meaningInContext`).
- Đoạn nghe của dòng đó: `room_questions` lưu `videoId`, `clipStart`, `clipEnd` (mốc của dòng, đã cộng độ lệch lời mặc định của bài; không cộng độ lệch cá nhân vì phòng dùng chung). Tối đa 2 lượt nghe mỗi câu, giới hạn ở phía client (không phải điểm gian lận cần chặn). Khung video hiển thị theo phase-04.
- Ghi chú ngữ pháp của dòng (nếu dòng có mục ngữ pháp trong phân tích), hiện kèm câu.

## Kiến trúc
- Khi bắt đầu phòng, server dựng 10 câu từ `seed` + `video_id`, ghi `room_questions` (công khai: số thứ tự, dòng có ô trống, gợi ý, 4 lựa chọn đã xáo) và `room_question_keys` (đáp án đúng, không có policy cho client).
- API trả lời nhận `{questionIndex, choice}` và dùng **giờ của server** để tính thời gian; chỉ nhận một lần cho mỗi người mỗi câu (khóa duy nhất).
- Hàm thuần có test: dựng bộ câu (`buildRoomQuestions(analysis, seed, count)`), tính điểm (`roomAnswerPoints`), so kết quả (`decideWinner`).

## Các file liên quan
- Tạo: `lib/rooms/build-room-questions.ts` (+ test), `lib/rooms/room-scoring.ts` (+ test), `app/api/rooms/[code]/answer/route.ts`, migration cho `room_questions`, `room_question_keys`, `room_answers`.
- Sửa: `lib/practice/random.ts` (bỏ ghi chú "chỉ dùng cho test" của `seededRng` vì giờ dùng cho seed phòng).

## Các bước
1. Hàm dựng bộ câu từ `SongAnalysis` với `seed`: lọc từ vựng đục lỗ được, chọn 10 câu, xáo lựa chọn bằng `seededRng`. Test: cùng `seed` ra cùng bộ; không có hai đáp án đúng; câu không trùng từ.
2. Hàm điểm và thắng thua, test các trường hợp biên (hết giờ, hòa điểm, hòa cả thời gian).
3. Bảng và API trả lời; kiểm tra phòng đang `playing`, câu đang mở, người trả lời thuộc phòng, chưa trả lời câu này.
4. Bài nhúng được: route phân tích đã chặn bài không nhúng được (`video_not_embeddable`) nên bài đã phân tích đều nhúng được lúc đó; bảng `songs` không lưu cờ này, nên nếu video bị tắt nhúng sau này thì xử lý ở màn chơi (phase-04: báo lỗi và cho trả lời không cần nghe).
5. Điều kiện đủ điều kiện của bài và hàm chọn bài ngẫu nhiên hợp trình độ (dựa trên `level_avg` của `songs` / `discover_songs`).

## Danh sách việc
- [ ] `build-room-questions` + test
- [ ] `room-scoring` + test
- [ ] Migration các bảng câu hỏi/đáp án
- [ ] API trả lời
- [ ] Lọc bài đủ điều kiện + chọn ngẫu nhiên theo trình độ

## Tiêu chí hoàn thành
Cùng `seed` ra đúng cùng bộ câu cho hai người; đáp án không lộ qua API/Realtime; điểm tính đúng theo quy tắc; test qua.

## Rủi ro
- Bài ít từ vựng đục lỗ được: loại khỏi danh sách chọn, báo rõ lý do.
- Nhiễu nhìn giống nhau tạo câu mơ hồ: loại từ nhiễu có trong dòng hoặc trùng nghĩa (đã có sẵn trong `buildChoices`).

## Bảo mật
Tên cột đáp án chỉ ở `room_question_keys`; client không có quyền đọc. Gian lận bằng cách mở DevTools không thấy đáp án trước khi trả lời.

## Bước tiếp theo
Giai đoạn 3 (máy trạng thái ván).

## Câu hỏi còn mở
- Có cho thêm chế độ khác ngoài Điền lời ở giai đoạn 1? Đề xuất: không, để giai đoạn 2 của dự án.
