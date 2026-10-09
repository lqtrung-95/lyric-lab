# Bàn giao và tình trạng hiện tại

Đọc file này đầu tiên. Cập nhật lần cuối: 2026-10-04.

## SongHanzi là gì

Web app cho người Việt học tiếng Trung qua bài hát: dán link YouTube → xem trước từ vựng/ngữ pháp → nghe với lời chạy theo nhạc → ôn flashcard (FSRS) và chơi mini-game luyện tập. Yêu cầu sản phẩm đầy đủ: [`PRD.md`](PRD.md). Thiết kế: [`design-brief.md`](design-brief.md).

Thứ tự đọc cho người mới: file này → [`system-architecture.md`](system-architecture.md) → [`code-standards.md`](code-standards.md) → [`operations-runbook.md`](operations-runbook.md) → `PRD.md` khi cần chi tiết yêu cầu.

## Tình trạng

| Hạng mục | Trạng thái |
|---|---|
| M0 spike nguồn lời, M1 pipeline phân tích, M2 UI Xem trước + Nghe | Xong |
| M3 flashcard FSRS, tài khoản ẩn danh + Google, thư viện, tổng kết bài, hạn mức theo tài khoản | Code xong |
| Thêm sau M3 | Khám phá/tìm bài, bảng xếp hạng, chuỗi ngày học + banner chia sẻ, mini-game (điền từ, ghép cặp, pinyin, karaoke), góp ý + tường góp ý, báo sai bài/mục, gợi ý sửa bản dịch, trang admin, giải nghĩa cả câu |
| Phân tích AI hiện hành | `PROMPT_VERSION = "v6"`, cả 113 bài trong thư viện đã chạy lại bằng v6 (DeepSeek) |
| Production | Vercel Hobby (vùng `sin1`), Supabase Cloud. Đã deploy; đang cho một số người dùng thử |

Chưa làm trước khi công khai rộng (từ README cũ): thử tay đăng nhập Google, bật captcha Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`).

## Đang làm: Video luyện nghe (chép chính tả, shadowing)

Kế hoạch ở `plans/261006-1810-video-shadowing-dictation/`. **Mục "Video" trên menu đang ẩn ở production với mọi người kể cả admin** (chỉ môi trường dev thấy; admin vào thẳng `/video`); mở công khai bằng `NEXT_PUBLIC_VIDEO_PUBLIC=1` rồi deploy lại. Quyết định: chức năng riêng khỏi bài hát, nguồn do admin tuyển chọn (người dùng không dán link), dùng phụ đề YouTube có sẵn, chỉ phân tích khi bấm từ. Nguồn đầu: kênh của chủ dự án @ChineseGlow (13 video có phụ đề tiếng Trung + Việt do người làm). DaihuaXiyou không dùng được (không có phụ đề tiếng Trung). Giai đoạn 1 (migration `20261006000003_video_lessons.sql` + script nạp) và 2 (trang `/video`, màn xem, bấm từ lưu thẻ; migration `20261006000004_video_term_explanations.sql`) và 3 (chép chính tả), 4 (luyện nói theo/shadowing), 5 (trang quản trị `/admin/videos`) đã code. **Còn lại**: nạp video bằng nút "Nạp video từ kênh" ở `/admin/videos` (chạy trên server; script cục bộ bị YouTube chặn 429 theo IP), duyệt video ở cùng trang, rồi mở mục Video cho mọi người bằng `NEXT_PUBLIC_VIDEO_PUBLIC=1`. Chưa làm: lọc video theo level/kênh, đồng bộ tiến độ chép chính tả theo tài khoản, nút lưu hàng loạt từ sai, giao diện quản lý nguồn (`video_sources`). Nút "Nghe lại đúng đoạn" ở thẻ ôn và "tiếp tục nghe" ở trang chủ hiện chỉ biết bài hát, chưa biết video.

## Việc dở / quyết định đang treo

- **Biệt danh và ảnh đại diện**: một biệt danh và một ảnh đại diện dùng chung cho phòng thi đấu và bảng xếp hạng (xem `docs/system-architecture.md` mục "Biệt danh dùng chung"); đặt tên không tự công khai điểm.
- **Thi đấu: lưu từ và lịch sử**: màn kết quả có nút lưu từng từ và "Lưu các từ trả lời sai" (cùng kho thẻ với màn Nghe); lịch sử ở `/room/history` (50 ván gần nhất, bấm vào xem lại từng câu). Pinyin trong câu hỏi hiện ngay trên từng chữ Hán. Nghĩa dòng lời ẩn tới khi trả lời (chủ phòng bật được lúc tạo phòng; cần migration `20261006000002_room_show_translation.sql`). Chưa phân trang lịch sử, chưa dọn ván cũ.
- **Phòng thi đấu 1v1** (kế hoạch `plans/261005-1700-realtime-practice-rooms/`): giai đoạn 1–5 xong (server, ván chơi thời gian thực, giao diện, gộp tài khoản, chống lạm dụng, e2e hai trình duyệt). **Giai đoạn 2 của dự án chưa làm**: ghép ngẫu nhiên (hàng đợi + "bóng ma"), lời mời, bạn luyện cùng gần đây, thêm chế độ chơi, emoji sau ván, nút "Đổi bài" ở phòng chờ, báo cáo/chặn người chơi, lọc từ tục ở tên hiển thị. Xem `docs/backlog.md`.
- **Độ lệch lời mặc định (admin)**: đã có (`songs.lyric_offset_sec`, nút ở bảng chỉnh lời). Admin lưu thì mọi chỉnh cá nhân trước đó của bài bị bỏ (DB về 0, bản trên trình duyệt tự cũ theo `base`).

- **Quét bài có quá ít từ vựng**: sau khi nâng prompt lên 20–25 từ, một số bài vẫn ra ít (đã sửa tay `aaM7qG2ycjk`, `p6jOf_uDeH8`, `QQucPUfXUQQ`). Chưa quét toàn bộ — chủ dự án chọn "tạm thời không cần". Tiêu chí gợi ý: bài có < ~15 mục vocab trong `song_analyses.items`.
- **Tách phân tích LLM thành job nền** (Inngest/Trigger.dev) để thoát trần 60s của Vercel Hobby: đã ước effort, hoãn. Chi tiết: [`backlog.md`](backlog.md).
- **Chọn ngôn ngữ giải nghĩa (vi/en)**: cache key đã có `explainLang`, nhưng đang hardcode `"vi"`. Xem backlog.
- Mọi việc đã hoãn khác nằm ở [`backlog.md`](backlog.md).

## Quyết định then chốt đã chốt (đừng đảo lại không có lý do mới)

1. **DeepSeek gọi thẳng API làm model phân tích chính**, không qua OpenRouter. Đã đo: DeepSeek qua OpenRouter dao động 30s+/treo (cả prompt cũ lẫn mới), còn gọi thẳng ~1–13s. Vì vậy đừng nới timeout OpenRouter — không giúp gì.
2. **Qwen không dùng**: nạp credit cần giấy tờ thuế (TIN Tax Certificate), chủ dự án không có.
3. **Dịch lời "thoát ý", không word-by-word**, và mỗi bài chọn đúng **một cặp xưng hô** (tớ–cậu / anh–em / tôi–bạn…) theo bảng quyết định trong `build-analysis-prompt.ts`. Lỗi xưng hô từng xảy ra nhiều; sửa từng bài bằng script, sửa gốc bằng prompt.
4. **Không bao giờ để LLM viết/đoán lời bài hát.** Lời chỉ từ caption YouTube → LRCLIB → NetEase.
5. **Pinyin, HSK, Hán Việt lấy từ từ điển**, không từ LLM (xem `COMMON_READING` cho chữ nhiều âm).
6. Local và production **dùng chung một DB Supabase**. Chạy script ghi DB từ máy local là đang ghi vào dữ liệu thật.

## Các bẫy đã gặp (đọc trước khi debug)

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Bài lạ hoắc / lời sai hoàn toàn | LRCLIB có nhiều bản cùng tên bài + nghệ sĩ nhưng lời khác nhau; khớp theo thời lượng có thể chọn nhầm (ca `pbSji_3prUc`) | Ép đúng id LRCLIB rồi chạy lại phân tích |
| Lời bài `7I1SPKwTXJ0` bị lặp dồn giữa các câu | Caption của riêng video này chứa các cue nối tiếp lặp phần lời trước | Đã sửa dữ liệu của bài này; không tự động áp dụng cách cắt phần lặp cho bài khác |
| Đăng nhập Google xong vẫn ẩn danh, phải đăng nhập lần 2 (đã sửa) | Trước đây luôn thử `linkIdentity` trước; Google đã có tài khoản thì bị từ chối, chưa có phiên nào, phải đăng nhập lại để gộp | Nay mọi trường hợp đi một đường qua `signInGoogle` + trang gộp (tự gộp khi không có gì bị đè). Cần migration `20261004000001` đã chạy |
| Gộp tài khoản làm mất bài thích/điểm game/hồ sơ xếp hạng | `merge_user_data` cũ không chuyển các bảng thêm sau; tài khoản ẩn danh bị xoá cascade | Migration `20261004000001`; bảng mới có `user_id` phải thêm vào hàm này |
| Admin lưu độ lệch mặc định xong, tải lại thì lời lệch đúng bằng giá trị vừa lưu (đã sửa) | `setOffset(0)` xoá khóa `localStorage` nên máy hỏi lại tài khoản trước khi bản 0 kịp ghi lên và nhận về độ lệch cũ → cộng đôi (mặc định + cá nhân) | `writeLocal` giữ cả giá trị 0 (không xoá khóa) trong `lib/user-state/use-lyric-offset.ts`. Độ lệch mặc định cộng ngoài cache phân tích (`readCachedAnalysis`) |
| Phòng thi đấu: đối thủ biết mình vừa đúng/sai qua Realtime | Nếu cập nhật điểm ngay lúc trả lời thì sự kiện Realtime/đọc bảng lộ kết quả | Điểm hiển thị chỉ cập nhật khi câu đóng (`advance_room`); lúc trả lời chỉ đánh dấu `answered_idx`. Đừng thêm cột lộ đúng/sai vào `room_players` |
| Sửa DB trực tiếp mà UI vẫn hiện bản cũ | `unstable_cache` trong `lib/analysis/server-deps.ts` giữ 1 giờ | Tăng hậu tố `revN` trong key cache |
| Vào bài nào cũng phải phân tích lại | Vừa bump `PROMPT_VERSION` → cache key đổi → mọi bài thành "chưa phân tích" | Chạy backfill `reanalyze-songs.mts`, hoặc chấp nhận phân tích lười khi mở bài |
| Script `tsx` lỗi `server-only` | `import "server-only"` ném lỗi ngoài Next | Script tự dựng phụ thuộc, không import `server-deps.ts` (xem `scripts/reanalyze-songs.mts`) |
| Groq trả 429, chờ ~3 phút | Hết hạn mức token ngày của gói free (gpt-oss-120b: 200k TPD) khi chạy backfill | Dùng DeepSeek (đã đứng đầu); production dùng `FAST_FAIL_LIMITS` để rớt model nhanh |
| Pinyin sai (听→yǐn, 读→dòu, 说→shuì) | Từ điển có nhiều âm, hàm chọn mục đầu | Thêm vào `COMMON_READING` (`lib/dictionary/lookup-words.ts`), chạy `scripts/backfill-pinyin.mts --apply`. Bài cũ cũng tự sửa lúc đọc (`repairLinePinyin`) |
| Analyze đứt giữa chừng trên Vercel | Hobby cắt cứng 60s, dùng chung cho lấy lời + LLM | Giữ timeout từng model ngắn (Groq/OpenRouter 15s, DeepSeek 25s) để kịp rớt model |
| `.env.local` bị ghi đè / giá trị rỗng | Một số lệnh `vercel` CLI (`ls`, `env pull`) ghi đè file | Không chạy `vercel` CLI trong repo trừ khi cần; luôn kiểm tra giá trị không rỗng sau khi sửa env |
| Lộ khóa | `.env.example` bị dán khóa thật | `.env.example` chỉ chứa tên biến/giá trị mẫu. Kiểm tra `git diff` trước mỗi commit |

## Việc mới nhất đã làm (để tiện nối tiếp)
- 2026-10-10: nút báo bản dịch video sai (AI dịch lại ngay dòng đó) và lấy phụ đề tiếng Việt có sẵn qua dấu trang (kèm cổng chất lượng ghép dòng, áp cả Supadata). VIỆC CỦA NGƯỜI DÙNG: chạy migration `20261010000002_video_translation_reports.sql`; test tích hợp `tests/integration/rooms.test.ts` chỉ xanh sau khi chạy migration (kiểm tra cột `user_id` mới đã phân loại gộp tài khoản). CHƯA kiểm chứng trên YouTube thật: bước chuyển sang tiếng Việt của dấu trang (cùng cơ chế chọn ngôn ngữ chưa thấy DOM thật). Chưa có trang admin xem báo cáo.
- 2026-10-10: dấu trang tự chuyển bản chép lời sang tiếng Trung khi bảng mở bằng ngôn ngữ khác (video nhiều ngôn ngữ) và báo ngay nếu video không có track tiếng Trung; đường Supadata dùng luôn phụ đề tiếng Việt có sẵn làm bản dịch. CHƯA kiểm chứng trên YouTube thật: cấu trúc ô chọn ngôn ngữ (đoán theo vai trò/thẻ phổ biến; thất bại thì báo người dùng chọn tay, thông báo lỗi kèm nhãn ô ngôn ngữ để chẩn đoán). Lấy phụ đề tiếng Việt qua dấu trang chưa làm (phải chuyển ngôn ngữ thêm lần nữa, dễ vỡ; và danh sách ngôn ngữ trong bảng có cả bản dịch máy của YouTube, chỉ track có thật trong danh sách track mới là phụ đề người làm).
- 2026-10-10: trang Thêm video luôn hiện sẵn ô dán phụ đề và hướng dẫn dấu trang (bỏ nút "Tự dán phụ đề hoặc dùng dấu trang").
- 2026-10-10 (lỗi thấy khi thử dấu trang thật): bản chép lời lẫn nhãn "xx minutes, yy seconds" (đã lọc ở bộ đọc, mọi ngôn ngữ) và trang Thêm video báo "Cần mở lại trang để có phiên đăng nhập" (401, vì trang không tự tạo phiên ẩn danh; đã sửa). Đã bỏ nút "Sao chép mã dấu trang" (người dùng thường không dùng được).
- 2026-10-10 (sửa dấu trang sau khi người dùng thử trên YouTube thật): video có bản chép lời trong khung "In this video" (thẻ Timeline/Transcript) bị báo "chưa tải được" vì dấu trang chỉ tìm khung theo target-id; đã đọc theo dòng bản chép lời, thêm thông báo tiến trình trên trang YouTube, vòng quay và tự gửi ở trang Thêm video, tìm nút/thẻ theo cấu trúc thay vì chữ. Cần người dùng thử lại trên YouTube thật (mã vẫn chỉ được test bằng môi trường giả; trang thật có thể có thêm biến thể DOM, thông báo lỗi giờ kèm "mã lỗi" để chẩn đoán).
- 2026-10-10 (sau đó): đường Supadata đã chạy thật trên production (video thử thành công). Dấu trang đơn giản hóa: tự mở bản chép lời, kiểm tra tiếng Trung, bỏ nhánh đọc track; trang Thêm video mặc định chỉ có ô link, phần dán/dấu trang mở khi cần; server từ chối phụ đề không phải tiếng Trung (`not_chinese`). Tự chọn ngôn ngữ trong bảng bản chép lời của YouTube CHƯA làm (DOM khó đoán, cần thử trên máy thật), hiện chỉ báo người dùng đổi tay. Trong trình duyệt thử của Claude, YouTube không phục vụ phụ đề nên chưa kiểm chứng dấu trang trên YouTube thật.
- 2026-10-10: người dùng tự thêm video tiếng Trung (podcast, vlog) vào kho Video dùng chung: trang `/video/add`, dấu trang, Supadata tùy chọn (xem system-architecture). CHƯA lên production: VIỆC CỦA NGƯỜI DÙNG là chạy migration `20261010000001_video_lessons_added_by.sql`, (tùy chọn) đặt `SUPADATA_API_KEY` trên Vercel, rồi merge vào `main`. CHƯA kiểm chứng trên YouTube thật: dấu trang đọc bảng bản chép lời (đã chạy thử trong môi trường giả, và trên trang YouTube thật thì bảng không tải trong trình duyệt thử nên chưa thấy được cấu trúc dòng), và đường Supadata chưa gọi thật vì chưa có khóa. Hướng nhận dạng giọng nói (ASR) đã bỏ khỏi đợt này theo quyết định của chủ dự án.
- 2026-10-09: nút tốc độ màn Nghe mở bảng `PlaybackRatePopover` (thanh trượt 0,5x–2x bước 0,05, nút −/+, nút chọn nhanh 0,5/0,75/1/1,25/1,5/2; không có 3x vì player nhúng YouTube tối đa 2x). Tốc độ lưu trong localStorage nhận mọi mức trong khoảng (làm tròn 0,05). Cũng sửa hàng chip cảm xúc ở Bài hát của tôi bị nhấp nháy khi danh sách bài tải xong.
- 2026-10-09: lọc bài theo 8 nhóm cảm xúc ở Thư viện (Khám phá + Bài hát của tôi) và liên kết từ tag cảm xúc ở trang bài. VIỆC CỦA NGƯỜI DÙNG: chạy migration `20261009000001_song_mood_groups.sql` rồi `scripts/backfill-mood-groups.mts` (xem operations-runbook), chưa chạy thì hàng chip ẩn. Cũng trong ngày: hướng dẫn màn Nghe, chia sẻ câu hát (popup, link trỏ trang Nghe kèm thẻ xem trước riêng của câu), `app-home.spec.ts` đã cập nhật theo hành động "Học ngay" và level mặc định HSK 1.
- 2026-10-09: màn Nghe trên điện thoại gọn hơn (lời nhỏ hơn, nút chia sẻ dưới câu đang hát, canh lời/báo lỗi xuống sau danh sách); chia sẻ câu mở thẳng share sheet trên điện thoại; thẻ chia sẻ khoảng cách đều và ngắt dòng cân bằng; nút Tải ảnh dùng link blob mới lúc bấm. Chưa kiểm chứng trên máy Android thật: nguyên nhân Tải ảnh lỗi chưa tái hiện được (trên Chromium giả lập vẫn tải được), giả thuyết là link blob cũ bị thu hồi hoặc chế độ PWA đã cài. Nếu vẫn lỗi cần biết người dùng thấy gì (không có gì, báo lỗi, hay file nằm đâu).

- Prompt v6 (20–25 từ vựng, dịch thoát ý, quy tắc xưng hô); DeepSeek trực tiếp + BytePlus cho giải nghĩa khi bấm.
- Script `reanalyze-songs.mts`, `reanalyze-reuse-old-lyrics.mts`, `backfill-pinyin.mts`.
- Logo ảnh thật (sáng/tối), tab Thư viện có URL riêng (`?tab=`), tự cuộn theo câu hát khi không ghim, sửa pinyin 读, bỏ hạn mức phân tích/ngày khi chạy `next dev`.

## Liên hệ / quyền truy cập cần có

Người tiếp quản cần được cấp: repo GitHub, project Vercel, project Supabase, khóa API (Groq ×2, DeepSeek, BytePlus ModelArk, OpenRouter, YouTube Data API, Azure Speech tùy chọn), Sentry. Không có khóa nào được lưu trong repo; xem [`operations-runbook.md`](operations-runbook.md).

- Video luyện nghe: đã nạp 9 video của @ChineseGlow (draft) từ SRT của công cụ podcast bằng `scripts/ingest-from-podcast-output.mts` (YouTube chặn tải phụ đề). Còn 2 tập chưa ghép được video (HSK2 ordering coffee, HSK4 vượt qua nỗi sợ thất bại: chưa đăng?). Việc của bạn: duyệt draft ở `/admin/videos`, rồi đặt `NEXT_PUBLIC_VIDEO_PUBLIC=1` để mở tab Video.

- Vào bài không cần dán link: `/watch?v=ID` (đổi tên miền youtube.com → tên miền app) và `/share-target` (Web Share Target của PWA, Android: Chia sẻ từ app YouTube) chuyển thẳng tới `/learn/ID`; `app/manifest.ts` khai báo PWA + share target; bookmarklet và hướng dẫn ở thẻ "Học nhanh từ YouTube" trong Cài đặt. iOS chưa hỗ trợ share target. Trang chủ: hành động "Hôm nay" khi chưa có gì cần làm đề xuất sẵn một bài (nút "Học ngay"), và khi nghe hết bài có nút "Bài tiếp theo" (bài hợp level chưa nghe). Chưa làm extension trình duyệt (cân nhắc lại nếu nhiều người dùng máy tính đòi hỏi).

- Bật/tắt bản dịch hoặc pinyin trong danh sách lời: `LyricList` giữ câu đang hát ở giữa màn hình ngay sau khi bố cục đổi (`useLayoutEffect` theo `showPinyin|showTranslation`, cuộn tức thì), vì độ cao các dòng đổi làm câu bị đẩy đi.

- Hướng 3 tháng (chốt 2026-10-07): ưu tiên nhiều người dùng, kiếm tiền tính sau, app là sản phẩm độc lập. Kế hoạch 4 tuần ở `docs/backlog.md` mục "Kế hoạch tăng trưởng 3 tháng". Cảnh báo: Vercel Hobby cấm dùng thương mại, cần lên gói phù hợp trước khi đẩy mạnh.

- Tuần 1 (tăng trưởng): nhắc học bằng web push đã xong ở code, **chưa chạy thử đầu-cuối trên thiết bị thật**. Việc của bạn: chạy migration `20261007000001_push_subscriptions.sql`, sinh khóa VAPID, đặt 4 biến (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`) trên Vercel rồi deploy lại. Hạn mức phân tích/ngày đã có sẵn từ trước.

- Tuần 2 (tăng trưởng): "độ hiểu được của bài" ở màn xem trước và nút chia sẻ một câu thành ảnh (màn Nghe và màn Xem video) đã xong. Chưa xem được ảnh thẻ bằng mắt trong trình duyệt tích hợp (chỉ kiểm tra kích thước 1080×1350); nên mở thử một thẻ.

- Tuần 3 (tăng trưởng): thách đấu không cần cùng lúc, lọc từ tục biệt danh, báo cáo người chơi đã xong ở code. **Chưa chạy được đầu-cuối vì cần migration**: chạy `20261007000001_push_subscriptions.sql` và `20261007000002_challenges.sql` (Supabase SQL Editor). Sau đó `npx vitest run tests/integration` sẽ chạy thêm `challenges.test.ts` (đang tự bỏ qua) và test phân loại bảng gộp tài khoản ở `rooms.test.ts` (đang **đỏ** vì danh sách đã khai báo các bảng mới mà DB chưa có; sẽ xanh sau khi chạy hai migration). Xem báo cáo người chơi: bảng `player_reports` ở Supabase (chưa có trang quản trị).

- Email (chào mừng, tổng kết tuần, nhắc quay lại) đã xong ở code, tự tắt khi thiếu `RESEND_API_KEY`/`EMAIL_FROM`. **Cần tên miền riêng** (vercel.app không xác thực được) rồi xác thực SPF/DKIM trong Resend. Việc của bạn: mua tên miền, tạo tài khoản Resend, thêm tên miền, đặt hai biến, chạy migration `20261007000003_email_prefs.sql`, deploy. Test phân loại bảng gộp tài khoản đang đỏ cho tới khi chạy migration này.

- Tên miền chính: `songhanzi.com` (Namecheap, gắn vào Vercel). Còn lại: đặt tên miền chính (không `www`) làm Production, `NEXT_PUBLIC_SITE_URL`, thêm tên miền vào Supabase Auth và Google OAuth, xác thực Resend. Chi tiết ở runbook mục "Tên miền songhanzi.com".

- Trang Cài đặt chia bốn tab (`components/settings/settings-tabs.tsx`; tab đang mở nằm ở `?tab=account|learning|notifications|tips`): Tài khoản (đăng nhập, biệt danh, quản trị, xóa dữ liệu), Học tập, Thông báo (nhắc đẩy và email), Mẹo. Thêm tùy chọn mới thì đặt vào đúng tab trong `app/(main)/settings/page.tsx`. Test e2e dùng ô ở tab Học tập phải mở `/settings?tab=learning`.

- Level mặc định tài khoản mới là HSK 1 ("chưa biết gì": level N = đã biết HSK 1 đến N−1, mục dưới level bị ẩn; HSK 1 không ẩn gì). `DEFAULT_LEVEL = 1` khớp mặc định cột `user_profiles.level`; migration `20261007000004_user_profile_default_level.sql` đặt tường minh mặc định 1 (nếu đã chạy bản cũ đặt 3 thì chạy lại).

- "Độ hiểu được" tính lại theo cấp HSK từng từ: `loadWordStats` (server, tra từ điển một lượt cho các từ của bài) → `computeComprehension` coi từ có cấp HSK < level là đã hiểu, cộng từ cốt lõi đã đánh dấu đã biết; người mới ở HSK 1 bắt đầu gần 0%. Từ ngoài HSK/không tra được tính là chưa hiểu; lời phồn thể có thể bị tra thiếu nên điểm thấp hơn thực tế.

- Hiệu năng trang giới thiệu (PageSpeed mobile 57 → ~66–78 khi đo local, dao động ±8): (1) font chữ Hán Noto Serif SC không còn là `<link>` chặn vẽ trong `<head>`; `CjkFontLoader` nạp sau hydrate và bỏ hẳn ở "/" (chữ Hán dùng font hệ thống); (2) giảm font tự host (bỏ latin-ext, chữ mảnh 300, Lora nghiêng) từ ~35 xuống ~25 file preload; (3) `app/icon.png` 253 KB → 8 KB, manifest dùng `public/icon-192.png`/`icon-512.png`. Tổng tải trang giới thiệu 2,1 MB → ~0,7 MB. Muốn lên nữa: LCP còn ~5–6 s ở giả lập 4G chậm do tải font; cân nhắc font hệ thống cho thân bài hoặc bỏ italic Be Vietnam Pro.

- Thương hiệu/SEO đã rà một lượt (2026-10-07): ảnh og/twitter của trang giới thiệu cũ còn ghi "Lyric Lab" (ảnh PNG xuất sẵn) nên thay bằng ảnh dựng bằng code `lib/seo/marketing-og-image.tsx` (logo + tên SongHanzi, `app/(marketing)/opengraph-image.tsx` và `twitter-image.tsx`); thêm `app/apple-icon.png` cho iOS; User-Agent gọi LRCLIB và script đổi sang SongHanzi. Các khóa localStorage `lyric-lab-*` GIỮ NGUYÊN (đổi sẽ làm mất dữ liệu người dùng đang có). Sau deploy, mạng xã hội còn giữ ảnh cũ trong cache: dùng Facebook Sharing Debugger (Scrape Again) cho link `songhanzi.com`. Test e2e `streak.spec.ts` đang đỏ từ trước (thẻ chuỗi hiện 0 dù đã chèn điểm luyện tập; cả bản `loadStreak` cũ cũng vậy) và phần chờ tải ảnh đã được sửa thành kiểm tra popup chia sẻ, chưa xác nhận được vì lỗi sớm hơn.

- Admin sửa lời bài hát: có nút sửa ở từng dòng (chữ Hán, pinyin, bản dịch), xem system-architecture. Chưa có xóa/thêm dòng (vd. bỏ dòng ghi công thừa ở cuối bài): làm khi cần, phải đánh lại `index` dòng và các `occurrences` của mục. Test e2e `listen-screen.spec.ts` "chọn cỡ ở Cài đặt" thỉnh thoảng đỏ (chạy lại có khi qua; chưa tìm ra nguyên nhân, nghi tranh chấp lúc chuyển trang ngay sau khi đổi ô chọn).

- Admin thấy báo cáo bài hát trên giao diện (trang `/admin/reports`, dải cảnh báo ở trang bài, huy hiệu). Quy trình: mở bài → sửa lời từng dòng (bút chì) → "Đã xử lý". Bài đã bị ẩn tự động (đủ 3 người báo) vẫn ẩn sau khi xóa báo cáo: bấm "Hiện lại". Báo cáo cấp mục từ vựng (`item_reports`) chưa có giao diện.
