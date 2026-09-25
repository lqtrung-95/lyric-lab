# M0 — Spike nguồn lời cho 50 bài C-pop (kết quả)

Ngày: 2026-09-25 · Chạy từ IP nhà và từ Vercel (iad1).

## Phương pháp
- 50 bài (5 nhóm, chỉ tiếng Phổ thông), danh sách `scripts/caption-spike/cpop-sample-songs.json`. 454 video ứng viên (3 từ `search.list` + ~7 từ tìm "歌词" cho 41 bài chưa dùng được).
- "Dùng được" (chốt trước khi chạy): track tiếng Trung do người đăng, ≥ 60% dòng là chữ Hán, độ phủ thời gian ≥ 50% video. Đối chiếu độc lập bằng yt-dlp (khớp 104/104).
- LRCLIB: `search?q=<bài> <nghệ sĩ>`, chọn kết quả có lời đồng bộ, khớp tên bài; đo chữ Hán và độ lệch độ dài với video ứng viên.
- Version: youtubei.js 18.1, yt-dlp 2026.08.19.

## Kết quả
| Nguồn | Mức bài dùng được |
|---|---|
| Caption YouTube | 12/50 (24%), trần 32% (4 video còn bị 429) |
| LRCLIB (khớp tên bài, chữ Hán đạt) | 43/50 (86%) |
| LRCLIB + độ dài lệch ≤ 10s với video | 39/50 (78%) |

Caption theo nhóm: OST 5/10, Douyin 3/10, Đại lục 3/12, Đài Loan 1/12, band/indie 0/6. MV chính thức chỉ 3/55 video có caption dùng được.

## Phát hiện kỹ thuật
- InnerTube client WEB trả UNPLAYABLE; ANDROID/IOS liệt kê được track.
- Track `zh` có thể là pinyin Latin (11 video) → bắt buộc kiểm tra chữ Hán, không tin mã ngôn ngữ.
- Tải nội dung caption bị HTTP 429 sau ~100 request/10 phút (cả yt-dlp); liệt kê track vẫn chạy.
- Không có track tự động tiếng Trung đáng kể → STT không được "cứu" bằng caption tự động.
- STT không khả thi cho MVP: quy tắc 5 + trình duyệt không lấy được audio iframe YouTube.

## Khuyến nghị
1. Nguồn lời chính của MVP: **caption YouTube (khi có) → LRCLIB**. Bỏ giả định "MVP chỉ video có caption".
2. Rủi ro pháp lý của LRCLIB là quyết định của user; giảm thiểu ở `plans/260925-1004-lyrics-source-strategy-after-m0/plan.md`.
3. M1 cần: chọn bản LRCLIB theo độ dài video, offset thời gian, xử lý phồn thể (bài Đài Loan chủ yếu phồn thể).

## Kết quả từ IP cloud (Vercel, vùng iad1, route `/api/debug/caption-probe`)
| Nguồn | Kết quả từ Vercel |
|---|---|
| Caption YouTube | **Bị chặn 6/6 video**: InnerTube trả `LOGIN_REQUIRED — Sign in to confirm you're not a bot` ngay ở bước liệt kê track (~250 ms), kể cả video mà máy nhà lấy được caption |
| LRCLIB | Ổn định 6/6: 20 kết quả, cả 20 có lời đồng bộ, ~150 ms |
| Phân tích đầu-cuối trên Vercel | 4/4 bài mới xong sau 9–12 giây, cả 4 dùng lời LRCLIB |

Kết luận: **trên production, LRCLIB là nguồn lời duy nhất thực tế**; caption YouTube chỉ dùng được từ IP dân cư (máy nhà) và không thể là nguồn dự phòng trên cloud nếu không có proxy/PO token. Provider caption vẫn được thử trước (tốn ~250 ms rồi rơi sang LRCLIB) và được giữ lại vì rẻ và có thể chạy được ở môi trường khác; nếu cần giảm độ trễ có thể đảo thứ tự hoặc tắt bằng cờ môi trường.

## Việc còn lại của M0
- Chạy lại 4 video bị 429 trên máy nhà: bỏ qua (không còn ảnh hưởng quyết định vì caption không dùng được trên cloud).
- Tắt route thăm dò sau khi dùng xong: xóa biến `CAPTION_PROBE_SECRET` trên Vercel (route tự trả 404).

## Câu hỏi mở
- Mức lệch timestamp thực tế của LRC so với video (chưa đo; cần kiểm tra tay 10 bài).
- LRCLIB có giới hạn tốc độ / điều khoản dùng cho ứng dụng công khai không? (chưa tìm hiểu)
