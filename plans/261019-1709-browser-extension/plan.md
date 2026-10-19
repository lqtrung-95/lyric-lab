# Tiện ích trình duyệt SongHanzi (Chrome, Edge, Firefox)

Trạng thái: BACKLOG (2026-10-19: người dùng quyết định để sau, ưu tiên [lộ trình học](../261019-2035-learning-paths-and-lessons/plan.md)). Kế hoạch giữ nguyên để làm lại khi cần. Nghiên cứu: [research/findings.md](research/findings.md).

## Quyết định đã chốt với người dùng
- Làm tiện ích để có người dùng (web khó thu hút). Cả 3 trình duyệt (WXT), nếu Firefox phát sinh nhiều việc thì Chrome + Edge trước.
- Hạn mức AI "B kèm A": (B) một project Gemini TRẢ PHÍ có trần ngân sách, chia hạn mức theo tài khoản Google đăng nhập; (A) người dùng nặng dán key Gemini của họ. TUYỆT ĐỐI không xoay nhiều project miễn phí (Google vừa gửi cảnh báo vi phạm).

## Phạm vi
Trên video YouTube có phụ đề tiếng Trung: hiện pinyin, Hán Việt, nghĩa Việt theo từng câu; bấm từ để tra (HSK, nghĩa) và lưu thẻ vào tài khoản SongHanzi. Chỉ máy tính; điện thoại dùng web/PWA như cũ.

## Nguyên tắc thiết kế
1. Không tốn AI cho đường chính: nghĩa Việt lấy từ phụ đề dịch của YouTube hoặc từ bản dịch đã có trong DB; pinyin/Hán Việt/HSK từ từ điển của ta.
2. Nguồn phụ đề theo thứ tự: video đã có trong kho của ta (`/api/videos/[id]`, chất lượng cao nhất) → phụ đề bắt từ player của trang → server InnerTube. Mỗi bước hỏng thì xuống bước sau.
3. Mọi lệnh gọi API của tiện ích đi qua background service worker (không gọi từ content script để khỏi vướng CORS/CSP của YouTube).
4. Quyền tối thiểu: chỉ `youtube.com`, `songhanzi.com`, `storage`. Không đọc lịch sử, không `<all_urls>`.
5. Key Gemini của người dùng (A) chỉ nằm ở `storage.local`, gọi Gemini trực tiếp từ background, không gửi lên server ta.

## Giai đoạn (S nhỏ, M vừa, L lớn)
| # | Giai đoạn | Cỡ | Cổng qua |
|---|---|---|---|
| 1 | [Spike kỹ thuật](phase-01-technical-spikes.md) | S | Lấy được phụ đề + đăng nhập chạy được; nếu không thì dừng/đổi hướng |
| 2 | [Bản đầu, không AI](phase-02-core-overlay-and-cards.md) | L | Lớp phủ, tra từ, lưu thẻ, đăng nhập |
| 3 | [Hạn mức AI B + A](phase-03-ai-quota.md) | M | Giải nghĩa câu theo hạn mức, ô key riêng |
| 4 | [Phát hành 3 kho](phase-04-store-release.md) | M | Gói duyệt xong ở Chrome, Edge, Firefox |
| 5 | AI nghe video không phụ đề từ tiện ích | M | Chỉ làm khi 1-4 ổn định (kế hoạch riêng) |

## Phụ thuộc và thứ tự
Giai đoạn 1 chặn mọi giai đoạn sau. Giai đoạn 3 cần quyết định chi phí (xem câu hỏi mở). Giai đoạn 4 có thể chuẩn bị tài liệu (chính sách riêng tư, ảnh chụp) song song với giai đoạn 3.

## Rủi ro chính
- YouTube đổi trang/chặn bắt phụ đề: có đường server dự phòng + kiểm thử định kỳ + bản cập nhật nhỏ nhanh.
- Cửa hàng từ chối (quyền, mục đích đơn nhất, quyền riêng tư): xin quyền hẹp, viết chính sách rõ.
- Chi phí AI (B): trần ngân sách trên project trả phí và lượt/ngày thấp từ đầu; theo dõi qua `usage_events`.
- Tiện ích che/đè giao diện YouTube: đặt lớp phủ ở khu vực riêng, có nút ẩn, tôn trọng chế độ tối và rạp.

## Câu hỏi mở (cần người dùng)
1. Tên tiện ích và biểu tượng (đề xuất: "SongHanzi: học tiếng Trung trên YouTube").
2. Ngân sách AI hàng tháng chấp nhận được cho (B) và số lượt miễn phí/ngày/người (đề xuất 20 giải nghĩa, chỉnh theo số liệu).
3. Tài khoản nhà phát triển: Chrome Web Store (~5 USD một lần), Edge Add-ons (miễn phí), Mozilla AMO (miễn phí). Ai đứng tên, dùng email nào?
4. Có đồng ý bật thanh toán cho MỘT project Gemini để thay cách xoay key hiện tại (cần cho cả web, không chỉ tiện ích)?
