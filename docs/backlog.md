# Backlog

Các tính năng đã cân nhắc và **chủ động hoãn** (không thuộc MVP). Ghi ngày và lý do để khỏi quyết định lại từ đầu.

## Từ thiết kế Stitch, cắt khỏi M3 (2026-09-25)
| Tính năng | Ghi chú |
|---|---|
| Chọn "sở thích giai điệu" ở onboarding | Chưa có thuật toán nào dùng; làm khi có gợi ý bài hát |
| Nhắc học hằng ngày (giờ, trích dẫn thi ca) | Cần thông báo đẩy/email |
| Xuất CSV cho Anki (PRD RV-06, P2) | File `.apkg`/CSV các thẻ đã lưu |
| Sao lưu/đồng bộ Google Drive | Dữ liệu đã ở Supabase; chỉ cần nếu có yêu cầu xuất |
| Cỡ chữ phụ đề (20/24/28 px) | Thêm vào tùy chọn màn Nghe |
| Hạ âm lượng còn 30% khi mở thẻ tra từ | Có thể làm bằng `setVolume` của YouTube player |
| Chuỗi ngày học (streak) | PRD: v1.1 |
| Chấm level bằng bài kiểm tra 2 phút | PRD S2 nhắc tới |

## Từ PRD (P2 / sau MVP)
Luyện điền từ khi nghe (RV-04), shadowing (RV-05), speech-to-text qua extension (IN-06), karaoke theo từng từ (LS-11), tiếng Hàn/Nhật/Anh, PWA cài được.

## Kỹ thuật
- Tra từng chữ thành phần khi cụm nhiều chữ không có trong từ điển (popover tra từ).
- Dịch tên bài sang tiếng Việt (cần đổi prompt → bump `PROMPT_VERSION`).
- Đo và chỉnh độ lệch timestamp LRC (offset ±0,5 s) sau khi nghe kiểm tra.
- Tối ưu tham số FSRS theo từng người khi đủ log ôn tập.
- Nâng Groq lên gói trả phí hoặc hàng đợi phân tích.
