# Đợt 2: Nghe và chọn, Karaoke điền lời, Bảng xếp hạng

Quyết định của user (2026-09-27): điểm luyện tập theo tuần + mọi thời gian; tự nguyện tham gia, đặt biệt danh (không dùng email/tên Google); hai tab "Tuần này" và "Mọi thời gian".

## Nghe và chọn (`/review/listen`)
Phát giọng đọc của từ (Azure, rơi về giọng hệ thống), chọn chữ Hán hoặc nghĩa (công tắc). 10 câu/lượt, phím 1–4, R nghe lại. Chấm lịch FSRS như Điền lời (chỉ thẻ đến hạn, tối đa "Được").

## Karaoke điền lời (`/review/karaoke`)
Chọn một bài trong số bài có ≥ 2 thẻ có câu hát. Video YouTube hiện thật, tua tới trước câu 3 giây, tới câu thì lời hiện với chỗ trống và 4 lựa chọn. Mặc định tạm dừng chờ trả lời (nhẹ nhàng); tùy chọn "Chạy liên tục" thì không trả lời kịp trước khi hết câu là hụt. Chỉ hiện các câu có thẻ của người dùng (không hiện cả bài). Chấm lịch FSRS như Điền lời.

## Bảng xếp hạng (`/review/leaderboard`)
- Điểm mỗi chế độ: pinyin (có sẵn), Điền lời/Nghe và chọn/Karaoke 100 + combo×5 (tối đa +50), Ghép cặp 200 + thưởng tốc độ − 25 mỗi lần nhầm.
- Ghi điểm mỗi lượt qua `POST /api/practice/score` (server kiểm tra trần điểm, số câu, thời gian tối thiểu, giới hạn 40 lượt/giờ). Điểm do client tính nên chỉ chống gian lận ở mức hợp lý, ghi rõ hạn chế.
- Bảng chỉ hiện người đã bật tham gia + biệt danh (3–20 ký tự, chữ/số/dấu cách . _ -, duy nhất không phân biệt hoa thường). Tuần bắt đầu thứ Hai 00:00 giờ Việt Nam. Không lộ user_id.
- Migration mới: `leaderboard_profiles`, `practice_scores`, hàm `leaderboard_top`; chỉ server đọc/ghi.

## Thứ tự làm
1. Nghe và chọn 2. Karaoke 3. Bảng xếp hạng + gửi điểm từ mọi chế độ (giữ lại push tới khi user chạy migration).
