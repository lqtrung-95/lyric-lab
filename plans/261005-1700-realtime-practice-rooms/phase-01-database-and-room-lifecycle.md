# Giai đoạn 1: Cơ sở dữ liệu và vòng đời phòng

## Context
- Kế hoạch tổng: [plan.md](plan.md). Mẫu migration và RLS: `supabase/migrations/20260925000005_user_accounts.sql`, `20260925000010_leaderboard.sql`.
- Hạn mức: `lib/rate-limit/usage-limit-config.ts` (`UsageKind`), ràng buộc `usage_events_kind_check` (đã từng đổi ở migration leaderboard).

## Tổng quan
Ưu tiên cao. Chưa làm. Tạo bảng, API tạo/vào/rời/bắt đầu phòng, mã 6 số, hạn mức tạo phòng.

## Điểm then chốt
- Mọi ghi vào phòng đi qua API ở server (service role). Client chỉ **đọc** phòng của mình qua RLS (cũng là điều kiện để Postgres Changes ở giai đoạn 3 chỉ phát cho thành viên).
- Đáp án đúng nằm ở bảng riêng không có policy cho client, để không rò rỉ qua Realtime.

## Yêu cầu
- Chức năng: tạo phòng (mã 6 số), vào bằng mã hoặc link, rời phòng, chủ phòng chọn bài hoặc để trống (ngẫu nhiên), bắt đầu khi đủ 2 người đã sẵn sàng.
- Chia sẻ phòng: sao chép mã, sao chép link mời, nút "Gửi Zalo / Link" (Web Share API; thiết kế dành cho người dùng Việt).
- Phi chức năng: mã khó đoán bừa (giới hạn số lần thử vào phòng); phòng chờ tự hết hạn sau 10 phút (thiết kế có đồng hồ đếm ngược ~10 phút trong phòng chờ); ẩn danh dùng được.

## Kiến trúc (schema đề xuất, tên tạm)
- `rooms`: `id`, `code` (6 chữ số, duy nhất trong các phòng còn hiệu lực), `host_id` (`auth.users`, `on delete set null`), `video_id` (null = ngẫu nhiên, điền khi bắt đầu), `status` (`waiting` | `playing` | `finished` | `expired`), `seed` (số nguyên cố định bộ câu hỏi), `question_count` (10), `created_at`, `started_at`, `expires_at` (tạo + 10 phút).
- `room_players`: `room_id`, `user_id`, `display_name`, `ready`, `joined_at`, `left_at`, `score`, `correct`, `total_ms`; khóa `(room_id, user_id)`. Cũng là nguồn suy ra "bạn luyện cùng gần đây".
- `room_questions` / `room_question_keys`: câu hỏi công khai (đã bỏ đáp án) và bảng khóa đáp án riêng (không policy cho client); chi tiết ở giai đoạn 2 và 3.
- RLS: thành viên của phòng được `select` `rooms` và `room_players` của phòng đó; không ai ghi trực tiếp.
- Mở rộng `usage_events_kind_check` thêm `'room'`; `UsageKind` thêm `"room"` (tạo phòng: ẩn danh 10/ngày, thành viên 30/ngày, đề xuất).

## Các file liên quan
- Tạo: `supabase/migrations/<ngày>_practice_rooms.sql`; `lib/rooms/room-code.ts` (+ test); `lib/rooms/room-types.ts`; `app/api/rooms/route.ts` (tạo), `app/api/rooms/[code]/route.ts` (xem), `.../join`, `.../ready`, `.../leave`, `.../start`.
- Sửa: `lib/rate-limit/usage-limit-config.ts` (+ test).

## Các bước
1. Viết migration (bảng, chỉ mục, RLS, ràng buộc kind), chạy trên Supabase SQL Editor (DB dùng chung với production, nên chạy tay sau khi chủ dự án duyệt).
2. `room-code.ts`: sinh mã 6 số ngẫu nhiên an toàn (`crypto`), kiểm tra va chạm, chuẩn hóa mã nhập vào (bỏ dấu cách, rút mã từ link).
3. API tạo phòng: cần phiên (ẩn danh cũng được), kiểm tra `consumeUsage(user,"room")`, tên hiển thị qua `validateNickname`.
4. API vào phòng: giới hạn số lần thử theo tài khoản và IP (chống đoán mã), từ chối phòng đầy (2 người) hoặc không còn `waiting`.
5. API sẵn sàng/rời/bắt đầu: chỉ chủ phòng bắt đầu, cần đủ 2 người và cả hai sẵn sàng; chọn bài ngẫu nhiên ở bước này nếu `video_id` trống.
6. Test đơn vị cho mã phòng và hạn mức; test tích hợp cho API trên DB thật (client riêng cho đăng nhập ẩn danh, bài học từ test gộp tài khoản).

## Danh sách việc
- [ ] Migration + RLS + kind
- [ ] `room-code` + test
- [ ] API tạo/vào/sẵn sàng/rời/bắt đầu
- [ ] Hạn mức `room`
- [ ] Test tích hợp

## Tiêu chí hoàn thành
Hai tài khoản ẩn danh tạo phòng, vào bằng mã, thấy nhau, cùng sẵn sàng và chủ phòng bắt đầu được; đoán mã bừa bị chặn; test qua.

## Rủi ro
- Va chạm mã khi nhiều phòng: kiểm tra duy nhất trong phòng còn hiệu lực, thử lại.
- Phòng "mồ côi" không bao giờ kết thúc: `expires_at` và dọn khi truy cập.

## Bảo mật
Không lộ `host_id`/`user_id` của người khác ra client ngoài những gì cần (tên hiển thị). Mã không đặt trong URL log công khai ngoài link mời.

## Bước tiếp theo
Giai đoạn 2 (bộ câu hỏi).

## Câu hỏi còn mở
- Có cho một người ở nhiều phòng cùng lúc không? Đề xuất: không, vào phòng mới thì rời phòng cũ.
