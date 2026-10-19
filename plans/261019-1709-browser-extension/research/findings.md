# Kết quả nghiên cứu (2026-10-19)

## 1. Lấy phụ đề YouTube trong trình duyệt
- `timedtext` gọi từ ngoài trang trả 200 RỖNG nếu thiếu token PO (`pot`) gắn với video/khách; token do JS của player YouTube tạo lúc chạy, không phải cookie. Nguồn: [DEV: transcript scraper trả chuỗi rỗng 2026](https://dev.to/jamhimself/why-your-youtube-transcript-scraper-started-returning-empty-strings-and-how-to-fix-it-in-2026-20ed), [youtube-transcript-api#592](https://github.com/jdepoix/youtube-transcript-api/issues/592), [RustyPipe: PO token](https://code.thetadev.de/ThetaDev/rustypipe/raw/branch/main/notes/po_token.md).
- Hệ quả cho tiện ích: KHÔNG tự gọi `timedtext`. Hai đường khả thi (chưa kiểm chứng trên trang thật, đây là nội dung Spike 1): (a) chạy script ở "main world" của trang, bật track phụ đề qua API player (`getOption/setOption('captions', ...)`, kể cả track dịch `tlang=vi`) và bắt phản hồi `timedtext` mà CHÍNH player gọi (đã có `pot`); (b) hỏi server của ta.
- Server ta đã có `YouTubeInnertubeCaptionProvider` (đang dùng ở `/api/videos/add`, `lib/captions`) và 170+ video đã chép/chú giải sẵn trong DB (`/api/videos/[videoId]`). Đây là đường dự phòng và là đường chất lượng cao nhất cho video đã có.

## 2. Điều khoản Gemini và nhiều project
- Điều khoản Gemini API không có câu cấm "nhiều project" nguyên văn trong kết quả tìm được (trang điều khoản bản 14/05/2024, chưa chắc là bản mới nhất), nhưng có báo cáo thực tế: [project bị hạn chế vì "quota circumvention"](https://discuss.ai.google.dev/t/gemini-api-project-restricted-for-quota-circumvention-appeal-pending/175958), và [câu hỏi về kiến trúc nhiều project free-tier chưa ai trả lời](https://discuss.ai.google.dev/t/request-for-clarification-on-multi-project-gemini-api-free-tier-collaboration-architecture/176171). Cùng với email "Policy Violation" người dùng nhận ngày 2026-10-19, kết luận: ngừng xoay nhiều project để cộng dồn hạn mức.
- Google cũng cấm dùng OAuth của công cụ khác "bám" vào Gemini CLI ([FAQ](https://www.mintlify.com/google-gemini/gemini-cli/resources/faq)): KHÔNG dựng giải pháp dựa trên OAuth của người dùng cho API này khi chưa có xác nhận chính thức; dùng key của chính họ (A) hoặc project trả phí của ta (B).

## 3. WXT (khung dựng tiện ích)
- Một mã nguồn build ra Chrome (MV3), Firefox, Edge, Safari; cấu hình riêng từng trình duyệt (`browser_specific_settings.gecko` cho Firefox), lệnh `wxt build -b firefox`, `wxt zip -b edge`; Firefox yêu cầu nộp kèm mã nguồn (WXT tạo gói sources). Nguồn: [LogRocket](https://blog.logrocket.com/developing-web-extensions-wxt-library), [WXT docs trên context7](https://context7.com/wxt-dev/wxt). Cần đọc lại docs chính thức của WXT khi bắt đầu Giai đoạn 1 (bản tìm được là bài của bên thứ ba).

## 4. Đăng nhập từ tiện ích
- `chrome.identity.launchWebAuthFlow` chạy được với nhà cung cấp bất kỳ nhưng popup dễ đóng giữa chừng; cách ổn định: đăng nhập trên chính trang songhanzi.com (tab thường) rồi truyền token cho tiện ích, hoặc xử lý ở background script. Nguồn: [thảo luận GitHub](https://github.com/orgs/community/discussions/165967), [MDN](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow). Firefox dùng cùng API nhưng URL chuyển hướng khác (`*.extensions.allizom.org`).
- Server ta xác thực bằng cookie Supabase (`getCurrentUser` → `supabase.auth.getUser()`). Tiện ích cần Bearer token: thêm đường đọc `Authorization: Bearer` vào `getCurrentUser` (Spike 2 xác định đường chuyển phiên: content script trên songhanzi.com gửi phiên cho tiện ích, hay cookie `credentials: include`).

## Chưa tra được / phải thử thật
- Hành vi chính xác của `pot` khi bắt phản hồi trong main world.
- Cookie SameSite của songhanzi.com có được gửi từ background của tiện ích hay không.
- Chính sách hiện hành của Chrome Web Store về tiện ích sửa giao diện YouTube (kiểm tra "single purpose", mô tả quyền) khi chuẩn bị phát hành.
