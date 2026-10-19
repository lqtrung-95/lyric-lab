# Dữ liệu nền (đo 2026-10-19 trên DB thật)

## Độ phủ câu thật theo cấp HSK
Kho có **434 video `listed`, 78.725 dòng** đã tách từ. Với mỗi từ HSK trong từ điển (`dict_words`), đếm số dòng video chứa từ đó (một dòng tính một lần):

| Cấp | Số từ | Có ≥1 câu | Có ≥3 câu |
|---|---|---|---|
| HSK 1 | 506 | 97% | 95% |
| HSK 2 | 750 | 93% | 86% |
| HSK 3 | 953 | 89% | 75% |
| HSK 4 | 972 | 83% | 65% |
| HSK 5 | 1059 | 73% | 52% |
| HSK 6 | 1123 | 65% | 41% |
| HSK 7-9 | 5606 | 42% | 19% |

Kết luận: HSK 1-3 đủ dữ liệu để mọi bài có câu thật; HSK 4-6 thiếu dần, cần nạp thêm video (ưu tiên nội dung trình độ cao) hoặc chấp nhận một số từ không có câu ví dụ. Số liệu này tính cả video chưa duyệt kỹ chất lượng, và "dòng chứa từ" chưa lọc dòng quá dài/quá ngắn hay còn nghĩa khác (từ đa nghĩa), nên cần bước chọn câu tốt (xem phase 1).

## Thành phần đã có để tái dùng
- `dict_words` (HSK 1-7, pinyin, nghĩa, tần suất), `dict_hanzi_sino_viet`, `video_lessons.lines` (jsonb: tokens, pinyin, translation, start/end), bài hát (`song_analyses`).
- Thẻ ôn FSRS (`user_cards`, `review_logs`), mục tiêu ngày/chuỗi ngày (`practice_scores` + `daily-goal`), các trò: gõ pinyin, điền lời, ghép cặp, nghe và chọn, karaoke, chép chính tả, luyện nói; giọng đọc Azure; chấm phát âm từng chữ (Azure).
- Màn chủ đã có `TodayPlan` (gợi ý video/bài theo level) và `NextActionPanel` (việc tiếp theo, mục tiêu ngày): phase 6 mở rộng chúng, không viết lại.

## Tập viết chữ Hán
Thư viện Hanzi Writer: mã MIT; dữ liệu nét chữ lấy từ Make Me a Hanzi, theo Arphic Public License. Nguồn tra cứu chưa có nội dung giấy phép để khẳng định dùng thương mại được hay không: phải đọc `ARPHICPL.TXT` trước khi đóng gói. Nguồn: [hanziwriter.org/license](https://hanziwriter.org/license.html), [COPYING](https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/COPYING.md).
