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
| `DEEPSEEK_API_KEY` | Nên có | Model phân tích chính (gọi thẳng api.deepseek.com). Thiếu thì rớt sang Groq |
| `FALLBACK_LLM_API_KEY` | Nên có | Khóa Groq thứ hai (hạn mức đếm riêng) |
| `OPENROUTER_API_KEY` | Nên có | Lưới an toàn cuối (gemini flash) |
| `BYTE_PLUS_API_KEY` + `BYTE_PLUS_MODEL_ID` | Tùy chọn | ModelArk cho giải nghĩa khi bấm. Phải đặt cả hai; model id lấy từ console BytePlus (gắn với tài khoản) |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Tùy chọn | TTS thần kinh. Thiếu → `/api/tts` trả 503, nút loa dùng giọng hệ thống |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Tùy chọn | Captcha Turnstile (cần bật trước khi công khai rộng) |
| `NEXT_PUBLIC_SENTRY_DSN` | Tùy chọn | Sentry |
| `NEXT_PUBLIC_SITE_URL` | Tùy chọn | URL gốc khi có tên miền riêng (OG image, sitemap) |
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
