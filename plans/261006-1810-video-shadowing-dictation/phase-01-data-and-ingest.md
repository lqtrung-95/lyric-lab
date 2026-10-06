# Giai đoạn 1: Dữ liệu và script crawl

## Context
- [plan.md](plan.md). Tái dùng `lib/captions` (provider InnerTube), `lib/analysis/fill-translations.ts`, `lib/analysis/tokenize-lyric-lines.ts`, `lib/analysis/build-line-pinyin.ts`, từ điển ở `lib/dictionary`. Mẫu script ghi DB: `scripts/*.mts` (đọc `docs/operations-runbook.md`).

## Tổng quan
Ưu tiên cao, làm đầu tiên. Chưa làm. Bảng cho video luyện nghe và script admin chạy ở máy cục bộ để đưa video vào DB.

## Dữ liệu (migration mới, chạy tay)
- `video_sources`: `id`, `kind` (channel|playlist), `youtube_ref`, `title`, `human_zh_captions boolean` (cờ admin xác nhận), `license_note text`, `created_at`.
- `video_lessons`: `video_id` (khóa), `source_id`, `title`, `channel_title`, `duration_sec`, `level_avg` (từ từ điển, không LLM), `status` (`draft`|`listed`|`hidden`), `translation_source` (`youtube`|`ai`), `created_at`.
- `video_lesson_lines`: `video_id`, `idx`, `start`, `end`, `text`, `pinyin`, `translation_vi`, `tokens jsonb` (từ đã chia + pinyin từng chữ + Hán-Việt để hiện và bấm được). Có thể gộp thành một dòng jsonb mỗi video nếu truy vấn chỉ đọc cả bài.
- RLS bật, **không có policy cho client**; chỉ API server (service role) đọc, giống `discover_songs`. Không có cột `user_id` nên không phải sửa `merge_user_data`.

## Script `scripts/ingest-video-source.mts`
1. Nhận nguồn (kênh/playlist/danh sách video id) và cờ `--dry-run`.
2. Liệt kê video; bỏ video đã có trong `video_lessons`; nghỉ giữa các video.
3. Mỗi video: lấy danh sách track; **bắt buộc có track `manual` tiếng Trung**, không thì bỏ qua và ghi lý do. Lấy track tiếng Việt `manual` nếu có.
4. Làm sạch dòng (tái dùng `clean-caption-lines`), chia từ, pinyin, Hán-Việt, level; ghép dòng tiếng Việt theo mốc thời gian; chỉ khi thiếu track tiếng Việt mới dịch AI (theo lô). Nguồn đầu (@ChineseGlow) đã có sẵn tiếng Việt.
5. Ghi với `status = 'draft'`; admin duyệt ở giai đoạn 5 mới chuyển `listed`.

## Các bước
1. Migration và kiểu TypeScript. 2. Hàm thuần dựng dòng từ track (có test). 3. Script và chạy thử 1 video thật. 4. Cập nhật `operations-runbook.md`.

## Todo
- [x] Migration (`20261006000003_video_lessons.sql`, chưa chạy)
- [x] Hàm dựng dòng + test (fixture hư cấu)
- [x] Script ingest (đã chạy dry-run trên @ChineseGlow: 13 video đủ điều kiện, dịch ghép 100%)
- [ ] Chạy migration và `--apply`

## Tiêu chí hoàn thành
Một video có phụ đề tiếng Trung do người làm được đưa vào DB ở trạng thái `draft` với đủ dòng, pinyin, tách từ và bản dịch; chạy lại không tạo trùng.

## Rủi ro
Track tiếng Trung `manual` có thể là Phồn thể: cần chuẩn hóa hay giữ nguyên (hỏi chủ dự án khi gặp). Dịch AI sai ở tiếng lóng hoạt hình.

## Bảo mật
Script dùng khóa service role từ môi trường, không in ra; không tải audio/video.
