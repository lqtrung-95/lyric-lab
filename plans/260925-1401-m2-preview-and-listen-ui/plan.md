---
title: M2 — Giao diện Xem trước (S4) + Nghe (S5) và luồng dán link (S1, S3, S6)
status: user đã duyệt 2026-09-25 — đang làm (phase 1–3 xong)
created: 2026-09-25
refs: docs/PRD.md §5, §6.1–6.3 (IN-01,04,05; PV-01..09; LS-01..10), §7, §8; docs/design-brief.md §2–5; design/*.html; CLAUDE.md quy tắc 3–9
---

# M2 — Xem trước + Nghe

Mục tiêu (PRD §10): toàn bộ P0 của 6.1–6.3 đạt. Nền là pipeline M1 (`analyzeVideo`), đã trả `SongAnalysis` có lời, dịch, pinyin, mục học và vị trí.

## Thiết kế đã có
Stitch project "Custom Design Project" (`13937936699626462675`, theme "Warm Literary Paper", Be Vietnam Pro + Noto Serif, đỏ son `#b23a26`, xanh cổ vịt `#2f6767`). Đã tải HTML vào `design/`: S1, S4, S5 (desktop + mobile). Còn trong Stitch chưa tải: S2, S7, Cài đặt. **Chưa có thiết kế: S3 (đang phân tích), S6 (tra từ), S8, S9** → tự thiết kế theo brief và cùng hệ token, user duyệt khi xem.

## Khác biệt thiết kế ↔ dữ liệu/PRD (đề xuất xử lý, cần user xác nhận)
| Thiết kế có | Dữ liệu/PRD | Đề xuất |
|---|---|---|
| "Mẹo nhớ chữ & gốc từ (bộ thủ)" trên thẻ từ | Không có trong `PreviewItem` | Bỏ ở M2 (không cho LLM bịa mẹo nhớ); để v1.1 |
| Chuỗi ngày học "5 ngày" trên thanh nav | Streak là v1.1 | Ẩn |
| "Đã thuộc" | PRD: "Đã biết" | Dùng "Đã biết" |
| Ảnh bìa minh họa | Video thật | Dùng thumbnail YouTube |
| Nút "HSK 3 ▾" ở nav | Level người dùng | Giữ; lưu localStorage (chưa có tài khoản) |
| "Đã ẩn N mục dưới level HSK3" | PV-04 | Giữ |

## Kiến trúc
- Routes: `app/page.tsx` (S1), `app/learn/[videoId]/page.tsx` (S4, gồm S3 khi chưa có cache), `app/learn/[videoId]/listen/page.tsx` (S5). Trang bài học `noindex` (đã có).
- API: `GET /api/analyze/[videoId]` (SSE: bước `lyrics` → `analysis` → `done`/`error`) gọi `analyzeVideo` với client service-role + cache Supabase. Lời chỉ trả qua route này, không đọc trực tiếp bằng anon.
- Server Component đọc cache trước; chưa có → hiện S3 (client) mở SSE, xong `router.refresh()`.
- State người dùng chưa có tài khoản (M3): level, "Đã biết", "Lưu", bật/tắt pinyin/dịch → `localStorage` sau một interface `UserStateStore` để M3 đổi sang Supabase.
- Player: YouTube IFrame API, vòng lặp đồng bộ 100 ms bằng `getCurrentTime()`; hàm thuần `findCurrentLineIndex(lines, t)` test kỹ.

## Phases
| # | Phase | Nội dung | Ước lượng |
|---|---|---|---|
| 1 ✅ | Nền UI | Token Tailwind v4 từ theme Stitch, font (next/font), dark mode, icon, layout + thanh nav (3 mục, mobile tab bar), thư mục `components/` | 1 ngày |
| 2 ✅ | S1 + S3 + API | Ô dán link (IN-01, lỗi ngay không gọi server), API SSE, màn tiến trình 3 bước + nút hủy (IN-04), lỗi không có lời (IN-05), bài đã học gần đây (localStorage) | 1,5 ngày |
| 3 ✅ | S4 Xem trước | Tóm tắt + tag (PV-01), thẻ từ vựng (PV-02) và ngữ pháp (PV-03), lọc level (PV-04), Đã biết + Hoàn tác (PV-05), Lưu (PV-06), Nghe thử ±0,5 giây (PV-07), Báo sai (PV-09, ghi `item_reports`), thẻ dùng chung với S5 | 2 ngày |
| 4 | S5 Nghe | Player + lời chạy theo nhạc, tự cuộn (LS-01,02), pinyin/dịch bật tắt nhớ lựa chọn (LS-03), tô sáng từ vựng/ngữ pháp bằng hai kiểu khác nhau, không chỉ màu (LS-04), panel "Đang hát" / bottom sheet (LS-05), bấm câu để nhảy (LS-07), lặp câu (LS-08), tốc độ (LS-09), phím tắt (LS-10) | 2,5 ngày |
| 5 | S6 Tra từ | Bấm từ bất kỳ → popover: mục có sẵn dùng ngay; từ khác tra từ điển + LLM giải nghĩa theo ngữ cảnh, cache `term_explanations` (LS-06, ≤ 1,5 s; cache ≤ 200 ms) | 1,5 ngày |
| 6 | Hoàn thiện | a11y WCAG 2.2 AA (nút thật, vùng bấm ≥ 44 px, tương phản, bàn phím), responsive 390/1440, `noindex`, Playwright E2E (dán link → xem trước → nghe, dùng fixture 夜车) | 1,5 ngày |

Phụ thuộc: 1 → 2 → 3 → 4 → 5 → 6. Migration mới: `term_explanations`, `item_reports` (user chạy trong SQL Editor như trước).

## Ràng buộc & rủi ro
- Quy tắc 6, 7: fixture/test/E2E chỉ dùng bài hư cấu 夜车; trang bài học `noindex`; lời luôn kèm video nhúng.
- Khóa Groq, service role, Data API chỉ ở server (quy tắc 4). Route công khai cần **giới hạn tần suất** (PRD: 10 bài mới/ngày ẩn danh) → M2 chỉ có giới hạn thô theo IP; giới hạn theo tài khoản ẩn danh ở M3. **Không đưa lên URL công khai trước khi có giới hạn.**
- Groq gói miễn phí ~1 bài mới/phút: nhiều người dùng cùng lúc sẽ xếp hàng; cần nâng gói trước khi ra mắt.
- Lệch mốc thời gian LRC so với video chưa đo (PRD LS-02 ≤ 300 ms): đo tay 10 bài trong phase 4, nếu lệch thì thêm chỉnh offset ±0,5 s cho người dùng.
- Khớp thiết kế: dùng đúng token/khoảng cách trong HTML Stitch; đối chiếu ảnh chụp từng màn ở 390 và 1440 px.

## Cần từ user
1. Duyệt kế hoạch.
2. Xác nhận bảng "khác biệt thiết kế ↔ dữ liệu" ở trên (bỏ mẹo nhớ chữ, ẩn streak…).
3. Icon: thiết kế dùng Material Symbols. Đề xuất dùng bộ này (tải subset để nhẹ) cho đúng hình; hay đổi sang lucide-react cho gọn?
4. Trạng thái "Đã biết/Lưu" tạm lưu localStorage đến M3: chấp nhận?
5. Có muốn tải nốt S2, S7, Cài đặt từ Stitch vào `design/` để dùng ở M3 không? (mình làm được, chỉ vài phút)

## Kết quả phase 1–2 (2026-09-25)
- User duyệt toàn bộ đề xuất: bỏ mẹo nhớ chữ, ẩn streak, "Đã biết", thumbnail YouTube, Material Symbols (subset qua `icon_names`), localStorage tạm, tải S2/S7/Cài đặt về `design/` **khi bắt đầu M3** (chưa tải).
- Phase 1: token Tailwind v4 từ Stitch (`app/globals.css`, sáng + tối tự suy ra theo Material 3), font Be Vietnam Pro / Noto Serif / Noto Serif SC qua Google Fonts (chữ Hán cắt unicode-range), icon subset, `SiteHeader`, `MobileTabBar`, `ThemeToggle` (nhớ lựa chọn, theo hệ thống mặc định), logo từ Stitch (`public/logo.svg`, `LogoMark`).
- Phase 2: S1 (`PasteLinkForm` báo lỗi ngay không gọi server, nút Dán clipboard; `RecentSongsSection` từ localStorage), API `GET /api/analyze/[videoId]` (SSE `meta` → `step` → `done` | `error`, giới hạn 10 bài mới/ngày/IP trong bộ nhớ, gộp yêu cầu trùng, log JSON mỗi lần phân tích), S3 (`AnalyzingScreen` 3 bước + Hủy, `AnalysisErrorView` theo mã lỗi), `next.config`: `serverExternalPackages: ["@node-rs/jieba"]` (binding native), thumbnail `i.ytimg.com`.
- Kiểm tra thật: video đã cache → `done` ngay; bài mới → `lyrics` → `analysis` → `done` (~15 s tổng, LLM ~5 s); bài không có lời → lỗi `no_lyrics`; videoId sai → 400. E2E: 5 test xanh.
- Bỏ: chip "bài mẫu" của S1 (không có video hư cấu để trỏ tới, quy tắc 7) và thẻ "đến hạn hôm nay" (M3).
- Node 20: supabase-js cần WebSocket → service client dùng `ws` làm transport; Node ≥ 22 không cần.

## Kết quả phase 3 (2026-09-25)
- S4 đầy đủ: `PreviewScreen` (client) + `PreviewHeader`, `LevelFilterBar`, `VocabCard`, `GrammarCard`, `QuoteBox`, `ReportMenu`, `LevelSelect`. Logic thuần có test: `buildPreviewView` (lọc theo level/chip/"Đã biết", đếm mục ẩn), `preview-format` (mốc giờ, nhãn cấp, dạng chữ Hán đúng như trong lời, đoạn nghe thử), `learner-state` (level, đã biết, đã lưu).
- Level: HSK 1–6 và "7–9" (nhóm gộp của HSK 3.0); mặc định HSK 3; mục ngoài HSK (16%) luôn hiện. Trạng thái học ở localStorage sau hook `useLearnerState` để M3 đổi sang Supabase.
- **Khác thiết kế có chủ đích:** thanh nghe thử (PV-07) là khung video nổi ≥ 200 px chứ không phải thanh chỉ có âm thanh, vì điều khoản YouTube yêu cầu player nhúng luôn nhìn thấy được. Player chỉ tạo sau lần bấm ▶ đầu tiên. Đoạn phát: đầu câu lùi 0,3 s tới hết câu (tối đa 8 s), tự dừng rồi ẩn.
- Tên bài: pipeline giờ mang `track { title, artist }` từ LRCLIB vào `SongAnalysis` (tiêu đề video YouTube lẫn nhãn MV); bài đã cache trước đó chưa có nên dùng tiêu đề YouTube. Chưa dịch tên bài sang tiếng Việt (cần đổi prompt).
- Báo sai (PV-09): `POST /api/reports` (Zod, 30 báo/ngày/IP) ghi bảng `item_reports`. **Migration mới chờ user chạy:** `supabase/migrations/20260925000003_item_reports.sql`. Chưa chạy migration thì bấm báo sai sẽ nhận lỗi "Chưa gửi được".
- `/dev/preview-fixture` (chỉ ngoài production) hiển thị bài hư cấu 夜车 để thử giao diện và chạy E2E: 8 test mới (lọc level, chip, đã biết + hoàn tác, lưu, nghe thử tự dừng với YouTube API giả, báo sai, CTA dính ở mobile). Tổng E2E: 13 xanh; unit: 190 xanh.
- Chưa làm ở S4: nút "Đã lưu bài"/"Chia sẻ" của thiết kế (thuộc thư viện M3), cột level ở nav ("HSK 3 ▾") mới có trong thanh lọc.
