# Kế hoạch: Video luyện nghe (chép chính tả và shadowing)

Chức năng mới, **tách khỏi bài hát**: kho video tiếng Trung do admin tuyển chọn (hoạt hình, podcast, vlog), mỗi video có bản chép từng câu kèm pinyin và nghĩa tiếng Việt để người dùng luyện **chép chính tả** và **shadowing**. Chưa code; chờ duyệt kế hoạch.

## Quyết định đã chốt (chủ dự án, 2026-10-06)
| Mục | Quyết định |
|---|---|
| Quan hệ với bài hát | Chức năng riêng, không đụng pipeline phân tích bài hát |
| Nguồn video | Chỉ admin tuyển chọn (kênh/playlist, kèm cờ "có phụ đề tiếng Trung do người làm"); **người dùng không dán link được** |
| Lấy dữ liệu | Ta tự crawl bằng script, ghi thẳng vào DB (không crawl lúc người dùng mở) |
| Phụ đề | Dùng sẵn phụ đề YouTube; chưa có phụ đề tiếng Việt thì AI dịch |
| Phân tích | **Không** phân tích câu, ngữ pháp, chọn từ vựng. Chỉ phân tích **khi người dùng bấm vào một từ** (tái dùng tra từ + nghĩa theo ngữ cảnh đang có) |
| Hai chế độ | Chép chính tả, Shadowing |

## Tái dùng được (đã kiểm tra trong code)
- Tải phụ đề: `lib/captions` (`CaptionProvider`, track `manual`/`asr`).
- Bấm từ: `/api/lookup` (từ điển), `/api/explain` (nghĩa theo ngữ cảnh, có hạn mức), `components/listen/word-popover.tsx`, `use-term-lookup.ts`; lưu thẻ qua `useLearnerState().toggleSaved` (`SavedItem` đã có `videoId`, `lineIndex`, `start`).
- Chia từ, pinyin, Hán-Việt, level HSK: từ điển và jieba (không cần LLM).
- Shadowing: `use-line-recorder.ts`, `line-practice-card.tsx` (Nghe, Nghĩ, Nói, Nghe lại, tự chấm).
- Chép chính tả: `lib/practice/pinyin-answer.ts`.
- Dịch: `lib/analysis/fill-translations.ts`.

## Giai đoạn
| # | Nội dung | Trạng thái |
|---|---|---|
| 1 | [Dữ liệu và script crawl](phase-01-data-and-ingest.md) | Code xong, chờ chạy migration và nạp |
| 2 | [Duyệt, xem video, bấm từ lưu thẻ](phase-02-browse-watch-lookup.md) | Code xong (chờ có dữ liệu thật) |
| 3 | [Chép chính tả](phase-03-dictation.md) | Code xong |
| 4 | [Shadowing](phase-04-shadowing.md) | Chưa làm |
| 5 | [Quản trị nguồn và dọn dẹp](phase-05-admin-curation.md) | Chưa làm |

## Rủi ro chính và cách giảm
- **Bản quyền/YouTube:** lưu bản chép của video bên thứ ba trong DB mà người dùng đọc được. Giảm: tuyển nguồn kỹ (ưu tiên video giấy phép Creative Commons hoặc xin phép kênh), chỉ nhúng player YouTube, trang `noindex`, có link về video gốc, admin ẩn/xóa video ngay khi có yêu cầu gỡ. Mức rủi ro còn lại do chủ dự án chấp nhận (không phải tư vấn pháp lý).
- **Phụ đề tự động kém:** chỉ nhận video có track `manual` tiếng Trung; script từ chối video chỉ có `asr`.
- **Chi phí dịch AI:** chỉ khi không có phụ đề tiếng Việt, chạy ở script (không dính trần 60s của Vercel), lưu nguồn dịch để rà lại.
- **Bị chặn khi crawl:** script chạy ở máy admin, có độ trễ giữa các video, chạy lặp được (bỏ video đã có).

## Quy tắc dự án cần giữ
Chỉ nhúng player, không tải/lưu video; trang `noindex`; khóa API chỉ ở server; test và fixture chỉ dùng dữ liệu hư cấu; bảng mới có `user_id` phải vào `merge_user_data` (hiện kế hoạch không thêm bảng như vậy); cập nhật bốn tài liệu bàn giao cùng commit.

## Kết quả khảo sát nguồn (2026-10-06, đo bằng YouTube Data API và trình tải phụ đề của app)
- **DaihuaXiyou 呆話西遊: không dùng được theo cách "dùng sẵn phụ đề YouTube".** Trong 50 video gần nhất, 44 video không có phụ đề nào, 6 video chỉ có tiếng Anh; không video nào có phụ đề tiếng Trung. Giấy phép là giấy phép YouTube chuẩn. Ứng dụng tham khảo có lẽ tự chép lời (nhận dạng giọng nói), việc này cần tải audio, trái quy tắc dự án.
- **Nguồn khả thi: video giấy phép Creative Commons có phụ đề tiếng Trung do người làm.** Tìm theo bộ lọc giấy phép CC và có phụ đề, nhiều kết quả có `zh/manual` (hội thoại học tiếng, phỏng vấn, podcast, phim tài liệu). Ví dụ kênh "Mandarin listening" (34 video, 26/30 video gần nhất giấy phép CC, 8/30 có phụ đề tiếng Trung thủ công; mẫu một video: 354 dòng, mỗi dòng trung bình khoảng 5 giây và 10 chữ, rất hợp chép chính tả). Chỉ một phần video có phụ đề nên script phải lọc.
- Giấy phép CC của YouTube là CC BY: được dùng lại và tạo bản phái sinh nếu ghi nguồn; vẫn cần ghi nguồn và link về video gốc, và chưa chắc phụ đề do chủ video tự tải lên nằm trong phạm vi giấy phép (nên xin phép chủ kênh nếu được).
- Hướng khác: xin phép DaihuaXiyou (kèm xin file phụ đề). Phương án nhận dạng giọng nói trên audio bị loại vì cần tải audio.

## Nguồn đầu tiên: kênh của chủ dự án (@ChineseGlow, đo 2026-10-06)
- 33 video, đều nhúng được. **12 video dài (7–25 phút) có đủ phụ đề thủ công `zh-Hans` + `vi` + `en`**; 21 video 56 giây (shorts) không có phụ đề nên bỏ qua. Giấy phép là giấy phép YouTube chuẩn nhưng kênh là của chủ dự án nên không có vướng bản quyền.
- Có sẵn bản tiếng Việt do người làm, nên **bản đầu không cần AI dịch** (giữ đường dịch AI cho nguồn sau). Chữ Giản thể, hợp từ điển và pinyin của app.
- Script ghép dòng tiếng Việt với dòng tiếng Trung theo thời gian (hai track cùng mốc); dòng nào không khớp được thì để trống và đánh dấu để admin rà.

## Quyết định bổ sung (chủ dự án giao quyền chọn)
- Menu: mục riêng **"Video"** (chức năng khác bài hát; thanh điều hướng thành 5 mục, vừa đủ cho điện thoại).
- Tiến độ chép chính tả: **lưu trong trình duyệt** ở bản đầu, không thêm bảng người dùng.
- Nguồn đầu tiên: **@ChineseGlow**. DaihuaXiyou không dùng được (không có phụ đề tiếng Trung). Nguồn video CC (ví dụ "Mandarin listening") là hướng mở rộng sau, cần xử lý chữ Phồn thể nếu gặp.

## Câu hỏi còn mở
1. Duyệt bắt đầu giai đoạn 1 với @ChineseGlow?
2. Kênh còn tăng video: script chạy lại được (bỏ video đã có), thêm video mới bằng cách chạy lại; bạn thấy đủ hay muốn tự động hóa sau?
