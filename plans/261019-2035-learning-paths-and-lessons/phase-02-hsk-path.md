# Giai đoạn 2: Lộ trình HSK (cỡ L)

## Mục tiêu
Bản đồ HSK 1→6: mỗi cấp gồm các chặng ~15-20 từ; mỗi chặng dẫn người học qua học thẻ, nghe từ trong câu video thật, vài trò chơi, rồi kiểm tra nhỏ. HSK 1 làm kỹ trước (≈ 506 từ ≈ 26 chặng), sau đó nhân ra HSK 2-6 bằng cùng một máy sinh.

## Cách chia chặng
Sinh bằng script từ `dict_words`: thứ tự theo tần suất (`frequency`) rồi gom theo chủ đề gần nhau khi có (số đếm, gia đình, thời gian...) — chủ đề gán bằng bảng tay nhỏ cho HSK 1 (đủ chất lượng), HSK 2+ chủ yếu theo tần suất. Mỗi chặng có tên tiếng Việt ngắn. Người dùng có thể xem trước nội dung chặng, nhảy cóc nếu đã biết (bài kiểm tra xếp lớp tùy chọn).

## Luồng một chặng (các bước)
1. **Làm quen**: thẻ từ (pinyin, Hán Việt, nghĩa, giọng đọc, mẹo nhớ từ Hán Việt) — lưu thẻ vào bộ ôn FSRS cùng định dạng hiện có.
2. **Nghe trong ngữ cảnh**: với mỗi từ, phát đoạn video thật (khung YouTube tại `start` của dòng, đã có hạ tầng clip), kèm pinyin/nghĩa; chọn tối đa 2 câu/từ.
3. **Trò chơi**: dùng sẵn ghép cặp, nghe và chọn, gõ pinyin, điền chỗ trống trên đúng các từ của chặng (tận dụng `lib/practice/*`).
4. **Kiểm tra chặng**: 8-10 câu hỗn hợp; ≥ 70% mở chặng kế (chặng kế vẫn mở được thủ công, không khóa cứng).
5. Kết quả cập nhật tiến độ + mục tiêu ngày + chuỗi ngày (`practice_scores` mode mới `path`, cần migration `mode`).

## Màn hình
- `/hoc` (bản đồ lộ trình): chọn cấp, danh sách chặng dạng đường đi, tiến độ %, chặng tiếp theo nổi bật. Thiết kế theo `design/` hiện có (Stitch) hoặc hỏi lại nếu cần màn mới; làm khớp token Tailwind sẵn.
- `/hoc/[cap]/[chang]`: các bước trong một chặng.

## Các bước làm
1. Script sinh chặng HSK 1 + bảng chủ đề tay + duyệt bằng mắt toàn bộ 26 chặng.
2. Màn bản đồ + màn chặng (khung, trạng thái, trống/lỗi).
3. Bước làm quen + bước nghe ngữ cảnh (clip theo dòng).
4. Ghép các trò sẵn có vào chặng (nhận danh sách từ thay vì thẻ của người dùng).
5. Kiểm tra chặng + cập nhật tiến độ + migration `mode`.
6. E2E luồng đầy đủ một chặng; a11y; cập nhật 4 tài liệu.
7. Nhân ra HSK 2-6 (chạy script, duyệt mẫu mỗi cấp, xử lý chặng thiếu câu thật).

## Tiêu chí xong
Người dùng mới vào `/hoc`, thấy HSK 1 chặng 1, hoàn thành chặng trong ≤ 8 phút, từ vào bộ ôn, chặng 2 mở, tiến độ còn sau khi tải lại và sau khi đăng nhập Google. HSK 2-6 chạy cùng cơ chế.

## Rủi ro
- Chặng thiếu câu thật (HSK 4-6): bước 2 tự bỏ qua với từ không có câu, hiển thị câu ví dụ từ từ điển nếu cần.
- Quá nhiều bước làm người học nản: đo thời gian thực tế, rút gọn nếu > 8 phút.
- Từ HSK có nhiều nghĩa: bước làm quen chỉ hiển thị nghĩa phổ biến nhất theo từ điển.
