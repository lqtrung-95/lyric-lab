# Giai đoạn 6: Màn "Hôm nay" tích hợp (cỡ M)

## Mục tiêu
Một chỗ cho người học thấy việc nên làm tiếp, gom mọi thứ đã có: thẻ đến hạn, chặng tiếp theo của lộ trình, mục tiêu ngày/chuỗi ngày, bài hát/video gợi ý đúng cấp, tình huống đang học.

## Hiện trạng cần mở rộng (không viết lại)
Trang chủ đã có `NextActionPanel` (việc tiếp theo + mục tiêu ngày), `TodayPlan` (gợi ý video/bài theo level), `DailyGoalRing`. Logic chọn việc ở `lib/home/home-logic.ts` và `lib/home/today-plan.ts`.

## Thiết kế
- `chooseNextAction` thêm các lựa chọn: "Tiếp tục chặng HSK x.y", "Ôn n thẻ đến hạn", "Học bài tình huống đang dở". Quy tắc ưu tiên rõ ràng, có test, một việc nổi bật + hai việc phụ.
- Lộ trình mặc định: cấp lấy từ cài đặt `level` của người dùng (đã có) hoặc bài kiểm tra xếp lớp (tùy chọn).
- Một cửa "Học" ở thanh điều hướng dẫn tới `/hoc`; không thêm mục menu riêng cho từng loại bài.
- Nhắc học (push/email hiện có) trỏ tới việc tiếp theo thay vì trang chung.

## Các bước
1. Mở rộng logic chọn việc + test (Vitest).
2. Cập nhật giao diện chủ + bản đồ lộ trình; kiểm tra điện thoại.
3. Điều hướng: mục "Học" (`/hoc`), cập nhật menu/footers/tour hướng dẫn.
4. Bài kiểm tra xếp lớp (tùy chọn, nếu người dùng đồng ý): 12 câu, ra cấp gợi ý.
5. E2E + a11y + tài liệu.

## Tiêu chí xong
Người dùng mở app thấy đúng MỘT việc tiếp theo hợp lý trong mọi trạng thái (mới, đang học dở, hết việc, chưa đăng nhập), và chạm một lần là vào đúng nơi.

## Rủi ro
Trang chủ dày đặc: giữ một việc nổi bật; hành vi của người dùng cũ thay đổi: giữ nguyên lối vào cũ, chỉ bổ sung.
