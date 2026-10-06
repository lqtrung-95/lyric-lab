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

## Việc dở / quyết định đang treo

- **Biệt danh và ảnh đại diện**: một biệt danh và một ảnh đại diện dùng chung cho phòng thi đấu và bảng xếp hạng (xem `docs/system-architecture.md` mục "Biệt danh dùng chung"); đặt tên không tự công khai điểm.
- **Thi đấu: lưu từ và lịch sử**: màn kết quả có nút lưu từng từ và "Lưu các từ trả lời sai" (cùng kho thẻ với màn Nghe); lịch sử ở `/room/history` (50 ván gần nhất, bấm vào xem lại từng câu). Pinyin trong câu hỏi hiện ngay trên từng chữ Hán. Không cần migration. Chưa phân trang lịch sử, chưa dọn ván cũ.
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

- Prompt v6 (20–25 từ vựng, dịch thoát ý, quy tắc xưng hô); DeepSeek trực tiếp + BytePlus cho giải nghĩa khi bấm.
- Script `reanalyze-songs.mts`, `reanalyze-reuse-old-lyrics.mts`, `backfill-pinyin.mts`.
- Logo ảnh thật (sáng/tối), tab Thư viện có URL riêng (`?tab=`), tự cuộn theo câu hát khi không ghim, sửa pinyin 读, bỏ hạn mức phân tích/ngày khi chạy `next dev`.

## Liên hệ / quyền truy cập cần có

Người tiếp quản cần được cấp: repo GitHub, project Vercel, project Supabase, khóa API (Groq ×2, DeepSeek, BytePlus ModelArk, OpenRouter, YouTube Data API, Azure Speech tùy chọn), Sentry. Không có khóa nào được lưu trong repo; xem [`operations-runbook.md`](operations-runbook.md).
