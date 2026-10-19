# Giai đoạn 2: Bản đầu không AI (cỡ L)

## Mục tiêu
Lớp phủ phụ đề trên YouTube với pinyin, Hán Việt, nghĩa Việt; bấm từ để tra và lưu thẻ; đăng nhập Google; popup cài đặt. Không gọi AI.

## Kiến trúc
- `extension/entrypoints/background.ts`: giữ phiên, gọi API (có Bearer), cache kết quả.
- `extension/entrypoints/youtube.content.ts`: phát hiện video, lấy phụ đề theo thứ tự (kho ta → player → server), vẽ lớp phủ bằng Shadow DOM (không đụng CSS của YouTube), đồng bộ theo `video.currentTime`.
- `extension/entrypoints/popup/`: đăng nhập/đăng xuất, bật/tắt từng lớp (pinyin, Hán Việt, nghĩa), cỡ chữ, vị trí.
- `lib/ext/*` (server): `annotate-lines` (gộp tách từ + pinyin + Hán Việt + HSK cho một lô dòng, dùng `convertHanText`), hợp đồng kiểu dùng chung với tiện ích.
- API mới (mọi route có CORS cho origin tiện ích, giới hạn theo IP và theo tài khoản):
  - `GET /api/ext/captions?v=` → dòng đã chú giải cho video (kho ta hoặc InnerTube), kèm nguồn.
  - `POST /api/ext/annotate {lines[]}` → chú giải cho phụ đề bắt từ player (tối đa N dòng/lô).
  - `GET /api/lookup?term=` (đã có) cho tra từ.
  - `POST /api/ext/cards` → lưu thẻ vào `user_cards` (cùng định dạng thẻ hiện có, `item_key` `vocab:<từ>`, kèm `video_id`, `line_index` hoặc mốc giờ).
- Chia sẻ dữ liệu: thẻ lưu từ tiện ích xuất hiện ngay ở Ôn tập trên web (cùng bảng).

## Tính năng
1. Lớp phủ: dòng hiện tại (Hán + pinyin ruby + Hán Việt + nghĩa Việt), dòng trước/sau mờ; có thể kéo, ẩn; tự ẩn khi phụ đề gốc đủ.
2. Bấm từ: thẻ tra (pinyin, Hán Việt, HSK, nghĩa), nút Lưu, nút phát âm (giọng `/api/tts` đã có), tạm dừng video khi mở.
3. Danh sách dòng: bấm dòng để tua; theo dõi dòng đang phát.
4. Video đã có trong SongHanzi: nút "Mở bài học đầy đủ" (luyện chép, luyện nói).
5. Trạng thái: không có phụ đề Trung → gợi ý "Thêm vào SongHanzi để AI nghe" (dẫn sang web, tính hạn mức `transcribe` hiện có).
6. Đạt WCAG: nút thật, vùng bấm ≥ 44 px trên lớp phủ, tương phản; nhãn tiếng Việt.

## File liên quan
Tạo: `extension/**`, `app/api/ext/**`, `lib/ext/**`, `tests/e2e/extension-*.spec.ts` (nạp tiện ích vào Chromium bằng Playwright, trang YouTube giả bằng route). Sửa: `lib/auth/current-user.ts`, `docs/*` (4 tài liệu bàn giao).

## Các bước
1. Hợp đồng kiểu + `annotate-lines` + test (Vitest).
2. API `/api/ext/*` + CORS + Bearer + test tích hợp.
3. Background: phiên, cache, hàng đợi lô chú giải.
4. Content script + lớp phủ (Shadow DOM) + đồng bộ thời gian.
5. Popup + lưu cài đặt (`storage.sync`).
6. Tra từ + lưu thẻ + phát âm.
7. E2E bằng Playwright (Chromium có tiện ích) + kiểm thử tay trên Firefox/Edge.
8. Cập nhật docs; tự xét lại bằng `code-reviewer`.

## Thành công khi
Mở một video có phụ đề Trung (kho ta hoặc bắt được) thì trong < 3 giây có lớp phủ; bấm từ ra thẻ tra; lưu thẻ thấy ở trang Ôn tập; chạy trên Chrome và Edge (Firefox theo kết quả spike 3); không có lỗi console do tiện ích; không gọi AI.

## Rủi ro và bảo mật
- Dữ liệu người dùng: chỉ gửi mã video và các dòng phụ đề, không gửi lịch sử duyệt. Token chỉ ở `storage.local`.
- CORS: chỉ cho origin tiện ích (`chrome-extension://<id>`, `moz-extension://`), không `*`.
- Tải server: `annotate` theo lô, cache theo `videoId`+ngôn ngữ; giới hạn kích thước lô.
- Không lưu/phát lại lời bài hát công khai: cùng nguyên tắc `noindex` và bản quyền như web (tiện ích chỉ hiển thị cho người đang xem video đó).
