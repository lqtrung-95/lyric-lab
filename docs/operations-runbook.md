# Vận hành (runbook)

Môi trường, deploy, và các thao tác bảo trì lặp đi lặp lại. **Không bao giờ dán giá trị khoá vào docs, commit hay chat.**

## 1. Biến môi trường

Đặt trong `.env.local` (local, đã gitignore) và trong Vercel → Project → Environment Variables (production). `.env.example` chỉ liệt kê tên + giá trị mẫu; **không dán khoá thật vào đó** (file được commit).

Schema kiểm tra ở `lib/env/server-env.ts` (chuỗi rỗng bị coi như chưa đặt).

| Biến | Bắt buộc | Dùng cho |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Client Supabase (công khai theo thiết kế) |
| `SUPABASE_SERVICE_ROLE_KEY` | Có | Ghi DB ở server, bỏ qua RLS. Tuyệt đối không lộ ra client |
| `GROQ_API_KEY` | Có | Model Groq (dự phòng phân tích; chính cho giải nghĩa khi bấm) |
| `YOUTUBE_DATA_API_KEY` | Có | Lấy tiêu đề/thời lượng/embeddable |
| `SUPADATA_API_KEY` | Không | Tự lấy phụ đề tiếng Trung cho video người dùng dán link mà không kèm phụ đề (Supadata, `mode=native`, 1 credit/lần gọi, thường 1 credit/video và 2 credit khi video có sẵn phụ đề tiếng Việt (lấy thêm để khỏi nhờ AI dịch); gói free 100 credit/tháng, hết credit trả 402 thì người dùng chuyển sang dán phụ đề). Bỏ trống thì chỉ nhận phụ đề dán vào/dấu trang |
| `DEEPSEEK_API_KEY` | Nên có | Model phân tích chính (gọi thẳng api.deepseek.com). Thiếu thì rớt sang Groq |
| `FALLBACK_LLM_API_KEY` | Nên có | Khóa Groq thứ hai (hạn mức đếm riêng) |
| `OPENROUTER_API_KEY` | Nên có | Lưới an toàn cuối (gemini flash) |
| `BYTE_PLUS_API_KEY` + `BYTE_PLUS_MODEL_ID` | Tùy chọn | ModelArk cho giải nghĩa khi bấm. Phải đặt cả hai; model id lấy từ console BytePlus (gắn với tài khoản) |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Tùy chọn | TTS thần kinh. Thiếu → `/api/tts` trả 503, nút loa dùng giọng hệ thống |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Tùy chọn | Captcha Turnstile (cần bật trước khi công khai rộng) |
| `NEXT_PUBLIC_SENTRY_DSN` | Tùy chọn | Sentry |
| `NEXT_PUBLIC_VIDEO_PUBLIC` | Tùy chọn | `1` = hiện mục "Video" trên menu cho mọi người. Không đặt: mục này chỉ hiện ở môi trường phát triển, ẩn cả với admin ở production (admin vẫn vào thẳng `/video` và `/admin/videos` bằng đường dẫn để thử). Đặt xong cần deploy lại (biến `NEXT_PUBLIC_*` được nhúng lúc build). |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Tùy chọn | Khóa thông báo đẩy cho nhắc học. Sinh bằng `npx tsx scripts/generate-vapid-keys.mts` (in ra màn hình, không ghi file). Thiếu thì mục "Nhắc học" tự ẩn. Biến `NEXT_PUBLIC_*` cần deploy lại. |
| `CRON_SECRET` | Tùy chọn | Chuỗi ngẫu nhiên ≥ 16 ký tự; Vercel Cron gửi kèm `Authorization: Bearer` khi gọi `/api/cron/reminders`. Thiếu thì route từ chối (401). |
| `RESEND_API_KEY`, `EMAIL_FROM` | Tùy chọn | Gửi email (chào mừng, tổng kết tuần, nhắc quay lại) qua Resend. `EMAIL_FROM` dạng `SongHanzi <no-reply@ten-mien.com>` và **tên miền phải được xác thực (SPF/DKIM) trong Resend**: không xác thực thì chỉ gửi được tới chính chủ tài khoản Resend. Thiếu một trong hai thì mọi tính năng email tự tắt. |
| `NEXT_PUBLIC_SITE_URL` | Khuyến nghị | `https://songhanzi.com` (URL gốc, không có `/` cuối): dùng cho og:image, sitemap, link chia sẻ và link trong email. Mặc định trong code cũng là giá trị này. Đổi xong cần deploy lại. |
| `ADMIN_EMAILS` | Tùy chọn | Danh sách email (phân tách dấu phẩy) vào được `/admin/*` |
| `UNLIMITED_USAGE_EMAILS` | Tùy chọn | Email không bị hạn mức |
| `CAPTION_PROBE_SECRET` (≥ 16 ký tự) | Tùy chọn | Bật route chẩn đoán `/api/debug/caption-probe`; client phải gửi đúng giá trị trong header. Chỉ để kiểm tra việc lấy caption trên Vercel; để trống = route tắt. Tạo bằng `openssl rand -hex 24` |
| `YTDLP_BIN`, `CAPTION_SPIKE_DELAY_MS`, `EVAL_PACE_MS` | Chỉ cho script | Spike caption / eval |

**Local và production có cần giống nhau?** Các khoá dịch vụ (Supabase, LLM, YouTube) nên **giống** vì cả hai dùng chung một DB Supabase và cùng nhà cung cấp. `CAPTION_PROBE_SECRET`, `ADMIN_EMAILS`, `UNLIMITED_USAGE_EMAILS` có thể khác nhau tuỳ nhu cầu.

**Cảnh báo bảo mật**
- Không chạy `vercel ls`, `vercel env pull` trong repo trừ khi thật sự cần: có thể ghi đè `.env.local` (từng xảy ra, từng ghi ra giá trị rỗng). Sau khi sửa env luôn kiểm tra giá trị không rỗng.
- Trước mỗi commit: `git diff --cached` kiểm tra không có khoá; `.env*` (trừ `.env.example`) đã gitignore.
- Khoá lỡ lộ → thu hồi/đổi ở nhà cung cấp ngay, rồi cập nhật Vercel + `.env.local`.

## 2. Chạy local

Node ≥ 20.9 (khuyến nghị 22). Node 20 cần `NODE_OPTIONS=--experimental-websocket` cho script dùng `@supabase/supabase-js` ngoài Next.

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run test         # Vitest
npm run build
npm run test:e2e     # Playwright, cổng 3100
```

Ở `next dev`, hạn mức phân tích bài/ngày bị bỏ qua (giải nghĩa/TTS/điểm game vẫn giới hạn). Trang thử UI không cần AI: `/dev/preview-fixture`, `/dev/listen-fixture` (chỉ ngoài production).

## 3. Cơ sở dữ liệu

Tạo project Supabase, chạy lần lượt các file trong `supabase/migrations/` (theo tên) bằng SQL Editor. Bật **Anonymous sign-ins** và **Manual linking** trong Auth. Cấu hình Google OAuth cho đăng nhập Google. Nạp từ điển (tải CC-CEDICT, HSK 3.0, Unihan vào `data-cache/`, xem `plans/260925-1030-m1-analysis-pipeline/plan.md`):

```bash
npx tsx --env-file=.env.local scripts/dictionary/import-dictionary.mts
```

Migration gần nhất `20261004000001_merge_user_data_all_user_tables.sql` mở rộng hàm gộp tài khoản (bài thích, điểm luyện tập, hồ sơ bảng xếp hạng, báo sai bài). Phải chạy trên Supabase SQL Editor trước/cùng lúc deploy bản code dùng luồng đăng nhập một đường, nếu không người dùng đăng nhập Google sẽ mất các dữ liệu đó. Test tích hợp `tests/integration/account-merge.test.ts` kiểm tra điều này (chạy trên DB thật, tự dọn).

Migration `20261004000002_song_default_lyric_offset.sql` thêm cột `songs.lyric_offset_sec` (độ lệch lời mặc định do admin đặt). Chưa chạy thì code vẫn chạy (đọc lỗi → coi như 0) nhưng nút "Lưu làm mặc định cho mọi người" sẽ báo lỗi.

Migration `20261005000001_practice_rooms.sql` tạo bảng phòng thi đấu (`rooms`, `room_players`), các hàm SQL của vòng đời phòng, RLS và mở rộng `usage_events_kind_check` (thêm `room`, `room_join`). Cần chạy trước khi dùng API `/api/rooms/*`. Test tích hợp: `tests/integration/rooms.test.ts`. Chưa mở rộng `merge_user_data` cho `room_players`: việc đó ở giai đoạn 5 của kế hoạch phòng thi đấu, và phải làm trước khi mở tính năng cho người dùng (nếu không lịch sử phòng mất khi đăng nhập Google).

Migration `20261005000002_room_questions.sql` thêm `room_questions`, `room_question_keys`, `room_answers`, hàm `room_answer_points` và `submit_room_answer` (phải chạy sau migration phòng thi đấu thứ nhất). `start` phòng cần migration này (lưu bộ câu hỏi). Migration `20261005000003_room_answer_points_integer_math.sql` sửa `room_answer_points` sang phép tính số nguyên (làm tròn nửa lên) để khớp bản TypeScript ở mọi mốc; chạy sau migration thứ hai.

Migration `20261005000004_room_game_state_machine.sql` thêm cột trạng thái ván (`rooms.current_question`, `winner_id`…, `room_players.answered_idx`…), các hàm `advance_room`, `finish_room`, `recompute_room_scores`, thay `start_room`, `leave_room`, `submit_room_answer`, và thêm `rooms`, `room_players` vào publication `supabase_realtime` (Realtime của dự án phải đang bật). Chạy được một lần (có `alter table add column` và `alter publication add table`). Migration `20261006000002_room_show_translation.sql` thêm cột `rooms.show_translation` (tùy chọn hiện nghĩa dòng lời): **chạy trước khi deploy** vì code đọc cột này ở mọi truy vấn phòng. Migration `20261006000001_room_winner_by_points.sql` (`create or replace finish_room`, chạy lại được) đổi luật thắng sang tổng điểm cao hơn; chạy trước khi tin kết quả test tích hợp `rooms`. Gói Supabase Free giới hạn 200 kết nối Realtime đồng thời và 2 triệu tin nhắn/tháng; client chỉ mở kết nối khi đang ở trong phòng.

Migration `20261005000005_merge_user_data_rooms.sql` mở rộng `merge_user_data` cho dữ liệu phòng thi đấu và thêm hàm `tables_referencing_users()` (chỉ cho test). **Chạy trước khi mở tính năng thi đấu cho nhiều người**, nếu không người ẩn danh đăng nhập Google sẽ mất lịch sử phòng. Mỗi khi thêm bảng có `user_id` hoặc khóa ngoại tới `auth.users`: thêm vào `merge_user_data` bằng migration `create or replace` mới và cập nhật danh sách phân loại trong `tests/integration/rooms.test.ts`.

Vì local và production **dùng chung DB**, mọi script bên dưới ảnh hưởng dữ liệu thật.

## 4. Deploy (Vercel)

- Push lên `main` → Vercel build + deploy tự động. Vùng `sin1` (`vercel.json`). Gói Hobby: trần 60s/request.
- Đặt đủ biến môi trường ở mục 1 cho Production (và Preview nếu cần).
- Sau deploy kiểm tra: mở 1 bài đã cache (nhanh), phân tích 1 bài mới (xem log `analysis` có `model` và `attempts`), bấm giải nghĩa từ.
- Log JSON có sự kiện `analysis`, `analysis_error`, `tts_prewarm`: xem trong Vercel Logs để biết model nào đã trả lời và độ trễ từng lần thử.

## 5. Phân tích lại bài hát (backfill)

### Khi nào cần

- Đổi nội dung prompt → **bump `PROMPT_VERSION`** (`lib/analysis/build-analysis-prompt.ts`) và cập nhật test `analyze-lyrics.test.ts` (assert phiên bản). Mọi bài thành "chưa phân tích" → phân tích lười khi có người mở, hoặc chạy backfill.
- Chỉ sửa nhỏ không đáng bump (vd. thêm gợi ý) thì sửa prompt nhưng bài cũ giữ nguyên.

### Script (`reanalyze-songs` và `backfill-pinyin` mặc định **dry-run**, thêm `--apply` để ghi; `reanalyze-reuse-old-lyrics` **ghi DB ngay**, không có dry-run)

```bash
# Phân tích lại các bài chưa có bản ở PROMPT_VERSION hiện tại (idempotent, chạy lại được khi bị ngắt)
npx tsx --env-file=.env.local scripts/reanalyze-songs.mts            # xem trước
npx tsx --env-file=.env.local scripts/reanalyze-songs.mts --apply --limit=10

# Bài không lấy lại được lời (LRCLIB/caption đổi): dựng lại từ lời đã lưu rồi phân tích (GHI DB NGAY)
npx tsx --env-file=.env.local scripts/reanalyze-reuse-old-lyrics.mts <videoId> [<videoId>...]

# Sửa pinyin cache theo COMMON_READING
npx tsx --env-file=.env.local scripts/backfill-pinyin.mts --apply
```

Lưu ý: chạy dài (113 bài ~ giờ) nên chạy nền; tool nền có thể bị kill sau ~30 phút — chạy lại vì idempotent. Nghỉ 1,5s giữa các bài.

### Sau khi sửa DB trực tiếp

Tăng hậu tố `revN` trong `analysisCache` (`lib/analysis/server-deps.ts`) rồi deploy, nếu không UI giữ bản cũ tới 1 giờ.

### Sửa lời một bài sai

1. Xác định nguồn đúng (id LRCLIB hoặc caption). 2. Xoá/thay `song_analyses` hiện hành của bài. 3. Chạy lại phân tích (script hoặc mở bài). 4. Bump `revN`.

### Nạp video luyện nghe (kho Video, tách khỏi bài hát)
**Cách chính: nút nạp ở `/admin/videos`** (nhập tên kênh, "Tìm video", "Nạp N video"; chạy trên server nên không bị chặn IP máy bạn; video vào ở trạng thái Nháp). Script bên dưới là phương án dự phòng.
Migration `20261006000003_video_lessons.sql` (chạy tay, một lần) tạo `video_sources` và `video_lessons`. Script `scripts/ingest-video-source.mts` đưa video của một kênh vào kho ở trạng thái `draft`: chỉ nhận video **nhúng được** và có phụ đề tiếng Trung **do người làm** (bỏ phụ đề tự động); bản dịch lấy từ track tiếng Việt thủ công (không gọi LLM); chia từ bằng jieba, pinyin và level từ từ điển. Không tải audio/video và không in nội dung phụ đề.
```
NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/ingest-video-source.mts --handle ChineseGlow --owned          # xem thử (dry-run)
NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/ingest-video-source.mts --handle ChineseGlow --owned --apply  # ghi DB
```

**Nạp từ file SRT của công cụ podcast** (khi YouTube chặn tải phụ đề, cả IP nhà lẫn Vercel): `scripts/ingest-from-podcast-output.mts --dir <thư mục output của podcast_tool>` đọc `<tên>.zh.srt` + `<tên>.vi.srt` (cùng mốc thời gian với video đã đăng) và `<tên>_script.json` (chỉ lấy tiêu đề), ghép từng tập với video trên kênh (`lib/video/match-podcast-files.ts`: theo tiêu đề, không được thì theo thời lượng duy nhất), rồi nạp bằng đúng lõi `ingestVideo` với provider đọc file. Chỉ cần Data API, không đụng YouTube phụ đề. Mặc định dry-run in bảng ghép (kiểm tra mỗi cặp lệch ~6s là bình thường: đoạn kết video); `--apply` ghi `draft`; `--refresh` làm mới video đã có. Không đọc `.env`/`client_secret.json` trong thư mục đó.
```bash
NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/ingest-from-podcast-output.mts --dir "/đường/dẫn/podcast_tool/output" [--apply]
```
Tùy chọn: `--delay 60000` (nghỉ 60 giây giữa các video, nên dùng khi YouTube chặn 429: thường chỉ qua được vài video liền ở tốc độ mặc định), `--videos id1,id2` (chỉ định video thay cho cả kênh), `--limit N` (mặc định 40 video gần nhất), `--refresh` (làm mới dòng của video đã có, giữ nguyên trạng thái). Cần `YOUTUBE_DATA_API_KEY`. YouTube tạm chặn (429) khi tải phụ đề dồn dập từ một IP (dễ gặp sau nhiều lần chạy thử liên tiếp): script nghỉ 30s/90s/180s rồi thử lại, nhiều video liền vẫn bị chặn thì tự dừng; chờ khoảng một giờ rồi chạy lại. Chạy lại được: video đã có bị bỏ qua. Gỡ video theo yêu cầu: `delete from video_lessons where video_id = '...'` (cache nghĩa từ của video xóa theo). Migration `20261006000004_video_term_explanations.sql` (cache nghĩa theo ngữ cảnh khi bấm từ trong video) phải chạy **trước khi deploy trang Video**: thiếu bảng thì việc giải nghĩa vẫn chạy nhưng không cache được. Video mới nạp ở trạng thái `draft`; vào `/admin/videos` (tài khoản admin) để xem trước, sửa bản dịch và duyệt thành `listed` thì mới hiện ở `/video` cho người dùng (ẩn/xóa cũng ở đó, không cần SQL).

### Người dùng tự thêm video (`/video/add`)
Chạy migration `20261010000001_video_lessons_added_by.sql` (cột `added_by`) **trước khi deploy**: thiếu cột thì `POST /api/videos/add` trả 500 (đếm giới hạn lỗi nên không bỏ qua giới hạn), việc nạp video của admin vẫn chạy bình thường. Video người dùng thêm vào `listed` ngay; gỡ ở `/admin/videos` (ẩn/xóa) hoặc SQL `delete from video_lessons where video_id = '...'`. Xem ai thêm nhiều: `select added_by, count(*) from video_lessons where added_by is not null group by 1 order by 2 desc`. Chi phí mỗi video: một lượt dịch LLM (chia đoạn 30 dòng chạy song song, vài đoạn lỗi thì dòng đó trống bản dịch) và tùy chọn một credit Supadata. Giới hạn nằm ở `lib/video/add-video-limits.ts`.

## 6. Khi LLM lỗi / hết hạn mức

| Hiện tượng | Xử lý |
|---|---|
| Nhiều bài `Không phân tích được bài hát bằng model nào` | Xem log `attempts`: DeepSeek hết tiền/khoá sai? Groq 429? Nạp credit DeepSeek hoặc chờ reset hạn mức Groq; OpenRouter là lưới cuối |
| Giải nghĩa khi bấm chậm/lỗi | Groq hết hạn mức → rớt sang khóa 2, BytePlus, OpenRouter; kiểm tra từng khoá còn hạn mức |
| Bài dài timeout | Timeout từng model là cố ý ngắn (15–25s); bài rất dài cần tách job nền (backlog) |

## 7. Dữ liệu & kiểm duyệt

- Gỡ bài theo yêu cầu bản quyền: xoá hàng ở `songs` (cascade); cache Next hết hiệu lực trong ≤ 1 giờ (hoặc bump `revN`).
- Góp ý/báo sai/gợi ý bản dịch xử lý ở `/admin/*` (cần email trong `ADMIN_EMAILS`).
- `scripts/prune-songs.mts`: dọn bài phân tích nhiễu. Mặc định dry-run; `--hide` ẩn bài chất lượng thấp/bị báo sai khỏi Khám phá, `--delete` xoá bản phân tích nếu không ai còn dùng.


## Nhắc học (thông báo đẩy)
Migration `20261007000001_push_subscriptions.sql` (chạy tay) tạo `push_subscriptions`. `vercel.json` có cron `0 13 * * *` (UTC) = 20:00 giờ Việt Nam gọi `/api/cron/reminders`; gói Hobby chỉ cho cron mỗi ngày một lần nên không đặt tần suất cao hơn. Route chỉ gửi cho thiết bị chưa nhận nhắc trong 20 giờ và người dùng hôm nay (múi giờ của họ) chưa học; thiết bị trả 404/410 bị xóa. Người dùng bật ở Cài đặt → "Nhắc học mỗi ngày" (đã bỏ thẻ gợi ý ở trang chủ, không tự mời bật). Thử tay: `curl -H "Authorization: Bearer $CRON_SECRET" https://<tên miền>/api/cron/reminders` (trả số liệu tổng hợp, không có nội dung người dùng). iOS chỉ nhận khi đã cài app vào màn hình chính.

## Rà hạn mức hạ tầng trước khi mở rộng (2026-10-07)
- Vercel: gói Hobby cấm dùng thương mại, cần Pro trước khi kiếm tiền hoặc đẩy mạnh. Tối ưu ảnh đã từng cạn (thumbnail YouTube dùng `unoptimized`).
- Phân tích bài mới tốn LLM: đã có hạn mức theo tài khoản (10 ẩn danh / 30 đã đăng nhập mỗi 24 giờ) và theo IP (30/24 giờ); bài đã cache không tốn. Theo dõi hạn mức Groq; khi cần nâng gói trả phí.
- Supabase Free: Realtime tối đa 200 kết nối đồng thời và 100 tin/giây (ảnh hưởng phòng thi đấu khi đông); 500 MB cơ sở dữ liệu (cache phân tích và bài video chiếm dần).


## Email
Migration `20261007000003_email_prefs.sql` (chạy tay) tạo `email_prefs` và đánh dấu "đã chào mừng" cho mọi tài khoản Google có từ trước (họ không nhận email chào muộn nhưng vẫn nhận tổng kết tuần và nhắc theo mặc định, mỗi email có link hủy). Ba loại email, chỉ cho tài khoản có email thật (Google; ẩn danh không có):
- **Chào mừng**: gửi một lần ở `/auth/callback` sau khi đăng nhập Google lần đầu (`after()`, không chậm đăng nhập; gửi lỗi thì trả quyền để lần đăng nhập sau thử lại).
- **Tổng kết tuần**: cron `0 2 * * *` (09:00 giờ Việt Nam) gọi `/api/cron/emails`; chỉ thứ Hai, chỉ khi 7 ngày qua có học, cách lần trước ≥ 6 ngày.
- **Nhắc quay lại**: cùng cron, mọi ngày; khi đã bỏ học 3–30 ngày, tối đa một lần mỗi 7 ngày. Một người nhận tối đa một email mỗi lần chạy.
Mỗi email có link hủy nhận (`/unsubscribe/[token]`, nút bấm gọi `POST /api/email/unsubscribe`; header `List-Unsubscribe` + `List-Unsubscribe-Post` cho hủy một chạm trong ứng dụng thư) và người dùng bật/tắt từng loại ở Cài đặt. Chạy tay: `curl -H "Authorization: Bearer $CRON_SECRET" https://<tên miền>/api/cron/emails` (trả số liệu tổng hợp). Hạn mức Resend gói miễn phí (kiến thức cũ, xem lại trang giá): khoảng 3.000 email/tháng và 100 email/ngày; mỗi lượt cron tối đa 200 người. Vercel Hobby giới hạn số cron (hiện dùng 2: nhắc đẩy và email).


## Tên miền `songhanzi.com` (mua ở Namecheap, 2026-10-07)
- **Vercel:** project → Settings → Domains. Chọn `songhanzi.com` (không `www`) làm tên chính (Production) và cho `www.songhanzi.com` chuyển hướng 308 về nó, để địa chỉ ngắn và khớp `SITE_URL`. `lyric-lab-indol.vercel.app` vẫn dùng được. Chờ trạng thái "Generating SSL Certificate" chuyển xong.
- **DNS:** nếu nameserver vẫn là của Namecheap thì thêm bản ghi ở Namecheap → Advanced DNS; nếu đã chuyển nameserver sang Vercel thì thêm ở Vercel → Domains → DNS Records. Không thêm bản ghi ở cả hai nơi.
- **Tài khoản ẩn danh theo tên miền:** phiên ẩn danh và tiến độ lưu trong trình duyệt gắn với địa chỉ web. Ai đang dùng bằng `vercel.app` mà chuyển sang `songhanzi.com` sẽ thấy như người mới (dữ liệu cũ vẫn ở địa chỉ cũ). Người đã đăng nhập Google không mất gì. Vì vậy không ép chuyển hướng toàn bộ `vercel.app` sang tên miền mới.
- **Đăng nhập Google:** thêm `https://songhanzi.com` vào Supabase → Authentication → URL Configuration (Site URL và Redirect URLs, gồm `https://songhanzi.com/auth/callback`) và vào Google Cloud Console → OAuth client → Authorized JavaScript origins. Quên bước này thì đăng nhập Google trên tên miền mới lỗi.

### Resend (email)
1. Resend → Domains → Add Domain → `songhanzi.com`, vùng gần Việt Nam nhất (Singapore nếu có).
2. Resend hiện các bản ghi DNS (thường: TXT DKIM `resend._domainkey`, MX và TXT SPF ở subdomain `send`). Thêm đúng các bản ghi đó ở nơi quản lý DNS (xem mục DNS trên). Namecheap tự thêm tên miền vào cuối nên ô Host chỉ điền phần đầu (ví dụ `resend._domainkey`, `send`).
3. Bấm Verify trong Resend. Có thể mất từ vài phút đến vài giờ. Nên thêm cả bản ghi DMARC: TXT tên `_dmarc`, giá trị `v=DMARC1; p=none;`.
4. API Keys → Create API Key, quyền "Sending access", giới hạn theo domain `songhanzi.com`. Chép khóa ngay (chỉ hiện một lần) và dán thẳng vào Vercel, không gửi qua chat hay lưu vào git.
5. Vercel → Settings → Environment Variables: `RESEND_API_KEY` = khóa vừa tạo; `EMAIL_FROM` = `SongHanzi <no-reply@songhanzi.com>`; `NEXT_PUBLIC_SITE_URL` = `https://songhanzi.com`. Deploy lại.
6. Chạy migration `20261007000003_email_prefs.sql`.
7. Thử: Supabase SQL Editor chạy `update email_prefs set welcome_sent_at = null where user_id = '<id của bạn>';` rồi đăng xuất và đăng nhập lại bằng Google: sẽ nhận email chào mừng. Thư không tới thì xem Resend → Logs.

## Video PR cho TikTok/Reels (`scripts/pr-video`)
Dựng video dọc 9:16 từ site thật: `node scripts/pr-video/build.mjs [thư-mục-xuất]` (mặc định `~/Desktop/songhanzi-pr`). Cần Playwright (đã có), `ffmpeg` và, với giọng macOS, lệnh `say`. Kịch bản, phụ đề (`**cụm**` thành chữ vàng), bài hát quay (`videoId`) và thời lượng sửa ở `scripts/pr-video/config.json`. Giọng đọc ưu tiên: file của bạn `scripts/pr-video/voice/1.m4a`, `2.mp3`… (số = thứ tự cảnh) > ElevenLabs nếu đặt biến môi trường `ELEVENLABS_API_KEY` (voice theo tên, mặc định Adam; tiếng Việt cần model `eleven_flash_v2_5` hoặc `eleven_turbo_v2_5`) > `say` Linh. Khóa API chỉ để trong biến môi trường của shell, không ghi vào file. Quay bài thật có thể bị TikTok báo bản quyền (ảnh bìa MV, lời bài hát); muốn an toàn thì đổi `videoId`.

## Lọc bài theo cảm xúc (migration + điền dữ liệu bài cũ)
1. Chạy tay `supabase/migrations/20261009000001_song_mood_groups.sql` ở Supabase (thêm cột `songs.mood_groups`, chỉ mục GIN, cập nhật view `discover_songs`). Chưa chạy thì app vẫn chạy bình thường, chỉ ẩn hàng chip cảm xúc.
2. Điền cho bài đã phân tích: `NODE_OPTIONS=--experimental-websocket npx tsx scripts/backfill-mood-groups.mts` (thêm `--dry` để chỉ xem độ phủ từng nhóm và các tag chưa có nhóm, chạy được trước migration). Bài mới tự có nhóm lúc phân tích xong.
3. Đổi bảng từ khóa ở `lib/library/mood-groups.ts` thì chạy lại bước 2 (idempotent).

