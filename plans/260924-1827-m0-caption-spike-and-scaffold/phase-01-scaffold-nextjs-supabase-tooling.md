# Phase 01 — Scaffold Next.js + Supabase + test tooling

## Context
- CLAUDE.md: Stack, Cấu trúc thư mục, Lệnh
- PRD §8 (kiến trúc), §7 (bảo mật: key chỉ ở server)
- `.env.example`, `.gitignore` đã có sẵn

## Overview
Ưu tiên: P0 cho M0. Dựng khung tối thiểu để phase 2 viết code vào `lib/`. Không dựng UI theo design (M2), không tạo bảng DB (M1).

## Key insights
- Repo chỉ có docs → scaffold vào thư mục hiện tại; `create-next-app` từ chối thư mục có file lạ → tạo ở thư mục tạm rồi copy vào, giữ nguyên `CLAUDE.md`, `docs/`, `design/`, `.env.example`, `.gitignore` (merge).
- Dùng layout không `src/` vì CLAUDE.md đặt `app/`, `lib/`, `components/` ở gốc.
- Supabase: dùng `@supabase/ssr` (client browser + server + middleware refresh session). Anonymous auth bật ở M3, chưa cần giờ.
- Kiểm tra version Next/Tailwind/Supabase mới nhất bằng docs-seeker trước khi chạy lệnh (Next 15 vs 16, Tailwind v4 config kiểu CSS-first).

## Requirements
- TS `strict: true`, alias `@/*`.
- Tailwind cài sẵn, chưa đặt token (chờ `design/tokens.md`).
- Vitest (logic, môi trường node) + Playwright (1 smoke test trang chủ).
- Trang chủ placeholder + `robots` mặc định `noindex` cho route `learn/*` (quy tắc 6) — đặt sẵn metadata ở layout `learn`.
- Script npm khớp CLAUDE.md: `dev`, `build`, `lint`, `test`, `test:e2e`.

## Architecture / cấu trúc tạo ra
```
app/
  layout.tsx, page.tsx            # placeholder
  learn/[videoId]/layout.tsx      # metadata robots: noindex
lib/
  supabase/browser-client.ts
  supabase/server-client.ts
  supabase/middleware-session.ts
  env/server-env.ts               # đọc + validate env server bằng Zod, import 'server-only'
middleware.ts
supabase/config.toml              # supabase init
tests/e2e/home-smoke.spec.ts
vitest.config.ts, playwright.config.ts
```

## Related files
- Create: như trên + `package.json`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`
- Modify: `.gitignore` (thêm `spike-output/`, `.supabase/`), `README.md` (lệnh chạy), `CLAUDE.md` mục Lệnh (bỏ dòng "Cập nhật sau khi scaffold")
- Delete: không

## Implementation steps
1. docs-seeker: xác nhận version + flag `create-next-app`, Tailwind, `@supabase/ssr`.
2. `npx create-next-app@latest` (TS, ESLint, Tailwind, App Router, no src, alias `@/*`, npm) vào thư mục tạm → copy vào repo.
3. Cài `@supabase/supabase-js @supabase/ssr zod server-only`; dev: `vitest @vitest/coverage-v8 @playwright/test`.
4. `npx supabase init` (không `start` — chưa cần DB local ở M0).
5. Viết `lib/env/server-env.ts` (Zod parse, fail sớm khi thiếu key lúc dùng, không lúc build).
6. Viết 3 file supabase client + `middleware.ts`.
7. Cấu hình Vitest, Playwright (webServer = `npm run dev`), 1 smoke test.
8. Chạy `npm run build && npm run lint && npm run test && npm run test:e2e`.
9. Commit: `chore: scaffold next.js app with supabase, vitest, playwright`.

## Todo
- [ ] Xác nhận version qua docs
- [ ] create-next-app + merge vào repo
- [ ] Supabase deps + init + clients + middleware
- [ ] server-env với Zod
- [ ] Vitest + Playwright + smoke test
- [ ] noindex cho `learn/*`
- [ ] Cập nhật README + CLAUDE.md mục Lệnh
- [ ] Build/lint/test xanh, commit

## Success criteria
- 5 lệnh npm chạy xanh trên máy local.
- `grep -r NEXT_PUBLIC_ app lib` chỉ ra URL + anon key Supabase.

## Risks
- `create-next-app` ghi đè `.gitignore`/`README.md` → copy có chọn lọc, diff trước khi commit.
- Next 16 đổi `middleware.ts` → `proxy.ts` (nếu áp dụng) → theo docs lúc làm.

## Security
- `server-only` cho mọi file đọc key server. Không commit `.env*`.

## Next steps
Phase 02 dùng `lib/env/server-env.ts` và cấu trúc `lib/`.
