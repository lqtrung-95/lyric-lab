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

## Ý tưởng tăng hứng thú / giữ chân người dùng (brainstorm 2026-10-04)
Xếp theo tỉ lệ hiệu quả/công sức. Chưa quyết định làm; mục tiêu ưu tiên (giữ chân hay kéo người mới) cần chốt trước.

| Ý tưởng | Mô tả | Effort | Ghi chú |
|---|---|---|---|
| Độ "hiểu được" của bài | Mỗi bài hiện "bạn hiểu X% bài này" từ từ đã biết; mục tiêu kiểu "học 12 từ nữa để hiểu 80%" | Nhỏ-vừa | Dữ liệu gần như sẵn (`user_known_terms`). Ưu tiên cao nhất |
| Thẻ chia sẻ câu hát | Chọn 1 dòng lời, tạo ảnh (chữ Hán, pinyin, nghĩa Việt) để đăng mạng xã hội | Nhỏ-vừa | Tái dùng hạ tầng banner chia sẻ streak. Cân nhắc quy tắc bản quyền lời bài hát (chỉ 1 dòng, không công khai index) |
| Thử thách hằng ngày + nhắc học | "Song of the Day" kèm 5 từ và mini-game 2 phút, tính vào streak; nhắc bằng email/web push | Vừa | Nhắc học cần dịch vụ ngoài (đã có trong mục Stitch ở trên) |
| Gợi ý bài tiếp theo | Đề xuất bài chứa nhiều từ vừa học hoặc sắp quên (theo FSRS) | Vừa | Cần dữ liệu từ vựng từng bài, đã có |
| Ẩn dần pinyin/dịch khi nghe lại | Mỗi lần nghe lại ẩn thêm 1 lớp (dịch → pinyin → chỉ chữ Hán) để tự kiểm tra | Nhỏ | |
| Từ điển cá nhân qua bài hát | Từ đã lưu hiện lại các câu hát nó từng xuất hiện | Nhỏ-vừa | |
| Giải đấu theo tuần theo level | Bảng xếp hạng đóng mùa, nhóm theo level | Vừa | Hiện đã có bảng xếp hạng chung |
| Thách đấu bạn bè | Gửi link cùng bài/cùng bộ câu hỏi | Vừa | |
| Shadowing / hát theo (RV-05) | STT chấm độ giống pinyin/thanh điệu theo từng chữ | Lớn | "Wow" nhất nhưng đắt; STT tiếng Trung cần chọn dịch vụ. Để sau khi có đủ người dùng |
| Giải nghĩa văn hoá/điển tích mỗi bài | Phần "câu chuyện sau lời hát" (thành ngữ, tiếng lóng) | Vừa | Rủi ro LLM bịa; cần cách kiểm chứng |
| Xuất Anki | Đã nêu ở trên | Nhỏ | |
| Danh sách bài theo chủ đề, lớp học cùng nhau, PWA, giải thích tiếng Anh | Xem các mục liên quan ở trên và phần Kỹ thuật | Vừa-lớn | |

## Kỹ thuật
- [Đã sửa 2026-10-02] Dịch lời đổi qua lại giữa "tớ/tôi/mình" trong cùng 1 bài (vd. "Tớ thích cậu" rồi "Tôi không thích cậu"). Thêm quy tắc trong `build-analysis-prompt.ts`: chọn đúng 1 cặp xưng hô theo giọng điệu bài hát rồi dùng thống nhất cho mọi dòng. Bump `PROMPT_VERSION` v3 → v4.
- Chọn ngôn ngữ giải nghĩa/dịch (vi/en) (2026-10-02): cache đã sẵn `explainLang` theo key, chỉ đang hardcode "vi". Cần thêm bản prompt tiếng Anh (`build-analysis-prompt.ts`, sentence-explain) + param động thay cho `EXPLAIN_LANG` cứng. Riêng i18n cho UI chrome (nhãn, nút…) để sau — app chưa có i18n framework, effort lớn hơn nhiều, ưu tiên thấp vì đối tượng chính vẫn là người Việt.
- Tra từng chữ thành phần khi cụm nhiều chữ không có trong từ điển (popover tra từ).
- Dịch tên bài sang tiếng Việt (cần đổi prompt → bump `PROMPT_VERSION`).
- Đo và chỉnh độ lệch timestamp LRC (offset ±0,5 s) sau khi nghe kiểm tra.
- Tối ưu tham số FSRS theo từng người khi đủ log ôn tập.
- Tách bước phân tích LLM khỏi route `/api/analyze` thành job nền (Inngest/Trigger.dev, đã định hướng trong CLAUDE.md) để không bị trần 60s của Vercel Hobby chia sẻ với bước lấy lời (2026-10-02). Effort ước 1-2 ngày MVP (pipeline `analyzeVideo` đã decoupled khỏi HTTP, gần như dùng lại nguyên), 3-4 ngày nếu làm kỹ test/observability; phần tốn công nhất là đổi client từ đọc SSE trong 1 request sang polling/subscribe trạng thái job, và cơ chế chống trùng lặp (`inFlight` hiện tại) phải thay bằng concurrency control của provider. Đánh đổi: thêm 1 hạ tầng phải quản lý, UX mất cảm giác real-time liền mạch. Chưa đáng làm ngay — nguyên nhân cạn hạn mức Groq hôm nay là do chạy batch backfill 113 bài liên tục (việc một lần), không phải tải thật hằng ngày; làm khi có tín hiệu lỗi timeout thật từ production.
- Nâng Groq lên gói trả phí (thay thế/bổ sung cho mục trên).
