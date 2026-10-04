# Kiến trúc hệ thống

Tóm tắt kiến trúc **hiện hành**. Yêu cầu và lý do sản phẩm ở [`PRD.md`](PRD.md) §8; file này ghi những gì code đang làm thật.

## Tổng quan

```
Trình duyệt (Next.js App Router, React 19, Tailwind v4)
   │  SSE /api/analyze/[videoId]      REST /api/explain, /api/explain-line, /api/lookup, /api/tts, ...
   ▼
Next.js route handlers (Vercel, nodejs runtime, vùng sin1, maxDuration 60s)
   ├── Supabase Postgres (service role ở server; RLS cho dữ liệu người dùng)
   ├── Lời: YouTube InnerTube caption → LRCLIB → NetEase
   ├── LLM: DeepSeek / Groq / OpenRouter / BytePlus
   └── Azure Speech (TTS, tùy chọn)
YouTube IFrame Player: phát nhạc + đồng bộ lời bằng getCurrentTime() (không lưu audio/video)
```

Stack: Next.js 16 (Turbopack), TypeScript strict, Tailwind v4, Supabase (Auth ẩn danh + Google), `@node-rs/jieba` tách từ, `opencc-js` phồn→giản, `ts-fsrs` ôn tập, Sentry, Vercel Analytics. Test: Vitest (unit), Playwright (E2E, cổng 3100).

## Bản đồ thư mục

| Đường dẫn | Vai trò |
|---|---|
| `app/(marketing)` | Trang giới thiệu `/` (được index) |
| `app/(main)` | `/app`, `/library`, `/review/*` (game luyện tập, bảng xếp hạng), `/settings`, `/feedback`, `/admin/*`, `/welcome` (đều `noindex`) |
| `app/learn/[videoId]` | Xem trước, `listen` (nghe), `summary` (tổng kết) |
| `app/api/*` | Route handlers: `analyze` (SSE), `explain`, `explain-line`, `lookup`, `tts`, `discover`, `search`, `library`, `review`, `practice/score`, `leaderboard`, `streak`, `feedback`, `reports`, `translation-suggestions`, `account/*`, `admin/*`, `debug/caption-probe` |
| `components/` | UI dùng lại (lyric list, vocab card, player controls, library, brand…) |
| `lib/captions` | `CaptionProvider` (interface) + implement InnerTube, parse json3, đánh giá chất lượng lời |
| `lib/lyrics` | Lấy lời nhiều nguồn: `get-lyrics-for-video.ts`, LRCLIB, NetEase, parse LRC, chuẩn hoá |
| `lib/analysis` | Pipeline phân tích, prompt, client LLM, validate, cache |
| `lib/dictionary` | Tra CC-CEDICT, HSK, Hán Việt; `COMMON_READING` |
| `lib/lookup` | Giải nghĩa từ/câu theo ngữ cảnh khi bấm (`explain-term.ts`) |
| `lib/srs`, `lib/review`, `lib/practice` | FSRS, ôn tập, chấm điểm mini-game |
| `lib/rate-limit` | Hạn mức theo tài khoản (DB) + theo IP (bộ nhớ) |
| `lib/supabase`, `lib/auth`, `lib/account` | Client Supabase, phiên ẩn danh, gộp tài khoản |
| `supabase/migrations` | Schema SQL (chạy tay theo thứ tự tên file) |
| `scripts/` | Nạp từ điển, backfill/phân tích lại, eval, spike caption |

## Pipeline phân tích bài hát (`/api/analyze/[videoId]`)

1. `fetchVideoMeta` (YouTube Data API) và `readCachedAnalysis` chạy song song. Video không nhúng được → `video_not_embeddable`.
2. Có cache → trả `done {fromCache:true}`. Không → cần đăng nhập (ẩn danh cũng được), áp hạn mức (xem dưới), rồi chạy `analyzeVideo` (khử trùng lặp bằng map `inFlight` theo videoId).
3. `analyzeVideo` (`lib/analysis/analyze-video.ts`): lấy lời → `normalizeLyricLines` → `tokenizeLyricLines` (jieba) → tra từ điển → `buildVocabCandidates` → tra Hán Việt → `analyzeLyrics` → `saveAnalysis`.
4. Sự kiện SSE: `meta` → `step` (`lyrics`|`analysis`) → `done` | `error {code}`.
5. Sau khi trả kết quả: `after()` tổng hợp sẵn TTS cho các từ vựng của bài.

### Nguồn lời (không bao giờ do LLM sinh)

Thứ tự trong `getLyricsForVideo`: **caption YouTube** (phải phủ ≥ 50% thời lượng và qua `assessLyricQuality`) → **LRCLIB** (`pickLrclibVersion` khớp theo thời lượng) → **NetEase** → `NoLyricsError`. Nguồn được ghi ở `song_analyses.lyrics_source` (`youtube_caption` | `lrclib` | `netease`).

### Chuỗi model phân tích (`DEFAULT_MODELS`, `lib/analysis/analyze-lyrics.ts`)

1. `deepseek:deepseek-chat` (API trực tiếp, timeout 25s)
2. Groq `openai/gpt-oss-120b`, `openai/gpt-oss-20b` (khóa `GROQ_API_KEY`, timeout 15s)
3. Hai model Groq trên bằng khóa thứ hai (`groq-fallback:`, `FALLBACK_LLM_API_KEY`)
4. `openrouter:google/gemini-2.5-flash`

Router (`lib/analysis/openrouter-chat.ts`, `createChatRouter`) chọn client theo tiền tố `deepseek:`, `byteplus:`, `openrouter:`, `groq-fallback:`; không tiền tố = Groq. Model thiếu khóa thì bị bỏ qua. Kết quả LLM bị **validate bằng Zod** + kiểm tra từng mục phải khớp vị trí trong lời thật (mục không khớp bị loại); kết quả quá nghèo (< 6 vocab) coi như thất bại và thử model kế. Production dùng `FAST_FAIL_LIMITS` (retry 1, chờ 429 tối đa 8s) để rớt model nhanh trong trần 60s.

Prompt: `lib/analysis/build-analysis-prompt.ts`, hằng `PROMPT_VERSION`. LLM chỉ chọn + giải thích; pinyin/HSK/Hán Việt do code ghép từ từ điển (`assemble-song-analysis.ts`, `build-line-pinyin.ts`).

### Giải nghĩa khi bấm (từ/câu)

`lib/lookup/explain-term.ts` (+ `explain-line`), danh sách `EXPLAIN_MODELS`: Groq 20b/120b (khóa 1 rồi khóa 2) → `byteplus:doubao` (ModelArk, model thật lấy từ `BYTE_PLUS_MODEL_ID`) → OpenRouter gemini flash-lite/flash. Kết quả cache trong `term_explanations`, `line_explanations`. Mục tiêu độ trễ ≤ 1,5s nên đứng đầu là model nhỏ.

## Cache

- **Cache DB**: khóa `(video_id, learn_lang, explain_lang, prompt_version)` trong `song_analyses`. Bump `PROMPT_VERSION` = vô hiệu hoá toàn bộ (bài sẽ phân tích lại khi có người mở).
- **Cache Next** (`unstable_cache`, revalidate 3600s) bọc đọc `song_analyses` và `songs`. Khoá có hậu tố `revN` để bỏ cache tức thì sau khi sửa DB trực tiếp (hiện `rev9`).
- Đọc bài còn qua `simplifyDeep` (chuẩn hoá giản thể) và `repairLinePinyin` (tự sửa pinyin cũ không cần gọi LLM).

## Data model (bảng chính, xem `supabase/migrations`)

| Nhóm | Bảng |
|---|---|
| Từ điển | `dict_words`, `dict_hanzi_sino_viet` |
| Bài + phân tích | `songs`, `song_analyses`, `term_explanations`, `line_explanations` |
| Người dùng | `user_profiles`, `user_cards`, `review_logs`, `user_known_terms`, `user_song_progress`, `user_song_likes`, `practice_scores`, `leaderboard_profiles`, `streak_shares`, `account_merge_tokens` |
| Chống lạm dụng | `usage_events` (hạn mức 24h/1h theo tài khoản) |
| Phản hồi | `feedback`, `item_reports`, `song_reports`, `translation_suggestions` |

## Đăng nhập Google và gộp tài khoản

Người dùng mới là phiên **ẩn danh** (Supabase Anonymous). Bấm "Đăng nhập bằng Google" (`signInGoogle` trong `lib/auth/account-client.ts`) luôn đi một đường: xin mã gộp một lần (`/api/account/merge-token`), cất vào `localStorage`, qua Google đúng một lần, rồi về `/settings/merge`. Trang này gọi `/api/account/merge`: `autoMerge = true` (tài khoản Google còn trống hoặc phía ẩn danh không có dữ liệu học) thì gộp luôn; ngược lại hỏi xác nhận kèm số thẻ/từ/lượt ôn sẽ gộp. Hàm SQL `merge_user_data` chuyển hồ sơ, từ đã biết, thẻ ôn, nhật ký ôn, lượt dùng, tiến độ nghe, bài đã thích, điểm luyện tập, hồ sơ bảng xếp hạng, báo sai bài; xong thì xoá tài khoản ẩn danh. **Thêm bảng mới có `user_id` → phải thêm vào `merge_user_data` bằng migration mới**, nếu không dữ liệu bị xoá cascade khi người dùng đăng nhập.

## Lịch sử bài hát (đồng bộ giữa thiết bị)

"Bài hát gần đây" (trang chủ, hook `components/home/use-recent-songs.ts`) và tab "Bài hát của tôi" gộp hai nguồn bằng `mergeLibrarySongs`: **tiến độ nghe trên tài khoản** (`user_song_progress` qua `/api/library/songs`, đồng bộ mọi thiết bị) và **bài mới mở xem trước lưu trong `localStorage`** của trình duyệt (`lyric-lab-recent-songs`, chỉ ở máy đó). Bài chỉ mở xem trước mà chưa nghe thì chưa có hàng trong DB nên không sang thiết bị khác.

## Độ lệch lời (mặc định của bài + chỉnh cá nhân)

Hai lớp, cộng dồn: (1) **mặc định của bài** `songs.lyric_offset_sec`, do admin đặt và áp cho mọi người; server cộng nó vào mốc `start`/`end` của các dòng ngay khi đọc phân tích (`loadAnalysis` trong `lib/analysis/server-deps.ts`, bằng `shiftLines`), nên mọi màn hình nhận lời đã chỉnh mà không phải sửa từng nơi, và bản chỉnh không mất khi phân tích lại bài. (2) **Chỉnh cá nhân** (`localStorage` + `user_song_progress.lyric_offset_sec`, hook `useLyricOffset`) là phần cộng thêm lên trên mặc định; "Đặt lại" nghĩa là về mặc định của bài. Admin bấm "Lưu làm mặc định cho mọi người" ở bảng chỉnh lời (`SyncPanel`) → `PATCH /api/admin/songs/[videoId]` `{action:"shift_lyrics", deltaSec}` cộng delta vào mặc định, xoá cache phân tích (`revalidateTag("song-analysis")`), rồi client tải lại dữ liệu và đưa độ lệch cá nhân của admin về 0 (tránh cộng đôi). Người khác đã tự chỉnh bài đó trước đó sẽ lệch thêm đúng bằng giá trị admin lưu (chấp nhận được khi ít người dùng).

## Hạn mức và bảo vệ

Cấu hình: `lib/rate-limit/usage-limit-config.ts`. Trong 24h theo tài khoản (ẩn danh / đã đăng nhập): phân tích 10/30, giải nghĩa 60/200, TTS 80/250; điểm game 40/giờ. Thêm lớp theo IP (30 phân tích/24h, bộ nhớ trong tiến trình). Bài đã cache không tốn hạn mức. Chạy `next dev` (`NODE_ENV=development`) bỏ qua hạn mức phân tích. Email trong `UNLIMITED_USAGE_EMAILS` không bị giới hạn; `ADMIN_EMAILS` vào được trang admin. Captcha Turnstile (tùy chọn) ở `lib/auth/turnstile-token.ts`.

## Ràng buộc kiến trúc quan trọng

- Vercel Hobby cắt cứng **60s** cho mỗi request; lấy lời + chuỗi LLM dùng chung ngân sách này (lý do các timeout ngắn).
- Khoá API chỉ ở server; không dùng `NEXT_PUBLIC_*` cho khoá AI/YouTube Data.
- Không lưu audio/video YouTube; nghe lại bằng player nhúng tại timestamp.
- Trang bài học `noindex`; không có trang công khai chứa lời bài hát.
- InnerTube là endpoint không chính thức, có thể bị YouTube đổi/chặn — luôn giữ sau interface `CaptionProvider`.
