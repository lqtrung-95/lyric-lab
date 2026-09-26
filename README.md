# Lyric Lab

Học tiếng Trung qua bài hát: dán link YouTube → xem trước từ vựng và ngữ pháp → nghe với lời chạy theo nhạc → ôn bằng flashcard.

- Yêu cầu sản phẩm: [`docs/PRD.md`](docs/PRD.md)
- Thiết kế: [`docs/design-brief.md`](docs/design-brief.md), file design trong [`design/`](design/)
- Hướng dẫn cho Claude Code: [`CLAUDE.md`](CLAUDE.md)

## Cấu trúc trang

- `/`: trang giới thiệu (marketing, được lập chỉ mục). Người đã có phiên tự chuyển sang `/app`; thêm `?landing` để xem lại.
- `/app`: trang chủ của app; cùng với `/library`, `/review`, `/settings`, `/learn/...` đều `noindex`.
- Ảnh chia sẻ mạng xã hội (`app/(marketing)/opengraph-image.png`) là ảnh chụp, dựng lại nếu đổi thông điệp. Đặt `NEXT_PUBLIC_SITE_URL` khi có tên miền riêng.

## Trạng thái

- M0 (spike nguồn lời), M1 (pipeline phân tích), M2 (giao diện Xem trước + Nghe + tra từ): **xong**. M3 (flashcard FSRS, tài khoản ẩn danh + Google, thư viện, tổng kết bài, hạn mức theo tài khoản): **code xong**; còn chờ thử tay đăng nhập Google, bật captcha Turnstile trước khi công khai.
- Kế hoạch và kết quả từng mốc: [`plans/`](plans/) (M0: `260924-1827-…`, M1: `260925-1030-…`, M2: `260925-1401-…`, M3: `260925-1540-…`); báo cáo M0: `plans/reports/`.

## Chạy thử

Cần Node ≥ 20.9 (khuyến nghị 22). Tạo `.env.local` từ `.env.example` và điền khóa (Supabase, Groq, YouTube Data API); không commit file này.

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
