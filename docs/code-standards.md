# Quy ước code và chuẩn kỹ thuật

Bổ sung cho [`CLAUDE.md`](../CLAUDE.md) (quy tắc bắt buộc) và `~/.claude/rules/development-rules.md` nếu dùng Claude Code.

## Quy tắc sản phẩm bất khả xâm phạm

1. **LLM không bao giờ viết hay đoán lời bài hát.** Lời chỉ từ caption YouTube, LRCLIB, NetEase. LLM chỉ phân tích lời đã có.
2. **Pinyin, cấp HSK, âm Hán Việt lấy từ từ điển**, không lấy từ LLM.
3. Mỗi mục LLM trả về (`PreviewItem`) phải khớp được vị trí trong lời thật; không khớp → loại.
4. **API key chỉ ở server.** Không đặt khoá AI/YouTube Data vào biến `NEXT_PUBLIC_*`. Chỉ dùng `getServerEnv()` ở code `server-only`.
5. Không tải/lưu audio hay video YouTube. Nghe lại bằng player nhúng tại timestamp.
6. Trang bài học và app `noindex`; không tạo trang công khai chứa lời bài hát.
7. Dữ liệu mẫu/seed/test fixture chỉ dùng bài hư cấu (xem `design-brief.md` §6). Không đưa lời bài hát thật vào repo.
8. Cache key phân tích = `videoId + learnLang + explainLang + promptVersion`. Lọc theo level và "Đã biết" làm ở client.
9. Accessibility WCAG 2.2 AA: phần tử bấm được là `<button>`/`<a>` thật, vùng bấm ≥ 44px, tô sáng không chỉ dựa vào màu.

## Ngôn ngữ và đặt tên

- Văn bản người dùng, comment, commit message, docs: **tiếng Việt**. Tên biến/hàm/file: tiếng Anh.
- File: **kebab-case** mô tả rõ mục đích, kể cả dài (`build-line-pinyin.ts`, `assess-lyric-quality.ts`) để grep ra là hiểu.
- Test đặt cạnh code: `foo.ts` → `foo.test.ts`. Tên test mô tả kịch bản bằng tiếng Việt ("ghi đè cách đọc thông dụng cho 听 → tīng…").
- Mục tiêu file < 200 dòng; tách theo trách nhiệm khi vượt. Không viết lại file thành bản "enhanced" — sửa trực tiếp file hiện có.
- Hàm thuần, phụ thuộc truyền vào qua tham số (`deps`) để test không cần mock mạng/DB (xem `AnalyzeVideoDeps`, `ExplainDeps`).

## Comment

- Giải thích **vì sao** (bất biến, race, đánh đổi, số liệu đo thực tế), không mô tả lại code làm gì.
- Không tham chiếu tài liệu kế hoạch (số phase, mã finding, mục §…) trong code và tên file migration; lý do phải tự đứng được. ID bên ngoài ổn định (RFC, SQLSTATE, CVE) thì được.
- Tên file migration: `YYYYMMDDNNNNNN_slug_mo_ta.sql`.

## TypeScript / React / Next

- TypeScript `strict`. Output LLM và input API đều validate bằng **Zod** (`llm-output-schema.ts`, `explain-schema.ts`, `*-schema.ts`).
- Next.js 16 có thay đổi so với kiến thức cũ: đọc `node_modules/next/dist/docs/` trước khi dùng API Next lạ (xem cảnh báo cuối `CLAUDE.md`).
- Code chạy ở server bắt đầu bằng `import "server-only"`. Hệ quả: script `tsx` không import được các module này — script tự dựng phụ thuộc (mẫu: `scripts/reanalyze-songs.mts`).
- Dùng `after()` cho việc phụ sau khi đã trả kết quả (vd. prewarm TTS). Không chặn response.
- Route nặng: `runtime = "nodejs"`, `maxDuration = 60`, trả luồng SSE qua `lib/http/sse.ts`; client phải chịu được đóng kết nối giữa chừng (bọc `controller.enqueue` bằng try/catch).
- Xử lý lỗi: try/catch ở biên (route, gọi mạng), ánh xạ sang mã lỗi ổn định (`AnalysisErrorCode`, `ExplainErrorCode`) thay vì ném message thô ra client.
- Tailwind v4; dark mode bằng class `dark` trên `<html>`; logo đổi bằng `dark:hidden` / `hidden dark:block`.
- Điều hướng trạng thái giao diện có ý nghĩa (tab thư viện) phải nằm trên URL (`?tab=`) để nút Back hoạt động.

## Làm việc với LLM

- Mọi đổi nội dung prompt có ảnh hưởng chất lượng: cân nhắc bump `PROMPT_VERSION` (vô hiệu hoá cache toàn bộ) và cập nhật test phiên bản.
- Thêm nhà cung cấp mới: viết client bọc `createCompatChat` (`groq-chat.ts`), thêm tiền tố vào `createChatRouter`, thêm khoá optional vào `server-env.ts`, đặt model vào `DEFAULT_MODELS` hoặc `EXPLAIN_MODELS`. Thiếu khoá thì rớt qua model kế, không lỗi.
- Giữ timeout từng lần gọi ngắn (15–25s) và `FAST_FAIL_LIMITS` ở production vì tổng ngân sách 60s.
- Xưng hô bản dịch: một cặp duy nhất cho cả bài, theo bảng trong `build-analysis-prompt.ts`; sửa gốc ở prompt, sửa từng bài bằng script.
- Pinyin chữ nhiều âm chọn nhầm: thêm vào `COMMON_READING` + test trong `lookup-words.test.ts` + `backfill-pinyin.mts --apply`.

## Test

- **Vitest** cho logic: tokenizer, bộ lọc level, validate vị trí, FSRS, chọn bản LRCLIB, parser, rate-limit… Không dùng dữ liệu giả để "qua build"; test phải kiểm tra hành vi thật.
- **Playwright** cho luồng dán link → xem trước → nghe, game, thư viện, accessibility (axe). Dùng trang fixture `/dev/*` và YouTube IFrame API giả; thiếu khoá Supabase thì bỏ qua.
- Trước khi push: `npm run lint`, `npx tsc --noEmit`, `npm run test`. Không tắt test thất bại để qua CI.

## Git

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`), mô tả thay đổi, không nhắc mã finding hay nhãn audit.
- Commit nhỏ, tập trung. **Không commit bí mật** (`.env*`, khoá API); kiểm tra `git diff --cached` trước khi commit.
- Khi dùng git worktree: stash dùng chung giữa các worktree — tránh `git stash` trần; dùng commit WIP.

## Nhắc về dữ liệu

- Local và production chung một DB Supabase: ghi từ máy local là ghi vào dữ liệu thật. Phần lớn script ghi DB mặc định dry-run (trừ `reanalyze-reuse-old-lyrics.mts`) — đọc đầu file script trước khi chạy.
- Sửa dữ liệu phân tích trực tiếp trong DB phải kèm bump `revN` của `unstable_cache`.
