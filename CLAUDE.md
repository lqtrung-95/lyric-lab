# Lyric Lab

Web app giúp người Việt học tiếng Trung qua bài hát. Người dùng dán link YouTube, app lấy lời có timestamp, AI chọn từ vựng và ngữ pháp đáng học, người dùng **xem trước → nghe → luyện → ôn**.

## Đọc trước khi code

- `docs/PRD.md`: yêu cầu sản phẩm, ID yêu cầu (IN-, PV-, LS-, RV-, AC-), acceptance criteria, kiến trúc, data model, roadmap.
- `docs/design-brief.md`: màn hình S1–S10, component, trạng thái, dữ liệu mẫu.
- `design/`: file export từ Google Stitch (HTML + ảnh). **UI phải khớp design ở đây.** Nếu design và PRD mâu thuẫn, hỏi lại trước khi code.

## Stack

- Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS
- Supabase: Postgres, Auth (anonymous + Google OAuth), Row Level Security
- YouTube IFrame Player API cho player, đồng bộ lời bằng `getCurrentTime()`
- LLM qua server (Groq trước, có model dự phòng). Output JSON validate bằng Zod
- Tách từ tiếng Trung: jieba / nodejieba. Từ điển: CC-CEDICT, danh sách HSK, bảng âm Hán Việt
- Job nhiều bước: Inngest hoặc Trigger.dev. Stream kết quả về client bằng SSE
- Test: Vitest cho logic, Playwright cho E2E
- Deploy: Vercel + Supabase Cloud

## Cấu trúc thư mục (mục tiêu)

```
app/                 # routes Next.js
  (main)/            # trang chủ, ôn tập, thư viện
  learn/[videoId]/   # xem trước + nghe
  api/               # route handlers, SSE
components/          # UI dùng lại: VocabCard, GrammarCard, LyricLine, PlayerControls…
lib/
  captions/          # CaptionProvider (interface) + YouTube implementation
  analysis/          # pipeline: clean → tokenize → dictionary → LLM → validate
  dictionary/        # tra CC-CEDICT, HSK, Hán Việt
  srs/               # FSRS
  supabase/          # client, types
supabase/migrations/ # SQL schema
design/              # export từ Stitch
docs/                # PRD, design brief
```

## Quy tắc bắt buộc

1. **Không bao giờ để LLM tự viết hoặc đoán lời bài hát.** Lời chỉ lấy từ nguồn có sẵn: caption YouTube trước, kho lời đồng bộ (LRCLIB) khi không có caption (hoặc STT về sau). LLM chỉ phân tích lời đã có.
2. **Pinyin, level HSK, âm Hán Việt lấy từ từ điển**, không lấy từ LLM.
3. Mỗi `PreviewItem` phải khớp được vị trí trong lời thật. Mục không khớp thì loại bỏ.
4. **API key chỉ ở server.** Không dùng biến `NEXT_PUBLIC_*` cho key AI hoặc YouTube Data API.
5. **Không tải hay lưu audio/video YouTube trên server.** Nghe lại đoạn bằng player nhúng tại timestamp.
6. Không tạo trang công khai có thể index chứa lời bài hát. Trang bài học đặt `noindex`.
7. Dữ liệu mẫu, seed, test fixture chỉ dùng bài hát hư cấu trong `docs/design-brief.md` mục 6. Không đưa lời bài hát có thật vào repo.
8. Cache key phân tích = `videoId + ngôn ngữ học + ngôn ngữ giải thích + promptVersion`. Lọc theo level và "Đã biết" làm ở client.
9. Accessibility WCAG 2.2 AA: phần tử bấm được là `<button>`/`<a>` thật, vùng bấm ≥ 44 px, tô sáng không chỉ dựa vào màu.

## Cách làm việc

- Làm theo milestone trong `docs/PRD.md` mục 10 (M0 → M3). Mỗi milestone: lập kế hoạch trước, chờ duyệt, rồi mới code.
- Commit nhỏ, message dạng Conventional Commits (`feat:`, `fix:`, `chore:`…).
- Viết test cho tokenizer, bộ lọc level, validate vị trí, FSRS. E2E cho luồng dán link → xem trước → nghe.
- Khi thêm yêu cầu mới, ghi ID tương ứng trong PRD vào PR/commit.

## Lệnh

Đã scaffold (Next.js 16). E2E chạy ở cổng 3100 để không đụng dev server khác:

```
npm run dev        # dev server
npm run build
npm run lint
npm run test       # Vitest
npm run test:e2e   # Playwright
```

## Repo cũ (chỉ để tham khảo)

`../AI-Lyric-Universe` là phiên bản thử nghiệm trước (Vite + React, gọi AI từ client). **Không làm theo kiến trúc của nó.** Chỉ tham khảo khi được yêu cầu:

- `supabase/schema.sql`: ý tưởng bảng cache toàn cục và RLS
- `services/youtubeService.ts`: tìm và nhúng video
- `services/backendService.ts`: luồng user ẩn danh + cache
- `utils/fuzzySearch.ts`

Không copy prompt sinh lời bài hát trong `services/groqService.ts`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
