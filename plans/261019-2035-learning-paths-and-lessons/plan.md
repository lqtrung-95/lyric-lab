# Lộ trình học, bài học theo tình huống và trò chơi mới

Trạng thái: ĐÃ DUYỆT 2026-10-19, đang làm giai đoạn 1. Dữ liệu nền: [research/findings.md](research/findings.md). Tiện ích trình duyệt chuyển sang BACKLOG.

## Mục tiêu
Từ "thư viện nội dung và công cụ" thành "có đường đi rõ": người học luôn biết hôm nay học gì tiếp, và học bằng nội dung thật (video, bài hát) chứ không chỉ câu ví dụ do máy viết.

## Phát hiện then chốt
Kho 434 video / 78.725 dòng phủ **97% từ HSK 1 và 93% HSK 2 bằng ít nhất một câu thật** (HSK 3: 89%; HSK 4-6 giảm dần). Đây là lợi thế khác biệt: mỗi từ trong lộ trình HSK có thể được học kèm đúng đoạn video nơi nó xuất hiện.

## Nguyên tắc
1. Lộ trình HSK là xương sống; tình huống, trò chơi, tập viết đều là "loại bài" gắn vào cùng một khung (khóa → chặng → bài) và cùng một bảng tiến độ.
2. Pinyin, Hán Việt, cấp HSK luôn từ từ điển (quy tắc dự án); AI chỉ giúp soạn nội dung tình huống, luôn có bước người duyệt trước khi hiện.
3. Câu ví dụ lấy từ video/bài hát thật; không đưa lời bài hát có thật vào repo (chỉ tham chiếu `video_id` + `line_index` trong DB).
4. Tiến độ đồng bộ theo tài khoản như thẻ ôn (khách ẩn danh vẫn dùng được, gộp khi đăng nhập Google: cập nhật `merge_user_data`).
5. Mỗi giai đoạn tự đứng được và phát hành riêng; làm kỹ HSK 1 trước rồi nhân ra các cấp.

## Giai đoạn (S nhỏ, M vừa, L lớn)
| # | Giai đoạn | Cỡ | Ghi chú |
|---|---|---|---|
| 1 | [Khung khóa học + chỉ mục từ↔câu](phase-01-course-model-and-sentence-index.md) | L | Nền cho mọi thứ; cần migration |
| 2 | [Lộ trình HSK (HSK 1 kỹ, rồi 2-6)](phase-02-hsk-path.md) | L | Giá trị lớn nhất |
| 3 | [Bài học theo tình huống đời sống](phase-03-situation-lessons.md) | L | Cần người duyệt nội dung |
| 4 | [Trò chơi mới gắn vào lộ trình](phase-04-new-games.md) | M | Tái dùng dữ liệu có sẵn |
| 5 | [Tập viết chữ Hán](phase-05-writing-practice.md) | M | Cần xác nhận giấy phép dữ liệu nét |
| 6 | [Màn "Hôm nay" tích hợp](phase-06-today-screen.md) | M | Làm sau cùng |

Thứ tự đề xuất: 1 → 2 (HSK 1) → phát hành → 4 (vài trò) → 6 (bản đầu) → 2 (HSK 2-6) → 3 → 5. Lý do: sớm có thứ chạy được và đo phản ứng người dùng trước khi đầu tư nội dung tình huống (tốn công người duyệt nhất).

## Rủi ro chung
- Câu ví dụ chọn tự động kém (quá dài, nghĩa khác, nội dung nhạy cảm): bộ lọc chất lượng + người duyệt mẫu + nút báo lỗi.
- HSK 4-6 thiếu câu thật: nạp thêm video hoặc hiển thị bài không có ví dụ video.
- Quá nhiều thứ cùng lúc làm app rối: mọi thứ vào qua một cửa "Học" (phase 6), không thêm mục menu mới cho mỗi loại.
- Bản quyền nội dung video: giữ nguyên chính sách hiện có (nguồn đã duyệt, gỡ theo yêu cầu).

## Quyết định đã chốt (người dùng trả lời 2026-10-19)
1. Làm HSK 1 kỹ trước rồi nhân ra các cấp. 2. Người dùng tự duyệt nội dung tình huống. 3. 10 tình huống theo đề xuất (chào hỏi, giới thiệu bản thân, gọi món, mua sắm/trả giá, hỏi đường, taxi/xe, khách sạn, bệnh viện, điện thoại/WeChat, đi làm/văn phòng).
4. CÓ bài kiểm tra xếp lớp (giai đoạn 6). 5. CÓ huy hiệu và XP (thêm vào giai đoạn 6: `user_xp_events` hoặc suy ra từ tiến độ, bộ huy hiệu cố định; quy tắc XP chốt khi làm, XP chỉ cộng cho hoạt động thật, chống lặp một bài nhiều lần).
