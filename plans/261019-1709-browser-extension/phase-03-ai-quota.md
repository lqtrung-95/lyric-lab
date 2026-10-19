# Giai đoạn 3: Hạn mức AI (B kèm A) (cỡ M)

## Mục tiêu
Giải nghĩa câu theo yêu cầu bằng AI, dùng hạn mức theo tài khoản Google (B); người dùng nặng dán key của họ (A). Thay luôn cách xoay nhiều project miễn phí đang chạy.

## Quyết định
- (B) MỘT project Gemini trả phí (bật billing), một key, có trần ngân sách và cảnh báo chi phí ở Google Cloud. Model rẻ trước (`gemini-3.5-flash-lite`), dự phòng `gemini-3-flash-preview`. Cấu hình `GEMINI_API_KEYS` chỉ còn khóa của project này (vẫn hỗ trợ nhiều khóa nhưng cùng một project hợp lệ).
- Loại hạn mức mới `ext_ai` trong `lib/rate-limit/usage-limit-config.ts` (khách: 0, thành viên Google: 20/24 giờ ban đầu) + migration thêm kind vào ràng buộc `usage_events` (người dùng tự chạy). Hoàn lượt khi lỗi hệ thống như `voice`.
- (A) ô "Dùng key Gemini của tôi" trong popup: lưu `storage.local`; khi có key thì background gọi `generativelanguage.googleapis.com` trực tiếp, KHÔNG trừ hạn mức ta; hướng dẫn 3 bước lấy key ở AI Studio; xóa key bất kỳ lúc nào.
- Hiển thị: còn bao nhiêu lượt hôm nay; hết lượt thì gợi ý (A) hoặc chờ.

## Các bước
1. Kiểm kê nơi dùng `GEMINI_API_KEYS` và gom về key trả phí; cập nhật `operations-runbook` (script nạp video vẫn chạy được với key trả phí, chi phí theo yêu cầu; đo chi phí một video).
2. `ext_ai` + migration + route `POST /api/ext/explain-line` (tái dùng `explain-line` hiện có, thêm Bearer + hạn mức).
3. UI: nút "Giải nghĩa câu" trong thẻ tra/lớp phủ; trạng thái đang tải, lỗi, hết lượt.
4. Chế độ (A): lưu key, gọi trực tiếp, kiểm tra key hợp lệ bằng một lệnh nhỏ, thông báo lỗi rõ.
5. Theo dõi chi phí: bảng admin/script tính số lượt `ext_ai` mỗi ngày, ước tính tiền.
6. Test: Vitest (hạn mức, hoàn lượt), e2e (hết lượt → gợi ý (A)).

## Thành công khi
Thành viên Google giải nghĩa được 20 câu/ngày không tốn quota key miễn phí nào; người dán key riêng dùng không giới hạn; chi phí thực tế mỗi ngày đo được và dưới ngân sách đặt.

## Rủi ro
- Chi phí vượt dự tính: trần ngân sách + hạ lượt/ngày; tắt (B) bằng biến môi trường.
- Key (A) bị lộ trong máy người dùng: chỉ lưu cục bộ, cảnh báo trong UI, không đồng bộ qua `storage.sync`.
- Người dùng nhầm key (A) của project đã bị hạn chế: báo lỗi 403 rõ ràng.
