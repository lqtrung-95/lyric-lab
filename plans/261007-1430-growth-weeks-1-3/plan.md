# Tăng trưởng tuần 1–3 (nguồn: docs/backlog.md, mục "Kế hoạch tăng trưởng 3 tháng")

| Tuần | Việc | Trạng thái |
|---|---|---|
| 1 | Nhắc học bằng web push (Vercel cron hằng ngày 20:00 giờ VN, dịch vụ worker, đăng ký trong Cài đặt + gợi ý ở trang chủ). Hạn mức phân tích bài mới/ngày đã có sẵn (10 ẩn danh / 30 đã đăng nhập). Rà hạn mức hạ tầng ghi ở runbook | Xong (code); chờ migration + khóa VAPID |
| 2 | "Độ hiểu được của bài" (X% bài, học N từ nữa để hiểu 80%) ở màn xem trước; thẻ chia sẻ một câu hát (ảnh dựng ở trình duyệt, một dòng lời, không có trang công khai) | Xong (code) |
| 3 | Thách đấu không cần cùng lúc (`/challenge/[code]`, bộ câu cố định, chấm ở server, bảng xếp hạng trong thử thách); lọc từ tục ở biệt danh; báo cáo người chơi | Xong (code); chờ migration |

## Quyết định
- Nhắc học dùng **web push** (không cần email, chạy với tài khoản ẩn danh, không phụ thuộc dịch vụ ngoài). iOS chỉ nhận khi đã cài app vào màn hình chính.
- Thiếu khóa VAPID/`CRON_SECRET` thì tính năng tự ẩn (không lỗi).
- Thách đấu dùng lại `buildRoomQuestions`, `RoomQuestionLine`, `RoomChoiceList`, `roomAnswerPoints`. Tạo thử thách tính vào hạn mức `room` (không cần đổi ràng buộc `usage_events`).
- Bảng mới có `user_id` mà không gộp được: ghi vào danh sách "ignored" của test gộp tài khoản kèm lý do.

## Email (thêm 2026-10-07)
Email chào mừng (lần đầu có email thật), email tổng kết tuần (thứ Hai, chỉ gửi khi tuần trước có học), email nhắc quay lại (3–30 ngày không học, tối đa 1 lần/7 ngày). Chỉ người đã đăng nhập Google (ẩn danh không có email). Có link hủy nhận (một chạm, kèm header List-Unsubscribe) và hai công tắc trong Cài đặt. Nhà cung cấp: Resend qua REST (`RESEND_API_KEY`, `EMAIL_FROM`); thiếu biến thì tự tắt. Cần tên miền riêng đã xác thực SPF/DKIM để gửi được tới người lạ.
