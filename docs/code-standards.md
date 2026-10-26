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
- Thumbnail YouTube (`videoThumbnailUrl`) hiển thị bằng `next/image` phải có `unoptimized`: qua trình tối ưu của Vercel, mỗi bài mới tốn một ảnh nguồn của hạn mức tháng (Hobby) và hết hạn mức thì ảnh vỡ (402 `OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`). Chỉ ảnh tĩnh của app (logo) đi qua trình tối ưu.
- Hook tải dữ liệu phụ thuộc danh sách đổi nhiều lần khi trang tải (bài lưu cục bộ rồi danh sách server) không được trả rỗng giữa các lần tải: giữ dữ liệu cũ và gộp bản mới (mẫu: `components/library/use-song-moods.ts`), nếu không phần giao diện phụ thuộc nó (hàng chip cảm xúc) biến mất rồi hiện lại.
- Mã chạy trên trang bên thứ ba (bookmarklet) tìm phần tử theo tên thẻ/thuộc tính cấu trúc, không theo chữ hiển thị (giao diện YouTube đổi theo ngôn ngữ người dùng), và luôn có thông báo tiến trình cho người dùng; dùng textContent/createElement thay innerHTML (Trusted Types).
- Mã chạy trên trang bên thứ ba (bookmarklet) viết ES5 thuần trong một chuỗi, test bằng cách chạy chính chuỗi đó trong môi trường giả (`lib/video/bookmarklet.test.ts`), và truyền dữ liệu về app qua phần `#` của địa chỉ (không phụ thuộc `window.opener`). Playwright ưu tiên route đăng ký SAU: route chung phải đăng ký trước route cụ thể.
- Điều hướng trạng thái giao diện có ý nghĩa (tab thư viện) phải nằm trên URL (`?tab=`) để nút Back hoạt động.

## Làm việc với LLM

- Mọi đổi nội dung prompt có ảnh hưởng chất lượng: cân nhắc bump `PROMPT_VERSION` (vô hiệu hoá cache toàn bộ) và cập nhật test phiên bản.
- Thêm nhà cung cấp mới: viết client bọc `createCompatChat` (`groq-chat.ts`), thêm tiền tố vào `createChatRouter`, thêm khoá optional vào `server-env.ts`, đặt model vào `DEFAULT_MODELS` hoặc `EXPLAIN_MODELS`. Thiếu khoá thì rớt qua model kế, không lỗi.
- Giữ timeout từng lần gọi ngắn (15–25s) và `FAST_FAIL_LIMITS` ở production vì tổng ngân sách 60s.
- Xưng hô bản dịch: một cặp duy nhất cho cả bài, theo bảng trong `build-analysis-prompt.ts`; sửa gốc ở prompt, sửa từng bài bằng script.
- Pinyin chữ nhiều âm chọn nhầm: thêm vào `COMMON_READING` + test trong `lookup-words.test.ts` + `backfill-pinyin.mts --apply`.

## Tra từ
- Mọi truy vấn vào `dict_words` cho tìm kiếm đi qua `DictSearchPort` (`lib/tra-tu/dict-search-port.ts`); logic xếp hạng/phối hợp nguồn là hàm thuần test bằng cổng giả. Nguồn tìm lỗi phải được nuốt (`safe`) để các nguồn còn lại vẫn trả kết quả.
- Pinyin, Hán Việt, cấp HSK trên trang tra từ chỉ lấy từ từ điển. Nghĩa tiếng Việt do AI viết (khi có) luôn gắn nhãn "do AI dịch, có thể chưa chính xác".
- Dữ liệu từ gói có giấy phép riêng (hanzi-writer-data: Arphic Public License): không sao chép vào repo, phục vụ nguyên văn từ gói đã cài, giữ tệp giấy phép nguyên bản trong `public/licenses/` và ghi nguồn ngay trên giao diện nơi dùng.
- Khóa của `outputFileTracingIncludes` là glob: tuyến động viết `/api/x/**`, không viết `[param]`.
- Danh sách `in(...)` với chữ Hán phải chia lô (≤100 mục): mỗi chữ mã hóa 9 ký tự URL.

## Test

- **Vitest** cho logic: tokenizer, bộ lọc level, validate vị trí, FSRS, chọn bản LRCLIB, parser, rate-limit… Không dùng dữ liệu giả để "qua build"; test phải kiểm tra hành vi thật.
- **Playwright** cho luồng dán link → xem trước → nghe, game, thư viện, accessibility (axe). Dùng trang fixture `/dev/*` và YouTube IFrame API giả; thiếu khoá Supabase thì bỏ qua.
- Trước khi push: `npm run lint`, `npx tsc --noEmit`, `npm run test`. Không tắt test thất bại để qua CI.

## Git

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`), mô tả thay đổi, không nhắc mã finding hay nhãn audit.
- Commit nhỏ, tập trung. **Không commit bí mật** (`.env*`, khoá API); kiểm tra `git diff --cached` trước khi commit.
- Khi dùng git worktree: stash dùng chung giữa các worktree — tránh `git stash` trần; dùng commit WIP.

## Bảng mới có `user_id`

Mọi bảng có khóa ngoại tới `auth.users` phải được xử lý khi người ẩn danh đăng nhập Google: thêm vào hàm SQL `merge_user_data` (migration `create or replace` mới, nhớ sao chép đủ thân hàm hiện có) hoặc cố ý bỏ qua kèm lý do. Test tích hợp `mọi bảng có user_id đều đã được phân loại` (trong `tests/integration/rooms.test.ts`) sẽ đỏ nếu quên. Dữ liệu người chơi mà đối thủ có thể đọc qua Realtime hoặc RLS không được lộ đúng/sai hay lựa chọn trước khi chính họ trả lời (xem phòng thi đấu).

## Nhắc về dữ liệu

- Local và production chung một DB Supabase: ghi từ máy local là ghi vào dữ liệu thật. Phần lớn script ghi DB mặc định dry-run (trừ `reanalyze-reuse-old-lyrics.mts`) — đọc đầu file script trước khi chạy.
- Sửa dữ liệu phân tích trực tiếp trong DB phải kèm bump `revN` của `unstable_cache`.

- Phím tắt màn Nghe và màn Xem video: hook chung `components/listen/use-listen-shortcuts.ts`, nút/hộp thoại `shortcuts-help-button.tsx`; thêm phím mới thì sửa `lib/listen/keyboard-shortcuts.ts` và danh sách trong hộp thoại.

- Ảnh `ImageResponse` (og:image): lấy font qua `lib/streak/og-fonts.ts` (Google Fonts với tham số `text` để có MỘT file đủ ký tự tiếng Việt). Đừng nạp từng khối unicode-range làm các font riêng cùng tên: satori chỉ dùng một khối nên cùng một từ bị trộn hai kiểu chữ. Font chưa có chữ Hán, nên không đưa tên bài hay lời vào ảnh og.

- Trang Cài đặt: mỗi nhóm một tab (`SettingsTabs`), mọi bảng đều được dựng sẵn và chỉ ẩn bảng không chọn (các phần tự tải dữ liệu không mất trạng thái). Dòng cài đặt nào có thể tự ẩn (thông báo, email) thì thẻ chứa nó cần dòng chú thích `only:block` để không hiện thẻ trống.

- Font: không thêm `<link rel="stylesheet">` font nặng vào `<head>` (chặn lần vẽ đầu). Font chữ Hán nạp qua `CjkFontLoader`; font Latin/Việt tự host bằng `next/font` chỉ với các biến thể đang dùng (mỗi kiểu × đậm × bộ ký tự là một file được preload). Ảnh `icon.png` giữ nhỏ (đang tải ở mọi trang); ảnh lớn cho manifest để ở `public/`.

## Nhận dạng giọng nói (ASR)
- Mốc giờ do LLM nghe video trả về **không tin ngay**: luôn đọc qua `parseAsrJson` (chấp nhận `MM:SS`), kiểm tra `timingLooksBroken`/cửa sổ rồi mới dùng; kết quả hỏng thì rớt sang model kế, không đoán lại. Bắt model dùng đồng hồ của CẢ video (`"MM:SS"`), đừng bắt tính "từ đầu đoạn" (đo thực tế: cả đoạn bị nén vào vài giây).
- Mỗi lần gọi một model nghe video phải nằm trong 60 giây của route (Hobby): chia đoạn ngắn (2 phút), đo lúc nguội chứ không chỉ lần chạy có cache.
- Bản chép tự động luôn lưu chữ GIẢN THỂ: `cleanAsrLines` đổi bằng `toSimplifiedChinese`, đừng dựa vào prompt (model vẫn chép phồn thể với video Đài Loan/Hồng Kông).
- Bản chép tự động luôn mang nhãn `transcript_source = 'auto'` và giao diện phải cảnh báo "có thể sai"; không bao giờ để LLM bịa lời khi không có tiếng nói (prompt dặn bỏ trống, `cleanAsrLines` gom câu lặp).
- Không tải audio YouTube lên server của app: hướng web để Google tự lấy video qua link, chỉ script chạy trên máy admin được tải audio về máy.

## Thanh cuộn

`html` có `scrollbar-gutter: stable` (`app/globals.css`) để trang ngắn và trang dài cùng bề rộng nội dung; đừng bỏ, nếu không giao diện bị xô ngang mỗi khi thanh cuộn dọc xuất hiện (nhất là khi đổi tab trong Cài đặt). Không dùng `overflow-y: scroll` để thay thế (nó vẽ thanh cuộn cả ở các khung lồng nhau).

## Bề rộng khung nội dung

Khung nội dung chính của mọi trang (header, `main`, chân trang, màn học) dùng `max-w-page` (biến `--container-page` = 100rem trong `app/globals.css`), không dùng `max-w-7xl` rời rạc: đổi một chỗ là đổi cả app. Đã nới từ 1280px lên 1600px để màn lớn đỡ thừa lề hai bên.

## Màn Nghe trên điện thoại (mật độ lời)
- Danh sách lời ưu tiên nhìn được nhiều câu: chữ, pinyin, padding và khoảng cách dòng dùng cỡ nhỏ hơn dưới `md` (xem `lyric-line-row.tsx`), cỡ gốc từ `md` trở lên. Không thêm cột bên phải cạnh dòng lời trên điện thoại vì nó bóp hẹp chữ Hán và làm lời ngắt dòng liên tục; hành động của dòng (chia sẻ, sửa) nằm dưới câu đang hát.
- Vùng bấm vẫn ≥ 44 px bằng cách phình nút rồi kéo lề âm (`-mr-5`), không bằng cách cho nút chiếm chỗ.
- Khối phụ (canh lời, báo lỗi) đứng sau danh sách lời trên điện thoại (`max-lg:order-last`).

## Phân tích âm thanh phía client
Ngưỡng của bộ dò cao độ (`pitch.ts`) đã chỉnh bằng dữ liệu thật; đổi hằng số nào phải chạy lại phép đo trên các file giọng thật, không chỉ test tổng hợp. Dữ liệu nội dung phát âm (`pinyin-chart-data.ts`, `tone-data.ts`) tách khỏi component để test và để dùng lại ở các đợt sau.

## Chấm phát âm
Không để LLM "giải thích" điểm số khi nguồn không cho biết nguyên nhân; dùng bảng tĩnh có nguồn (`pinyin-chart-data.ts`). Chuẩn hóa phản hồi Azure ở file thuần (`assessment-normalize.ts`) để test bằng fixture, file gọi mạng (`azure-assessment.ts`, `server-only`) chỉ lo HTTP.

## Tiến độ lưu cục bộ
Dữ liệu chỉ có giá trị với một thiết bị (chuỗi ngày luyện phát âm, điểm cao nhất) đọc/ghi qua `learning-progress.ts` với try/catch và kiểm tra dạng dữ liệu; hook đọc localStorage sau hydrate để HTML server và client khớp.

## Focus trong dialog/sheet
Mọi lời gọi `focus()` khi mở hoặc trả focus lúc đóng popup/sheet phải có `{ preventScroll: true }`, nếu không trình duyệt cuộn trang tới phần tử được focus.

## Migration thay hàm gộp tài khoản
Mỗi migration `create or replace function public.merge_user_data` phải sao ĐẦY ĐỦ bản mới nhất rồi thêm phần của mình, và đối chiếu từng cột/bảng với bản trước (đã từng rơi `daily_goal` khi chép thiếu). Thêm bảng theo người dùng nào thì thêm cả đoạn hợp nhất và đoạn xóa dữ liệu nguồn.

## Màu trên nền cam và tương phản
`--primary` (cam đậm) đi với `text-on-primary`; `--primary-container` (cam sáng) đi với `text-on-primary-container` (nâu đậm). KHÔNG ghép `bg-primary-container` với `text-on-primary`, và hover của nút `bg-primary` dùng `hover:brightness-110` chứ không đổi sang `bg-primary-container` (chữ trắng trên cam sáng chỉ ~2,9:1). Mọi trang chính có kiểm tra axe sáng/tối trong `tests/e2e/accessibility.spec.ts`.

## Vẽ canvas với font chữ Hán
- Font chữ Hán của trang (Noto Serif SC qua Google Fonts) chia thành nhiều mảnh theo unicode-range và theo độ đậm; trình duyệt chỉ tải mảnh khi trang cần vẽ chữ đó ở đúng độ đậm. `document.fonts.ready` KHÔNG đợi các mảnh này nên vẽ canvas ngay sẽ có chữ rơi về font hệ thống, nét đậm nhạt khác nhau trong cùng một câu. Trước khi `fillText` chữ Hán, gọi `await document.fonts.load(font, đoạnChữSắpVẽ)` (xem `lib/share/line-card.ts`).

## Âm thanh gửi LLM và header dính

- Âm thanh gửi cho model (`ChatRequest.audio`) luôn đặt TRƯỚC phần văn bản trong `parts`; chỉ gửi khi người dùng bấm nút, ghi rõ trên UI là sẽ gửi sang bên thứ ba, không lưu ở server. Chuyển sang WAV 16 kHz mono ở client (`lib/practice/audio-to-wav.ts`) thay vì gửi nguyên định dạng của trình duyệt.
- Kết quả LLM trỏ vào văn bản (ví dụ `issues[].word`) phải kiểm tra có nằm trong câu mẫu, không khớp thì loại (cùng tinh thần quy tắc khớp vị trí).
- Thanh tiêu đề của màn Nghe và màn học video **dính** dưới thanh điều hướng chung (`sticky top-16 z-30 h-14`); trình phát dính ở `top-[7.5rem]` (4rem + 3,5rem) và panel bên phải ở `lg:top-[8.5rem]`. Đổi chiều cao thanh tiêu đề thì đổi cả các mốc `top` này. Sau khi gửi form làm nút bị khóa, trả tiêu điểm về ô nhập để phím Esc vẫn đóng được hộp thoại.
- Phát đoạn một câu video luôn qua `clipRange` (không dùng thẳng `line.start`/`line.end`) để áp phần người học chỉnh. Nhãn nút chứa số thập phân viết dấu phẩy (0,1) để khớp văn bản hiển thị và test.
- Component client không import module có `@node-rs/jieba` (hay bất kỳ gói native): đặt kiểu và hàm thuần dùng chung vào file `*-shared.ts` không có phụ thuộc nặng (ví dụ `lib/tools/han-converter-shared.ts`).
- Chọn model LLM bằng tên cụ thể, không dùng alias `-latest` (có lúc trỏ vào model quá tải/ngưng); nhiều khóa API chỉ giải quyết hạn mức, không giải quyết model quá tải, nên luôn có model dự phòng thật sự chạy được (và có số dư).
- Một `ConfirmDialog` cho cả danh sách: đừng render một hộp thoại cho từng dòng (trùng `id`, sai tên trợ năng); giữ trạng thái "đang xác nhận cho mục nào" ở cha và render đúng một hộp thoại.
- Quyền hạn (huy hiệu admin, loại tin) do server quyết từ phiên, không nhận từ client.
- Danh sách dài (video 400+ dòng) dùng `content-visibility: auto` trên từng dòng; đừng thêm `ruby`/nút theo từng chữ mà không đo lại, vì số phần tử DOM nhân lên rất nhanh (mỗi dòng đã ~120 phần tử).
- Game hóa: công thức (XP, cấp, huy hiệu, nhiệm vụ, đóng băng chuỗi) là hàm thuần trên `DayActivity` trong `lib/game` và `lib/streak`; chỉ `game-repo.ts`/`game-service.ts` chạm DB. Thêm nguồn XP mới = thêm cột vào `DayActivity` + đơn giá và TRẦN ngày trong `xp-rules.ts` + test; không bao giờ tính XP từ giá trị điểm do client gửi. Mọi đường đọc bảng game phải coi lỗi/bảng thiếu là rỗng (migration do người dùng chạy tay). Bảng game mới theo người dùng phải vào `merge_user_data` và danh sách "merged" của `tests/integration/rooms.test.ts`.

## Đường dẫn (route)

- Mọi route của ứng dụng đặt tên tiếng Anh, kebab-case (`/explore`, `/courses`, `/install`, `/video/channel/...`). Tham số truy vấn cũng tiếng Anh (`?course=`).
- NGOẠI LỆ có chủ ý: các trang marketing công khai (`/phat-am/*`, `/tu-vung-hsk`, `/chu-han-sang-pinyin`, `/cong-cu`) giữ slug tiếng Việt vì là từ khóa SEO của người Việt (chủ dự án chốt 2026-10-26).
- Đổi tên route thì thêm chuyển hướng vĩnh viễn vào `lib/routes/legacy-redirects.ts` để link cũ còn dùng được; dữ liệu lưu theo id cũ phải có bước đổi khóa khi đọc.
