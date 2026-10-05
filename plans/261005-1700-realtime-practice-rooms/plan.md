# Phòng luyện tập thời gian thực (thi đấu 1v1)

Hai người vào cùng một phòng, cùng thấy một bộ câu hỏi về một bài hát và trả lời cùng lúc; ai đúng nhiều hơn thắng. Tham khảo luồng của một app khác: thẻ "Tìm bạn luyện cùng" (ghép ngẫu nhiên) và "Mời bạn" (mã 6 số hoặc link), mục Lời mời và Bạn luyện cùng gần đây.

Trạng thái: **kế hoạch đã chốt các quyết định về thiết kế, chờ duyệt để bắt đầu code** (2026-10-05). Chưa có code.

## Quyết định đã chốt với chủ dự án

| Mục | Quyết định |
|---|---|
| Đối thủ | Cả mời bạn (mã 6 số + link) và ghép ngẫu nhiên |
| Điểm | Đúng là chính, tốc độ chỉ phụ. Người thắng = **nhiều câu đúng hơn**; hòa số câu đúng thì so tổng điểm (có thưởng tốc độ). Mỗi câu đúng 100 điểm + thưởng tốc độ 0–30 (xem phase-02) |
| Kiểu chơi | Thời gian thực, trong phòng |
| Chọn bài | Chủ phòng chọn từ bài đã phân tích, hoặc "Ngẫu nhiên" (hệ thống chọn bài phổ biến hợp trình độ) |
| Danh tính | Ẩn danh vẫn chơi được. "Bạn luyện cùng gần đây" chỉ hiện với người đã đăng nhập Google, kể cả khi đối thủ cũ là ẩn danh (ghi "Chơi 5/10"); lời mời hết hạn sau ~10 phút |
| Gộp tài khoản | Lịch sử phòng đi theo khi người ẩn danh đăng nhập Google (bảng mới có `user_id` phải vào `merge_user_data`) |

## Phạm vi theo giai đoạn

- **Giai đoạn 1 (kế hoạch này):** mời bạn bằng mã/link, 2 người, một chế độ (Điền lời, có nghe đoạn với khung video luôn hiển thị theo điều khoản YouTube), 10 câu, kết quả, chơi lại. Gồm cả chọn bài (chọn tay hoặc ngẫu nhiên) và gộp tài khoản.
- **Giai đoạn 2 (chưa lập kế hoạch):** ghép ngẫu nhiên (hàng đợi + "bóng ma" khi không có ai), lời mời, danh sách bạn luyện cùng gần đây, thêm chế độ chơi, phản ứng emoji.

## Thiết kế Stitch (đã có trong `design/`)

4 màn: sảnh Thi đấu 1v1 (desktop), phòng chờ/tạo phòng (điện thoại), màn chơi (desktop và điện thoại). Đối chiếu từng chi tiết với kế hoạch, phần nào thuộc giai đoạn 1 hay 2, phần nào cần quyết định: xem [design-mapping.md](design-mapping.md).

## Các giai đoạn thực hiện (trong giai đoạn 1)

| # | File | Nội dung | Ước lượng | Trạng thái |
|---|---|---|---|---|
| 1 | [phase-01-database-and-room-lifecycle.md](phase-01-database-and-room-lifecycle.md) | Schema, RLS, tạo/vào/rời phòng, mã 6 số, hạn mức | 0,5–1 ngày | Xong (2026-10-05) |
| 2 | [phase-02-question-engine-and-scoring.md](phase-02-question-engine-and-scoring.md) | Sinh bộ câu hỏi chung từ phân tích bài, chấm ở server, tính điểm | 1 ngày | Xong (2026-10-05) |
| 3 | [phase-03-realtime-game-state-machine.md](phase-03-realtime-game-state-machine.md) | Máy trạng thái ván chơi, kênh thời gian thực, rớt mạng | 1–1,5 ngày | Chưa làm |
| 4 | [phase-04-room-ui.md](phase-04-room-ui.md) | Màn Thi đấu, phòng chờ, màn chơi, kết quả | 1–1,5 ngày | Chưa làm |
| 5 | [phase-05-account-merge-security-docs.md](phase-05-account-merge-security-docs.md) | Gộp tài khoản, chống lạm dụng, kiểm thử tích hợp/e2e, cập nhật docs | 0,5–1 ngày | Chưa làm |

Tổng ước lượng 4–6 ngày (ước lượng thô, chưa tính thử nghiệm với hai trình duyệt thật).

## Phụ thuộc và nguyên tắc xuyên suốt

- Phải đọc `docs/handoff-and-status.md`, `docs/system-architecture.md`, `docs/code-standards.md` trước khi code; cập nhật 4 tài liệu bàn giao trong cùng commit (quy tắc ở `CLAUDE.md`).
- Tái dùng: `lib/practice/cloze.ts` (`buildCloze`, `buildChoices`), `lib/practice/random.ts` (`shuffle`, `seededRng`), `lib/rate-limit/consume-usage.ts`, `lib/leaderboard/nickname.ts`.
- Không gửi đáp án đúng xuống client trước khi trả lời. Mọi chấm điểm ở server.
- Không chat tự do (an toàn với người lạ ở giai đoạn 2); biệt danh qua `validateNickname`.
- Câu hỏi hiển thị lời bài hát chỉ trong phiên chơi, trang phòng `noindex`.

## Câu hỏi còn mở

Xem cuối từng file giai đoạn. Giới hạn Realtime của gói Free (200 kết nối, 100 tin nhắn/giây, 2 triệu tin nhắn/tháng) đã kiểm chứng và ghi ở phase-03: đủ cho khoảng 100 ván cùng lúc. Còn lại cần đo độ trễ Postgres Changes khi dựng thật.
