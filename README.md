# Lyric Lab

Học tiếng Trung qua bài hát: dán link YouTube → xem trước từ vựng và ngữ pháp → nghe với lời chạy theo nhạc → ôn bằng flashcard.

- Yêu cầu sản phẩm: [`docs/PRD.md`](docs/PRD.md)
- Thiết kế: [`docs/design-brief.md`](docs/design-brief.md), file design trong [`design/`](design/)
- Hướng dẫn cho Claude Code: [`CLAUDE.md`](CLAUDE.md)

## Trạng thái

M0 đang làm: scaffold xong (Next.js 16, Supabase, Vitest, Playwright). Tiếp theo: lấy caption YouTube cho 50 bài C-pop. Kế hoạch: [`plans/260924-1827-m0-caption-spike-and-scaffold/`](plans/260924-1827-m0-caption-spike-and-scaffold/plan.md).

## Chạy thử

```
cp .env.example .env.local   # điền key, không commit
npm install
npm run dev
npm run build && npm run lint
npm run test                 # Vitest
npm run test:e2e             # Playwright (cổng 3100)
```

Cần Node ≥ 20.9 (khuyến nghị 22, vì `@supabase/supabase-js` sắp bỏ Node 20).
