# SongHanzi — hướng dẫn cho AI coding agent

Dành cho mọi agent (Codex, Cursor, Copilot, Claude Code…). `CLAUDE.md` là bản tương đương cho Claude Code; khi sửa quy tắc, **cập nhật cả hai file cho khớp**.

Web app giúp người Việt học tiếng Trung qua bài hát. Người dùng dán link YouTube, app lấy lời có timestamp, AI chọn từ vựng và ngữ pháp đáng học, người dùng **xem trước → nghe → luyện → ôn**.

## Đọc trước khi code

Thứ tự cho người/agent mới:

1. `docs/handoff-and-status.md`: tình trạng hiện tại, việc dở, quyết định đã chốt, các bẫy đã gặp.
2. `docs/system-architecture.md`: pipeline, chuỗi model LLM, cache, data model, hạn mức.
3. `docs/code-standards.md`: quy ước code và quy tắc bắt buộc.
4. `docs/operations-runbook.md`: biến môi trường, deploy, script backfill. **Đọc trước khi sửa pipeline phân tích hoặc chạy script ghi DB.**
5. `docs/PRD.md`: yêu cầu sản phẩm, ID yêu cầu (IN-, PV-, LS-, RV-, AC-), acceptance criteria.
6. `docs/design-brief.md` và `design/` (export Google Stitch): UI phải khớp design. Design và PRD mâu thuẫn thì hỏi lại trước khi code.
7. `docs/backlog.md`: việc đã chủ động hoãn, kèm lý do.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4
- Supabase: Postgres, Auth (ẩn danh + Google), Row Level Security
- YouTube IFrame Player API, đồng bộ lời bằng `getCurrentTime()`
- LLM qua server: DeepSeek gọi thẳng làm chính, Groq/OpenRouter dự phòng, BytePlus cho giải nghĩa khi bấm. Output JSON validate bằng Zod
- Tách từ: `@node-rs/jieba`. Từ điển: CC-CEDICT, HSK, bảng âm Hán Việt
- Stream kết quả phân tích bằng SSE (`/api/analyze/[videoId]`). Job nền (Inngest/Trigger.dev) chưa dùng, xem backlog
- Test: Vitest (logic), Playwright (E2E, cổng 3100)
- Deploy: Vercel Hobby (trần 60s/request) + Supabase Cloud

Cấu trúc thư mục thực tế: xem `docs/system-architecture.md`.

## Quy tắc bắt buộc

1. **Không bao giờ để LLM tự viết hoặc đoán lời bài hát.** Lời chỉ lấy từ caption YouTube → LRCLIB → NetEase. LLM chỉ phân tích lời đã có.
2. **Pinyin, level HSK, âm Hán Việt lấy từ từ điển**, không lấy từ LLM.
3. Mỗi `PreviewItem` phải khớp được vị trí trong lời thật. Mục không khớp thì loại bỏ.
4. **API key chỉ ở server.** Không dùng `NEXT_PUBLIC_*` cho key AI hoặc YouTube Data API.
5. **Không tải hay lưu audio/video YouTube.** Nghe lại đoạn bằng player nhúng tại timestamp.
6. Không tạo trang công khai có thể index chứa lời bài hát. Trang bài học đặt `noindex`.
7. Dữ liệu mẫu, seed, test fixture chỉ dùng bài hát hư cấu trong `docs/design-brief.md` mục 6. Không đưa lời bài hát thật vào repo.
8. Cache key phân tích = `videoId + ngôn ngữ học + ngôn ngữ giải thích + promptVersion`. Lọc theo level và "Đã biết" làm ở client.
9. Accessibility WCAG 2.2 AA: phần tử bấm được là `<button>`/`<a>` thật, vùng bấm ≥ 44 px, tô sáng không chỉ dựa vào màu.

## An toàn dữ liệu và bí mật

- **Local và production dùng chung một DB Supabase.** Script ghi DB là ghi vào dữ liệu thật; hầu hết mặc định dry-run (thêm `--apply`), riêng `scripts/reanalyze-reuse-old-lyrics.mts` ghi ngay.
- Không đọc, in, ghi đè hay commit `.env*` và khoá API. `.env.example` chỉ chứa tên biến/giá trị mẫu. Không chạy `vercel ls` / `vercel env pull` trong repo (có thể ghi đè `.env.local`). Kiểm tra `git diff --cached` trước khi commit.
- Đổi nội dung prompt có ảnh hưởng chất lượng → bump `PROMPT_VERSION`. Sửa dữ liệu phân tích trực tiếp trong DB → tăng hậu tố `revN` của `unstable_cache` trong `lib/analysis/server-deps.ts`.

## Cách làm việc

- Làm theo milestone trong `docs/PRD.md` mục 10. Mỗi milestone: lập kế hoạch trước, chờ duyệt, rồi mới code.
- Commit nhỏ, Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`…), không nhắc mã finding/nhãn audit trong commit hay comment code.
- Viết test cho logic mới (tokenizer, bộ lọc level, validate vị trí, FSRS…). E2E cho luồng dán link → xem trước → nghe. Không bỏ test thất bại để qua build.
- Khi thêm yêu cầu mới, ghi ID tương ứng trong PRD vào PR/commit.
- Comment giải thích **vì sao**, viết tiếng Việt; tên file kebab-case mô tả rõ mục đích; giữ file < 200 dòng.
- **Sau mỗi lần cập nhật (tính năng, sửa lỗi, đổi prompt/model/cấu hình, thêm biến môi trường, script, quyết định kỹ thuật), phải rà và cập nhật 4 tài liệu bàn giao nếu cần**, trong cùng commit/PR với thay đổi:
  - `docs/handoff-and-status.md`: tình trạng, việc dở, quyết định đã chốt, bẫy mới gặp.
  - `docs/system-architecture.md`: pipeline, chuỗi model, cache, data model, hạn mức.
  - `docs/operations-runbook.md`: biến môi trường, deploy, script, quy trình bump `PROMPT_VERSION`/`revN`.
  - `docs/code-standards.md`: quy ước và quy tắc code mới.
  Không cần sửa thì thôi, nhưng phải chủ động kiểm tra trước khi kết thúc việc. Không ghi khoá API hay giá trị bí mật vào docs.

## Lệnh

```
npm run dev        # dev server (bỏ qua hạn mức phân tích bài/ngày khi chạy local)
npm run build
npm run lint
npx tsc --noEmit
npm run test       # Vitest
npm run test:e2e   # Playwright, cổng 3100
```

## Repo cũ (chỉ để tham khảo)

`../AI-Lyric-Universe` là bản thử nghiệm trước (Vite + React, gọi AI từ client). **Không làm theo kiến trúc của nó.** Chỉ tham khảo khi được yêu cầu. Không copy prompt sinh lời bài hát trong `services/groqService.ts`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
