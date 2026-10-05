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

Hai lớp, cộng dồn: (1) **mặc định của bài** `songs.lyric_offset_sec`, do admin đặt và áp cho mọi người; server cộng nó vào mốc `start`/`end` của các dòng mỗi lần đọc phân tích (`readCachedAnalysis` trong `lib/analysis/server-deps.ts`, bằng `shiftLines`; độ lệch được đọc riêng, KHÔNG nằm trong cache 1 giờ của phân tích, nên bản admin vừa lưu có hiệu lực ngay), nên mọi màn hình nhận lời đã chỉnh mà không phải sửa từng nơi, và bản chỉnh không mất khi phân tích lại bài. (2) **Chỉnh cá nhân** (`localStorage` + `user_song_progress.lyric_offset_sec`, hook `useLyricOffset`) là phần cộng thêm lên trên mặc định; "Đặt lại" nghĩa là về mặc định của bài. Mỗi bản chỉnh cục bộ lưu kèm `base` = mức mặc định lúc chỉnh (`{o, base}`, dạng cũ chỉ một số được hiểu là `base` 0). Server gửi kèm mức mặc định hiện tại (`analysis.lyricOffsetSec`, `ReviewContext.lyricOffsetSec`); trình duyệt ghi nhớ (`noteDefaultOffset`, khoá `lyric-lab-default-offsets`) và `resolveOffset` bỏ bản chỉnh có `base` khác mức hiện tại, nên khi admin đổi mức mặc định thì bản chỉnh cũ của mọi người tự mất hiệu lực, không cộng đôi.

Admin bấm "Lưu làm mặc định cho mọi người" ở bảng chỉnh lời (`SyncPanel`) → `PATCH /api/admin/songs/[videoId]` `{action:"shift_lyrics", deltaSec}`: cộng delta vào mặc định, đưa `user_song_progress.lyric_offset_sec` của mọi người cho bài đó về 0 (cho thiết bị chưa có bản cục bộ), rồi client tải lại dữ liệu bài. Ý nghĩa: bản admin lưu là bản chuẩn, ghi đè mọi chỉnh cá nhân trước đó của bài.

## Cỡ khung video (màn Nghe)

Người dùng chọn Lớn/Vừa/Nhỏ cho khung video (`playerSize` trong `lyric-lab-listen-prefs`, chọn ở trang Cài đặt, mục "Màn Nghe", `components/settings/listen-section.tsx`; có tác dụng từ breakpoint `md`). "Nhỏ" = 356px rộng (200px cao ở 16:9), là mức nhỏ nhất ta cho phép; điện thoại đã ở mức này nên không đổi. **Không có chế độ ẩn hẳn video**: theo điều khoản YouTube IFrame API (theo ghi nhớ, cần tra lại bản hiện hành trước khi đổi), player nhúng phải còn nhìn thấy, không nhỏ hơn khoảng 200×200 và không được tách riêng âm thanh.

## Phòng thi đấu 1v1 (đang xây, kế hoạch ở `plans/261005-1700-realtime-practice-rooms/`)

Giai đoạn 1 (vòng đời phòng) đã có: bảng `rooms`, `room_players` (migration `20261005000001_practice_rooms.sql`), các hàm SQL nguyên tử `create_room`, `join_room`, `leave_room`, `leave_active_rooms`, `set_room_ready`, `start_room` (khóa dòng phòng để hai người vào chỗ cuối không lọt cả hai; chỉ service role gọi được), RLS cho thành viên đọc (hàm `is_room_member` chạy quyền chủ hàm để policy không lặp vô hạn), và API `app/api/rooms/*` (tạo `POST /api/rooms`, xem `GET /api/rooms/[code]`, `join`, `ready`, `leave`, `start`). Mã phòng 6 số (`lib/rooms/room-code.ts`), duy nhất trong các phòng còn hiệu lực; phòng chờ sống 10 phút, phòng đang chơi 2 giờ. Một người chỉ ở một phòng còn hiệu lực. Hạn mức dùng `usage_events`: `room` (tạo phòng, 10/30 mỗi 24 giờ) và `room_join` (số lần thử vào phòng, 30/60 mỗi giờ, chống đoán mã). Client không nhận id tài khoản của người khác, chỉ tên hiển thị. 

Giai đoạn 2 (câu hỏi và chấm điểm) đã có: `buildRoomQuestions` (`lib/rooms/build-room-questions.ts`, hàm thuần) dựng 10 câu Điền lời từ phân tích của bài (mỗi từ/dòng một lần; **bỏ dòng ghi công đầu bài** (作词, 混音母带, 企划, OP… nhận ra bằng `isCreditLine` trong `lib/rooms/credit-line.ts`: phần trước dấu hai chấm là vai trò đã biết; nhãn người hát như "汪：" vẫn là lời hát) và từ chỉ có ở các dòng đó cũng không làm đáp án nhiễu; từ xuất hiện hai lần trong dòng bị bỏ vì làm lộ đáp án; 3 đáp án nhiễu lấy từ các từ vựng khác của chính bài), kèm pinyin trước/sau ô trống, nghĩa dòng, mốc đoạn nghe và ghi chú ngữ pháp (chỉ khi không lộ đáp án). Đo trên 131 bài hiện có: 127 bài dựng được đủ 10 câu. `startRoom` (`lib/rooms/room-repo.ts`) chọn bài (chủ phòng chọn hoặc ngẫu nhiên trong bài Khám phá dựng được), lưu bộ câu rồi gọi `start_room`; câu công khai nằm ở `room_questions` (client đọc được khi `opens_at` đã có), **đáp án đúng ở `room_question_keys` và câu trả lời ở `room_answers` không có policy cho client** (không đường nào, kể cả Realtime sau này, để người này đọc đáp án hay lựa chọn của người kia). `POST /api/rooms/[code]/answer` gọi hàm SQL `submit_room_answer`: chấm, tính thời gian bằng giờ server (`now() − opens_at`), mỗi người một lần mỗi câu, cho trễ tối đa 1 giây sau hạn. Điểm: đúng 100 + thưởng tốc độ 0–30 (`room_answer_points` ở SQL, trùng `roomAnswerPoints` ở `room-scoring.ts`); người thắng là người tổng điểm cao hơn, bằng điểm thì hòa (`decideWinner`; trước đây xét số câu đúng trước, đổi theo ý chủ dự án ở migration `20261006000001_room_winner_by_points.sql`). 

Giai đoạn 3 (ván chơi thời gian thực) đã có, trong migration `20261005000004_room_game_state_machine.sql`: máy trạng thái nằm trong các hàm SQL có khóa dòng phòng (`start_room` lên lịch mở câu đầu sau 3 giây; `advance_room` tiến câu **idempotent**: chỉ chuyển khi câu hiện tại đã mở và mọi người còn trong phòng đã trả lời hoặc quá hạn + 1 giây ân hạn, gọi thừa trả `not_ready`; câu kế mở sau 3 giây, mỗi câu 15 giây; `finish_room` chọn người thắng theo tổng điểm (bằng điểm thì hòa); `leave_room` giữa ván xử người còn lại thắng; ai vắng 3 câu liền bị coi là đã rời, không cần heartbeat). Vercel không có timer nền nên **client tự gọi** `POST /api/rooms/[code]/advance` đúng lúc (`msUntilAdvance` trong `lib/rooms/room-clock.ts`), máy nào cũng gọi được. **Điểm/số câu đúng đọc được ở `room_players` chỉ cập nhật khi một câu đóng** (tính lại từ `room_answers`), còn lúc trả lời chỉ đánh dấu `answered_idx` và `last_answer_ms`: nếu cập nhật ngay thì Realtime cho đối thủ biết người kia vừa đúng hay sai trước khi họ tự chọn. Realtime (Postgres Changes trên `rooms` và `room_players`, chỉ thành viên nhận nhờ RLS) chỉ làm **tín hiệu để tải lại**; trạng thái đầy đủ lấy từ `GET /api/rooms/[code]` (`buildRoomView` trong `lib/rooms/build-room-view.ts` quyết định lộ gì: đáp án đúng chỉ lộ sau khi người xem đã trả lời hoặc câu đã đóng, lựa chọn của đối thủ không bao giờ lộ, sau ván chỉ có đúng/sai, điểm, thời gian). Hook `components/room/use-room.ts` gói việc tải, đăng ký Realtime, thăm dò 4 giây làm lưới an toàn và tự tiến câu. 

Giai đoạn 4 (giao diện) đã có. Route: `/room` (sảnh: Mời bạn → hộp tạo phòng chọn bài ngẫu nhiên hoặc tự chọn, Nhập mã/link, Ghép ngẫu nhiên ghi "Sắp có", quy tắc điểm) và `/room/[code]` (`components/room/room-screen.tsx` chọn màn theo trạng thái: chưa là thành viên → form vào phòng với tên hiển thị; `waiting` → `room-lobby.tsx`; `playing` → `room-play.tsx`; `finished` → `room-result.tsx`; hết hạn/lỗi → thông báo). Mục "Thi đấu" nằm trong menu chính (`nav-links.ts`). Người mở thẳng link mời chưa có phiên được tạo phiên ẩn danh rồi mới hiện form vào phòng. Màn chơi: bảng điểm (`room-scoreboard.tsx`), đồng hồ tính theo giờ server (`room-clock.ts`), khung video nghe đoạn **luôn hiển thị** ngay trong thẻ câu hỏi (`room-clip-player.tsx`, tối đa 2 lượt mỗi câu, bắt đầu từ lần bấm), bốn đáp án A–D (phím 1–4), đáp án chỉ tô đúng/sai sau khi trả lời hoặc câu đóng, kết quả câu vừa rồi hiện trong 3 giây đếm ngược sang câu kế. Gộp tài khoản (giai đoạn 5): migration `20261005000005_merge_user_data_rooms.sql` thêm `room_players`, `room_answers`, `rooms.host_id` và `rooms.winner_id` vào `merge_user_data`; nếu hai tài khoản từng đấu với nhau trong cùng một phòng thì giữ hàng và câu trả lời của tài khoản đích (khóa `(room_id, user_id)` không cho giữ cả hai). Hàm `tables_referencing_users()` cho test tích hợp liệt kê mọi bảng có khóa ngoại tới `auth.users`; test **đỏ khi có bảng mới chưa được phân loại** (gộp hoặc cố ý bỏ qua kèm lý do). Chống lạm dụng: hạn mức DB `room` (tạo phòng) và `room_join` (thử mã) cộng lớp chặn thô trong bộ nhớ 180 lượt/phút/tài khoản cho mọi API phòng (`lib/rooms/room-rate-limit.ts`, không chính xác tuyệt đối trên serverless); biệt danh qua `validateNickname` (chỉ kiểm ký tự, chưa lọc từ tục); không có chat tự do. Test e2e `tests/e2e/room-versus.spec.ts` chạy trọn một ván với hai trình duyệt thật (hai phiên ẩn danh) trên Supabase thật và tự dọn phòng/tài khoản tạm.

## Biệt danh dùng chung

Mỗi tài khoản có MỘT biệt danh (`leaderboard_profiles.nickname`, duy nhất không phân biệt hoa thường), dùng cho phòng thi đấu và bảng xếp hạng. **Ảnh đại diện** (`leaderboard_profiles.avatar_url`, bucket `avatars`, upload qua `POST /api/leaderboard/avatar`, chỉ khi đã có biệt danh) cũng dùng chung: chỉ đổi ở Cài đặt (`components/profile/avatar-uploader.tsx`), bảng xếp hạng và phòng thi đấu chỉ hiển thị (`AvatarCircle`); `getRoomView` gắn `avatarUrl` cho từng người chơi từ hồ sơ, không lưu bản chụp trong `room_players`. Đặt ở Cài đặt → "Biệt danh và ảnh đại diện" (`components/settings/nickname-section.tsx`) hoặc ngay lúc cần ở phòng thi đấu (`components/profile/nickname-gate.tsx`); hook `useNickname` và API `GET/POST /api/leaderboard/profile` (logic ở `lib/leaderboard/profile-repo.ts`, `saveProfile`). **Có biệt danh không có nghĩa là công khai điểm**: chỉ đặt tên thì hồ sơ ở trạng thái chưa tham gia bảng xếp hạng (`opted_in = false`); tham gia là lựa chọn riêng ở trang Bảng xếp hạng (dùng biệt danh sẵn có, không cần nhập lại), rời bảng vẫn giữ biệt danh. API phòng (`POST /api/rooms`, `.../join`) không nhận tên từ client mà lấy biệt danh của tài khoản ở server (chưa có thì 409 `nickname_required`); `room_players.display_name` là bản chụp lúc vào phòng.

## Hạn mức và bảo vệ

Cấu hình: `lib/rate-limit/usage-limit-config.ts`. Trong 24h theo tài khoản (ẩn danh / đã đăng nhập): phân tích 10/30, giải nghĩa 60/200, TTS 80/250; điểm game 40/giờ. Thêm lớp theo IP (30 phân tích/24h, bộ nhớ trong tiến trình). Bài đã cache không tốn hạn mức. Chạy `next dev` (`NODE_ENV=development`) bỏ qua hạn mức phân tích. Email trong `UNLIMITED_USAGE_EMAILS` không bị giới hạn; `ADMIN_EMAILS` vào được trang admin. Captcha Turnstile (tùy chọn) ở `lib/auth/turnstile-token.ts`.

## Ràng buộc kiến trúc quan trọng

- Vercel Hobby cắt cứng **60s** cho mỗi request; lấy lời + chuỗi LLM dùng chung ngân sách này (lý do các timeout ngắn).
- Khoá API chỉ ở server; không dùng `NEXT_PUBLIC_*` cho khoá AI/YouTube Data.
- Không lưu audio/video YouTube; nghe lại bằng player nhúng tại timestamp.
- Trang bài học `noindex`; không có trang công khai chứa lời bài hát.
- InnerTube là endpoint không chính thức, có thể bị YouTube đổi/chặn — luôn giữ sau interface `CaptionProvider`.
