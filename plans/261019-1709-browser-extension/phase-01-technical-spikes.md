# Giai đoạn 1: Spike kỹ thuật (cỡ S, cổng quyết định)

## Bối cảnh
Hai câu hỏi quyết định tiện ích có làm được không: lấy phụ đề từ trang YouTube, và đưa phiên đăng nhập sang tiện ích. Nghiên cứu: [findings](research/findings.md). Spike là mã vứt đi trong `extension/` (nhánh riêng), kết quả ghi lại ở cuối file này.

## Spike 1: lấy phụ đề + bản dịch tiếng Việt trên trang YouTube thật
Giả thuyết: script chạy ở main world gọi API player để bật track Trung (và track dịch sang `vi`), rồi bắt phản hồi `timedtext` (đã kèm `pot`) bằng cách bọc `fetch`/`XMLHttpRequest`.
Việc làm:
1. Dựng khung WXT tối thiểu có content script (isolated) + script main world + tin nhắn giữa hai bên.
2. Thử 8 video: có phụ đề Trung thủ công; chỉ có tự động; không có; có Trung phồn thể; video dài >30 phút; video Shorts; video có quảng cáo đầu; chuyển video không tải lại trang (điều hướng SPA).
3. Với mỗi video ghi: có lấy được dòng không, đủ tới cuối không, có bản dịch `vi` không, mất bao lâu, có phải bật phụ đề của người xem không.
4. Đường dự phòng: gọi `GET /api/videos/[videoId]` (video đã có) và thử một đường server mới `GET /api/ext/captions?v=` dùng `YouTubeInnertubeCaptionProvider`; đo tỉ lệ thành công trên 20 video bất kỳ.
Tiêu chí qua: ≥ 80% video có phụ đề Trung lấy được đủ dòng bằng một trong các đường; thời gian đến lúc hiện phụ đề < 3 giây ở video đã có trong kho.
Nếu không qua: dừng, báo người dùng; phương án là tiện ích chỉ hoạt động với video đã có trong kho + nút "Thêm video này vào SongHanzi".

## Spike 2: đăng nhập tiện ích ↔ tài khoản SongHanzi
Thử lần lượt (dừng ở cách đầu tiên chạy ổn trên cả Chrome và Firefox):
1. Background `fetch(songhanzi.com/api/..., { credentials: "include" })` với `host_permissions`: cookie Supabase có được gửi không (SameSite).
2. Content script trên `songhanzi.com` đọc phiên và gửi cho tiện ích (`runtime.sendMessage`) khi người dùng đăng nhập trên web; tiện ích giữ `access_token` + `refresh_token` ở `storage.local` và tự làm mới.
3. `externally_connectable` (Chrome/Edge) hoặc `postMessage` qua content script (Firefox) khi trang web "kết nối tiện ích".
Kèm: sửa `getCurrentUser` để nhận `Authorization: Bearer <access_token>` (kiểm bằng `supabase.auth.getUser(token)`), có test.
Tiêu chí qua: tiện ích gọi được một API cần đăng nhập (ví dụ `POST /api/ext/cards`) với tài khoản Google, và làm mới token sau khi hết hạn.

## Spike 3: khung 3 trình duyệt
Build `wxt build` cho chrome, edge, firefox; nạp thủ công vào cả 3; xác nhận content script + background + popup chạy. Ghi lại mọi chỗ cần mã riêng cho Firefox.

## File liên quan
Tạo: `extension/` (WXT), `app/api/ext/captions/route.ts` (thử nghiệm). Sửa: `lib/auth/current-user.ts` (Bearer).

## Todo
- [ ] Spike 1 (8 video + 20 video server)
- [ ] Spike 2 (3 cách)
- [ ] Spike 3 (3 trình duyệt)
- [ ] Ghi kết quả + quyết định đi tiếp/dừng vào file này

## Rủi ro
YouTube thay đổi trong lúc thử (kết quả lệch); bắt `timedtext` vi phạm điều khoản YouTube? Tiện ích chỉ đọc dữ liệu player đang dùng cho chính người xem, không tải media, nhưng cần đọc lại điều khoản khi chuẩn bị phát hành (giai đoạn 4).
