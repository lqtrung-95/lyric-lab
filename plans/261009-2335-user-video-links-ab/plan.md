# Người dùng dán link video tiếng Trung (podcast/vlog) để chép chính tả + shadowing

Trạng thái: ĐÃ CHỐT QUYẾT ĐỊNH (người dùng): dùng chung cho mọi người, làm A rồi B, bỏ C (ASR).

## Hiện có (tái dùng)
- Màn xem/chép chính tả/shadowing: `/video/[videoId]`, `.../dictation`, `.../shadowing`; danh sách `/video` (chỉ `listed`).
- Lõi nạp `lib/video/ingest-video.ts`, `prepareLessonLines`, `toLessonLines`, `parse-srt.ts`; bảng `video_lessons`.
- `CaptionProvider` (InnerTube bị YouTube chặn từ IP cloud).

## A. Phụ đề lấy trên máy người dùng ($0)
1. Trang "Thêm video" (`/video/add`): dán link + dán phụ đề (SRT/VTT/văn bản có mốc thời gian).
2. Bookmarklet (máy tính) chạy trên youtube.com, đọc track CC tiếng Trung, mở `/video/add` kèm phụ đề qua `postMessage`.
3. `POST /api/videos/add`: kiểm tra link, giới hạn, ghi bài (lõi nạp dùng chung).
## B. Supadata
- `SupadataCaptionProvider` bật bằng `SUPADATA_API_KEY`; không có key thì ẩn đường này.
- Ngân sách tháng chung (dừng mềm khi cạn) + giới hạn mỗi người.

## Chung
- Bài người dùng thêm vào kho chung (`listed` ngay, ghi `added_by`); admin ẩn/xóa được (đã có).
- Giới hạn: 3 video/người/ngày; chỉ video nhúng được; ≤ 60 phút; không đọc audio/video.
- Bản dịch Việt bằng LLM theo lô, client gọi tuần tự từng lô (mỗi lô 1 request, trong 60 giây Hobby).
- Cập nhật PRD + 4 docs.

## Việc của người dùng
- B: đăng ký Supadata, đặt `SUPADATA_API_KEY` (Vercel). Chạy migration mới.

## Rủi ro
- Tự duyệt ngay có thể hiện nội dung không phù hợp: giảm bằng giới hạn/người, admin ẩn sau.
- Bản quyền phụ đề: chỉ lưu văn bản phụ đề, không audio/video, trang `noindex`.
