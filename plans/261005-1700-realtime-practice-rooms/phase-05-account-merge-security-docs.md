# Giai đoạn 5: Gộp tài khoản, chống lạm dụng, kiểm thử và tài liệu

## Context
- [plan.md](plan.md). Bài học liên quan: `docs/handoff-and-status.md` (bẫy "Gộp tài khoản làm mất dữ liệu"), `supabase/migrations/20261004000001_merge_user_data_all_user_tables.sql`, `app/api/account/delete/route.ts`.

## Tổng quan
Ưu tiên cao (không được bỏ). Chưa làm. Đảm bảo bảng mới không làm mất dữ liệu khi người dùng đăng nhập Google hoặc xóa tài khoản, chống đoán mã/lạm dụng tạo phòng, kiểm thử và cập nhật 4 tài liệu bàn giao.

## Điểm then chốt
- **Bảng nào có `user_id` thì phải vào `merge_user_data`**, nếu không bị xóa cascade khi tài khoản ẩn danh được gộp.
- Cùng lúc đó, "bạn luyện cùng gần đây" suy ra từ `room_players`, nên gộp tài khoản phải giữ lịch sử này.

## Yêu cầu
- Gộp tài khoản (migration mới, `create or replace` đầy đủ thân hàm hiện có + phần mới): chuyển `room_players` từ tài khoản ẩn danh sang tài khoản đích. Nếu cả hai tài khoản cùng nằm trong một phòng (khóa `(room_id, user_id)` trùng), giữ hàng của tài khoản đích và bỏ hàng của tài khoản nguồn. `rooms.host_id` cũng chuyển sang tài khoản đích.
- Xóa tài khoản: `room_players` xóa theo cascade; `rooms.host_id` đặt null (phòng còn lại cho lịch sử của người kia).
- Chống lạm dụng: hạn mức tạo phòng (`room`, giai đoạn 1), giới hạn số lần nhập mã sai theo tài khoản và IP, một người một phòng đang chơi, biệt danh qua `validateNickname`.

## Kiểm thử
- Tích hợp (DB thật, client riêng cho đăng nhập ẩn danh): vòng đời phòng, quyền đọc RLS (người ngoài phòng không đọc được), đáp án không đọc được từ client, gộp tài khoản chuyển đúng `room_players` kể cả trường hợp trùng phòng, xóa tài khoản.
- E2E (Playwright): hai ngữ cảnh trình duyệt tạo phòng, vào bằng mã, chơi hết 10 câu, so kết quả. Giả lập YouTube không cần vì màn chơi không dùng player.
- Đơn vị: các hàm thuần ở giai đoạn 1–3.

## Các file liên quan
- Tạo: `supabase/migrations/<ngày>_merge_user_data_rooms.sql`; `tests/integration/rooms.test.ts`; `tests/e2e/room-versus.spec.ts`.
- Sửa: `docs/handoff-and-status.md`, `docs/system-architecture.md`, `docs/operations-runbook.md` (migration mới, giới hạn Realtime cần theo dõi), `docs/code-standards.md` (nếu có quy ước mới, ví dụ "chấm điểm đấu ở server"), `docs/backlog.md` (giai đoạn 2 của dự án).

## Các bước
1. Migration gộp tài khoản + test tích hợp trước (làm trước khi mở tính năng cho người dùng).
2. Giới hạn đoán mã và hạn mức; thử chủ động đoán mã.
3. E2E hai người chơi.
4. Cập nhật bốn tài liệu bàn giao trong cùng commit; ghi mục "Phòng thi đấu" vào bảng bẫy nếu gặp.
5. Chạy toàn bộ: `npx tsc --noEmit`, `npm run lint`, `npm run test`, test tích hợp, e2e liên quan.

## Danh sách việc
- [ ] Migration gộp tài khoản + test
- [ ] Giới hạn đoán mã, hạn mức
- [ ] E2E hai người
- [ ] Cập nhật bốn tài liệu bàn giao
- [ ] Chạy toàn bộ kiểm thử

## Tiêu chí hoàn thành
Người ẩn danh chơi vài ván rồi đăng nhập Google thì lịch sử phòng còn nguyên; đoán mã bừa bị chặn; mọi test qua; docs cập nhật.

## Rủi ro
- Quên một bảng khi gộp: kiểm tra bằng test tích hợp liệt kê mọi bảng có `user_id` mới.
- Đoán mã (1 triệu khả năng): giới hạn tần suất + phòng chờ chỉ sống 30 phút.

## Bảo mật
Chỉ server ghi; RLS chỉ cho thành viên đọc; đáp án nằm bảng không có policy; biệt danh được kiểm duyệt cơ bản qua quy tắc ký tự hiện có; không có kênh chat tự do ở giai đoạn 1.

## Bước tiếp theo
Giai đoạn 2 của dự án: ghép ngẫu nhiên (hàng đợi + "bóng ma"), lời mời, danh sách bạn luyện cùng gần đây, thêm chế độ, emoji.

## Câu hỏi còn mở
- Có cần cơ chế báo cáo/chặn người chơi ngay giai đoạn 1 (vì chỉ chơi với người có mã)? Đề xuất: để giai đoạn 2, khi có ghép ngẫu nhiên với người lạ.
