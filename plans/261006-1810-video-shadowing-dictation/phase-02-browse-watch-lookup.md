# Giai đoạn 2: Duyệt, xem video, bấm từ lưu thẻ

## Context
- [plan.md](plan.md), [phase-01](phase-01-data-and-ingest.md). Giao diện tham khảo: màn Nghe (`components/listen`), thẻ bài (`components/library/song-card.tsx`), Khám phá (`/api/discover`).

## Tổng quan
Chưa làm. Trang danh sách video đã duyệt và trang xem video có bản chép chạy theo video, bấm từ để tra và lưu thẻ.

## Yêu cầu
- `/video`: lưới video `listed` (lọc theo level, kênh), thumbnail tải thẳng từ YouTube (`unoptimized`), `noindex`.
- `/video/[videoId]`: player nhúng luôn hiện, bản chép cuộn theo thời gian, bật/tắt pinyin và bản dịch (cùng tùy chọn với màn Nghe), bấm một từ mở thẻ tra: dùng `/api/lookup` ngay, nghĩa theo ngữ cảnh gọi `/api/explain` khi người dùng bấm (có hạn mức ngày như hiện tại), nút lưu vào bộ thẻ.
- API `GET /api/videos` và `GET /api/videos/[videoId]` (server, service role, cache edge như `/api/discover`).
- Thẻ đã lưu ôn được như thẻ bài hát (có `videoId`, `lineIndex`, `start` để nghe lại đúng đoạn); kiểm tra màn Ôn tập phát được đoạn của video không phải bài hát.

## Các file
Tạo: `app/(main)/video/page.tsx`, `app/(main)/video/[videoId]/page.tsx`, `app/api/videos/**`, `components/video/*`, `lib/video/*`. Sửa: điều hướng (`nav-links.ts`, tùy câu hỏi mở số 1), tài liệu kiến trúc.

## Todo
- [x] API đọc danh sách và chi tiết
- [x] Trang danh sách (chưa có lọc theo level/kênh: ít video nên hoãn)
- [x] Trang xem và bấm từ (giải nghĩa qua `/api/explain` mở rộng cho video, cache riêng)
- [ ] Ôn thẻ từ video: màn Ôn tập vẫn phát được đoạn (chỉ cần videoId + mốc giờ); chưa kiểm tra tay với video thật
- [x] E2E (API giả lập, dữ liệu hư cấu) và kiểm tra trợ năng

## Tiêu chí hoàn thành
Từ video `listed`, người dùng xem, bấm từ, thấy nghĩa, lưu thẻ và ôn được ở màn Ôn tập.

## Rủi ro
Màn Nghe và màn video trùng nhiều logic cuộn/đồng bộ: tách phần dùng chung thay vì sao chép.
