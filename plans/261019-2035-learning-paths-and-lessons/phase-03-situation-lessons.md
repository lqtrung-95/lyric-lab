# Giai đoạn 3: Bài học theo tình huống đời sống (cỡ L)

## Mục tiêu
Bộ bài ngắn theo tình huống (đề xuất 10 đầu: chào hỏi, giới thiệu bản thân, gọi món, mua sắm/trả giá, hỏi đường, đi taxi/xe, khách sạn, bệnh viện, điện thoại/WeChat, đi làm/văn phòng), mỗi bài có hội thoại, từ vựng, và luyện nói được chấm.

## Nội dung
Mỗi bài: 1 hội thoại 6-10 lượt (hai người), 8-12 từ/cụm chủ chốt, 3-4 mẫu câu hữu ích, ghi chú văn hóa ngắn bằng tiếng Việt. Gắn cấp HSK (chủ yếu HSK 1-3).
- Soạn: AI sinh bản nháp theo khung cố định (cấp HSK, từ khóa bắt buộc, độ dài) → chạy qua kiểm tra tự động (mọi từ trong danh sách cấp cho phép hoặc đánh dấu "từ mở rộng"; pinyin/Hán Việt do từ điển điền, không do AI) → NGƯỜI DUYỆT (admin màn duyệt giống màn duyệt video hiện có) → mới `listed`.
- Lưu trong `course_units` (kind `situation`), nội dung jsonb; không dùng lời bài hát.

## Luồng một bài
1. Nghe hội thoại (giọng đọc Azure hai giọng khác nhau cho hai vai; file TTS dùng kho đã có).
2. Xem từng câu: pinyin, Hán Việt, nghĩa; bấm từ để tra và lưu thẻ.
3. Đọc theo vai: người học chọn một vai, đọc câu của vai đó, **chấm từng chữ** (đã có `ReadAloudPractice`), AI/máy đọc vai còn lại.
4. Ôn nhanh: ghép cặp/điền chỗ trống từ hội thoại.
5. Kết quả vào tiến độ + mục tiêu ngày.

## Các bước làm
1. Định dạng hội thoại (jsonb) + kiểm tra hợp lệ (zod) + test.
2. Script sinh nháp (dry-run, lưu JSON để xem) + bộ lọc cấp HSK + màn admin duyệt.
3. Màn bài (nghe → xem → đọc theo vai → ôn).
4. Nhà trọ vai: ghép giọng đọc cho hai vai (kiểm tra Azure có sẵn hai giọng zh-CN).
5. 10 tình huống đầu: sinh, duyệt, phát hành từng đợt 2-3 bài; thu phản hồi trước khi sinh tiếp.
6. E2E + tài liệu.

## Tiêu chí xong
10 bài đã duyệt, mỗi bài hoàn thành được trong ≤ 7 phút, mọi từ có pinyin/Hán Việt từ từ điển, có nút báo nội dung sai.

## Rủi ro
- Hội thoại AI không tự nhiên hoặc sai: bắt buộc người duyệt; danh sách mẫu câu "đúng như người bản xứ nói" nên do người bản ngữ rà; không phát hành bài chưa duyệt.
- Chi phí AI sinh nội dung: một lần, ngoài giờ cao điểm, dùng key trả phí/hạn mức riêng (không đụng hạn mức người dùng).
- Quá nhiều bản nháp tồn: phát hành theo đợt nhỏ.
