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
- Chọn ngôn ngữ giải nghĩa/dịch (vi/en) (2026-10-02): cache đã sẵn `explainLang` theo key, chỉ đang hardcode "vi". Cần thêm bản prompt tiếng Anh (`build-analysis-prompt.ts`, sentence-explain) + param động thay cho `EXPLAIN_LANG` cứng. Riêng i18n cho UI chrome (nhãn, nút…) để sau — app chưa có i18n framework, effort lớn hơn nhiều, ưu tiên thấp vì đối tượng chính vẫn là người Việt.
- Tra từng chữ thành phần khi cụm nhiều chữ không có trong từ điển (popover tra từ).
- Dịch tên bài sang tiếng Việt (cần đổi prompt → bump `PROMPT_VERSION`).
- Đo và chỉnh độ lệch timestamp LRC (offset ±0,5 s) sau khi nghe kiểm tra.
- Tối ưu tham số FSRS theo từng người khi đủ log ôn tập.
- Tách bước phân tích LLM khỏi route `/api/analyze` thành job nền (Inngest/Trigger.dev, đã định hướng trong CLAUDE.md) để không bị trần 60s của Vercel Hobby chia sẻ với bước lấy lời (2026-10-02). Effort ước 1-2 ngày MVP (pipeline `analyzeVideo` đã decoupled khỏi HTTP, gần như dùng lại nguyên), 3-4 ngày nếu làm kỹ test/observability; phần tốn công nhất là đổi client từ đọc SSE trong 1 request sang polling/subscribe trạng thái job, và cơ chế chống trùng lặp (`inFlight` hiện tại) phải thay bằng concurrency control của provider. Đánh đổi: thêm 1 hạ tầng phải quản lý, UX mất cảm giác real-time liền mạch. Chưa đáng làm ngay — nguyên nhân cạn hạn mức Groq hôm nay là do chạy batch backfill 113 bài liên tục (việc một lần), không phải tải thật hằng ngày; làm khi có tín hiệu lỗi timeout thật từ production.
- Nâng Groq lên gói trả phí (thay thế/bổ sung cho mục trên).
