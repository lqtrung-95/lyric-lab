# SongHanzi

Học tiếng Trung qua bài hát: dán link YouTube → xem trước từ vựng và ngữ pháp → nghe với lời chạy theo nhạc → ôn bằng flashcard.

- **Mới tiếp quản? Đọc trước**: [`docs/handoff-and-status.md`](docs/handoff-and-status.md) (tình trạng, quyết định, bẫy đã gặp)
- Kiến trúc hiện hành: [`docs/system-architecture.md`](docs/system-architecture.md)
- Vận hành (biến môi trường, deploy, backfill): [`docs/operations-runbook.md`](docs/operations-runbook.md)
- Quy ước code: [`docs/code-standards.md`](docs/code-standards.md)
- Yêu cầu sản phẩm: [`docs/PRD.md`](docs/PRD.md); việc đã hoãn: [`docs/backlog.md`](docs/backlog.md)
- Thiết kế: [`docs/design-brief.md`](docs/design-brief.md), file design trong [`design/`](design/)
- Hướng dẫn cho Claude Code: [`CLAUDE.md`](CLAUDE.md)

## Cấu trúc trang

- `/`: trang giới thiệu (marketing, được lập chỉ mục). Người đã có phiên tự chuyển sang `/app`; thêm `?landing` để xem lại.
- `/app`: trang chủ của app; cùng với `/library`, `/review`, `/settings`, `/learn/...` đều `noindex`.
- Ảnh chia sẻ mạng xã hội (`app/(marketing)/opengraph-image.png`) là ảnh chụp, dựng lại nếu đổi thông điệp. Đặt `NEXT_PUBLIC_SITE_URL` khi có tên miền riêng.

## Trạng thái

- M0–M3 đã xong và đã deploy (Vercel + Supabase), thêm nhiều tính năng sau M3 (khám phá, bảng xếp hạng, mini-game, streak…). Còn chờ thử tay đăng nhập Google và bật captcha Turnstile trước khi công khai rộng. Chi tiết: [`docs/handoff-and-status.md`](docs/handoff-and-status.md).
- Kế hoạch và kết quả từng mốc: [`plans/`](plans/) (M0: `260924-1827-…`, M1: `260925-1030-…`, M2: `260925-1401-…`, M3: `260925-1540-…`); báo cáo M0: `plans/reports/`.

## Chạy thử

Cần Node ≥ 20.9 (khuyến nghị 22). Tạo `.env.local` từ `.env.example` và điền khóa (Supabase, Groq, DeepSeek, YouTube Data API… xem bảng ở `docs/operations-runbook.md`); không commit file này.

```
npm install
npm run dev                  # http://localhost:3000
npm run build && npm run lint
npm run test                 # Vitest (unit)
npm run test:e2e             # Playwright, cổng 3100
```

### Cơ sở dữ liệu (Supabase)

Chạy lần lượt các file trong `supabase/migrations/` bằng Supabase SQL Editor (dictionary → cache phân tích → báo sai → giải nghĩa từ → dữ liệu người dùng → mã gộp tài khoản). Cần bật Anonymous sign-ins và Manual linking trong Supabase; test tích hợp chạy với `NODE_OPTIONS=--experimental-websocket` trên Node 20. Sau đó nạp từ điển:

```
# tải CC-CEDICT, HSK 3.0, Unihan vào data-cache/ (xem plans/260925-1030-m1-analysis-pipeline/plan.md), rồi:
npx tsx --env-file=.env.local scripts/dictionary/import-dictionary.mts
```

Node 20 cần thêm `NODE_OPTIONS=--experimental-websocket` khi chạy các script dùng `@supabase/supabase-js` ngoài Next.

### Thử giao diện không cần AI

`/dev/preview-fixture` và `/dev/listen-fixture` (chỉ ngoài production) hiển thị bài hư cấu 夜车. Test E2E dùng các trang này, YouTube IFrame API giả, và một bài hư cấu được seed vào Supabase để kiểm tra luồng dán link → xem trước → nghe (bỏ qua nếu thiếu khóa Supabase).

### Ghi công dữ liệu

Từ điển dùng CC-CEDICT (CC BY-SA 4.0, MDBG), danh sách HSK 3.0 từ `drkameleon/complete-hsk-vocabulary` (MIT), âm Hán Việt từ Wiktionary (CC BY-SA 4.0) và Unihan (Unicode License). Lời bài hát lấy từ caption YouTube hoặc LRCLIB.
