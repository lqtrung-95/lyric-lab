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

## Phòng thi đấu 1v1: giai đoạn 2 của dự án (2026-10-05)
Giai đoạn 1–5 (mời bạn bằng mã/link, ván 10 câu Điền lời, kết quả) đã xong. Còn hoãn:
- Ghép ngẫu nhiên (hàng đợi theo trình độ + "bóng ma" là bản ghi lượt chơi khi không có ai online, vì hiện số người dùng quá ít để hàng đợi có người).
- Lời mời đang chờ (Chấp nhận/Từ chối, hết hạn ~10 phút), "Bạn luyện cùng gần đây" (suy ra từ `room_players`, chỉ hiện với người đã đăng nhập Google), thành tích đối đầu theo từng đối thủ và "Mời tái đấu". (Lịch sử ván và thống kê thắng/thua tổng đã có ở `/room/history`; còn thiếu phân trang và quy tắc giữ ván cũ.)
- Thêm chế độ chơi (Nghe và chọn, Ghép cặp, Gõ pinyin), phản ứng emoji sau ván, nút "Đổi bài" ở phòng chờ.
- An toàn khi chơi với người lạ: báo cáo người chơi và lọc từ tục biệt danh đã có (2026-10-07); còn thiếu chặn người chơi và trang quản trị xem báo cáo (làm khi mở ghép ngẫu nhiên).
- Dọn phòng cũ (`rooms` đã kết thúc tích lũy theo thời gian).
- Chọn bài ngẫu nhiên theo trình độ của cả hai người (hiện chọn trong bài Khám phá dựng được đủ câu).

## Ý tưởng game đối kháng mới (brainstorm 2026-10-06)
Khung phòng hiện có (máy trạng thái SQL, Realtime, chấm điểm ở server) dùng lại được; mỗi game chỉ thêm một dạng câu hỏi hoặc luật. Chưa quyết định làm; thứ tự đề xuất ở cuối mục.

| Game | Cách chơi | Effort | Ghi chú |
|---|---|---|---|
| Nghe và chọn | Nghe đoạn 3–5 giây, chọn dòng lời hoặc nghĩa đúng | Nhỏ | Đã có video đoạn (`room-clip-player`) và 4 đáp án |
| Hán-Việt đoán chữ | Hiện âm Hán-Việt, chọn chữ Hán đúng (vd. "ái tình" → 爱情) | Nhỏ | Hợp người Việt, ít app có; dữ liệu Hán-Việt đã có trong từ vựng |
| Chọn thanh điệu | Hiện pinyin không dấu, chọn đúng thanh | Nhỏ | Thanh điệu là chỗ người Việt hay sai |
| Đua ghép cặp | Cùng 6 cặp chữ Hán–nghĩa, ai ghép xong trước hoặc ít lỗi hơn thắng | Nhỏ-vừa | Tái dùng `lib/practice/match-round.ts` |
| Đua gõ pinyin | Cùng một từ, ai gõ đúng nhanh hơn | Nhỏ-vừa | Tái dùng `lib/practice/pinyin-answer.ts` |
| Sắp xếp lời | Dòng lời bị xáo từ, ai sắp lại đúng thứ tự nhanh hơn | Vừa | Luyện trật tự từ và ngữ pháp |
| Sinh tồn 3 mạng | Sai là mất mạng, ai hết mạng trước thì thua | Vừa | Số câu không cố định, cần đổi điều kiện kết thúc ván |
| Tam quốc (best-of-3) | Ba vòng, mỗi vòng một chế độ khác nhau, thắng 2 là thắng chung cuộc | Vừa | Làm sau khi có ít nhất 2–3 chế độ |
| Rung chuông | Ai bấm trước giành quyền trả lời, sai bị trừ điểm | Vừa-lớn | Server phải phân xử độ trễ giữa hai máy |
| Đua điền chữ khi nghe | Lời đang chạy, ai gõ đúng chữ tiếp theo trước thì ăn điểm | Lớn | Nối với RV-04 trong PRD |

Hai hướng đổi cách chơi (không phải game mới):
- **Thách đấu không cần cùng lúc (ưu tiên):** chơi một bộ câu cố định theo seed, gửi link, bạn chơi sau rồi so điểm. Giải quyết việc ít người online cùng lúc, và là nền cho "bóng ma" của ghép ngẫu nhiên (đã nêu ở mục phòng thi đấu).
- **Phòng 3–8 người kiểu Kahoot:** hợp lớp học hoặc nhóm bạn; cần xem lại giới hạn Realtime của gói Free (200 kết nối, 100 tin/giây) và cách chia cặp, để sau.

Thứ tự đề xuất: (1) Nghe và chọn, (2) Hán-Việt đoán chữ, (3) Thách đấu không cần cùng lúc, (4) Tam quốc khi đã có ≥ 3 chế độ.

Xếp hạng cho thi đấu: điểm thi đấu hiện **không** vào `practice_scores`/bảng xếp hạng (chủ động, vì hai người hẹn nhau đấu liên tục có thể cày điểm). Nếu cần, làm bảng riêng "Đấu trường" tính số trận thắng hoặc Elo, và tính ván thắng vào chuỗi ngày học.

## Kế hoạch tăng trưởng 3 tháng (2026-10-07)
**Mục tiêu đã chốt:** có nhiều người dùng trước, kiếm tiền tính sau. App là **sản phẩm độc lập** (kênh ChineseGlow chỉ là một kênh kéo người, không phải mục đích). Ngân sách Vercel Pro / Groq trả phí: sẵn sàng khi cần, chưa cam kết.
**Chưa đại trà trước khi xong 3 thứ:** (1) nhắc học, (2) giới hạn chi phí LLM + gói hạ tầng đúng (Vercel Hobby cấm dùng thương mại), (3) báo cáo/chặn người chơi trong phòng thi đấu.

| Tuần | Việc | Mục đích |
|---|---|---|
| 1 | Nhắc học (email hoặc web push); giới hạn số bài mới phân tích/người/ngày; rà hạn mức Vercel, Supabase, Groq | Giữ chân, an toàn chi phí |
| 2 | "Độ hiểu được của bài" (X% bài, học N từ nữa để hiểu 80%); thẻ chia sẻ một câu hát (chỉ một dòng) | Động lực học, chất liệu để lan |
| 3 | Thách đấu không cần cùng lúc (link + bộ câu cố định theo seed); báo cáo/chặn, lọc từ tục tên hiển thị | Viral, an toàn xã hội |
| 4 | Mở cho ~100 người đầu (nhóm Facebook học tiếng Trung, người xem kênh), đo rồi sửa; duyệt video draft và mở tab Video | Kiểm chứng trước khi đẩy |

**Số cần đo:** tỷ lệ quay lại sau 7 ngày; tỷ lệ hoàn thành bài nghe đầu tiên; số người mở link chia sẻ rồi học được một bài. Chỉ mở rộng khi hai số đầu đủ tốt.
**Kênh:** nhóm Facebook học tiếng Trung và fan C-pop/C-drama (bài hữu ích thật, không quảng cáo trần); video ngắn quay màn hình học một bài hát nổi tiếng; kênh ChineseGlow (link trong mô tả); creator tiếng Trung nhỏ. Không mua traffic sớm, không làm trang công khai chứa lời để SEO (giữ `noindex`, một dòng lời cho thẻ chia sẻ).
**Để sau:** bài kiểm tra level 2 phút, xuất Anki, ghép ngẫu nhiên thi đấu, extension trình duyệt, kiếm tiền.

## Đa ngôn ngữ (i18n) để nhắm người dùng quốc tế (2026-10-07)
**Quyết định: hoãn.** Chưa làm cho tới khi có số liệu từ nhóm ~100 người dùng Việt đầu tiên (tỷ lệ quay lại sau 7 ngày, tỷ lệ hoàn thành bài đầu tiên).
- **Lý do hoãn:** thế mạnh hiện tại là người Việt (âm Hán-Việt, giải nghĩa tiếng Việt, kênh Facebook/Zalo); sang thị trường tiếng Anh mất lợi thế Hán-Việt và đứng cạnh các sản phẩm đã có người dùng. Chi phí: app chưa có khung i18n (chữ tiếng Việt nằm rải ở component, lỗi, email, thẻ chia sẻ) và mỗi tính năng sau này phải duy trì hai ngôn ngữ; phân tích bài bằng LLM phải chạy lại cho mỗi ngôn ngữ giải nghĩa (cache đã khóa theo `explainLang`) nên tốn gần gấp đôi lượt gọi LLM và hạn mức Groq; cần kênh, trang giới thiệu, SEO và hỗ trợ bằng tiếng Anh.
- **Khi nào xét lại:** tỷ lệ quay lại và hoàn thành bài ở người Việt đã tốt; hoặc có người nước ngoài tự tìm đến và dùng thật; hoặc thị trường người Việt đã chạm trần so với mục tiêu.
- **Cách thử rẻ trước khi đầu tư (nếu muốn):** (1) trang giới thiệu tiếng Anh `/en` kèm form để lại email, quảng bá thử ở vài cộng đồng học tiếng Trung quốc tế rồi đếm đăng ký; (2) tùy chọn giải nghĩa tiếng Anh cho bài hát (giữ giao diện tiếng Việt), cần bản prompt tiếng Anh thay `EXPLAIN_LANG` cứng (xem mục Kỹ thuật).
- **Nếu làm đầy đủ:** dùng khung có sẵn cho Next.js (ví dụ `next-intl`), dịch dần từng màn (trang giới thiệu và màn học chính trước), không dịch cả app một lúc.

## Kỹ thuật
- [Đã sửa 2026-10-02] Dịch lời đổi qua lại giữa "tớ/tôi/mình" trong cùng 1 bài (vd. "Tớ thích cậu" rồi "Tôi không thích cậu"). Thêm quy tắc trong `build-analysis-prompt.ts`: chọn đúng 1 cặp xưng hô theo giọng điệu bài hát rồi dùng thống nhất cho mọi dòng. Bump `PROMPT_VERSION` v3 → v4.
- Chọn ngôn ngữ giải nghĩa/dịch (vi/en) (2026-10-02): cache đã sẵn `explainLang` theo key, chỉ đang hardcode "vi". Cần thêm bản prompt tiếng Anh (`build-analysis-prompt.ts`, sentence-explain) + param động thay cho `EXPLAIN_LANG` cứng. Riêng i18n cho UI chrome (nhãn, nút…) để sau — app chưa có i18n framework, effort lớn hơn nhiều, ưu tiên thấp vì đối tượng chính vẫn là người Việt.
- Tra từng chữ thành phần khi cụm nhiều chữ không có trong từ điển (popover tra từ).
- Dịch tên bài sang tiếng Việt (cần đổi prompt → bump `PROMPT_VERSION`).
- Đo và chỉnh độ lệch timestamp LRC (offset ±0,5 s) sau khi nghe kiểm tra.
- Tối ưu tham số FSRS theo từng người khi đủ log ôn tập.
- Tách bước phân tích LLM khỏi route `/api/analyze` thành job nền (Inngest/Trigger.dev, đã định hướng trong CLAUDE.md) để không bị trần 60s của Vercel Hobby chia sẻ với bước lấy lời (2026-10-02). Effort ước 1-2 ngày MVP (pipeline `analyzeVideo` đã decoupled khỏi HTTP, gần như dùng lại nguyên), 3-4 ngày nếu làm kỹ test/observability; phần tốn công nhất là đổi client từ đọc SSE trong 1 request sang polling/subscribe trạng thái job, và cơ chế chống trùng lặp (`inFlight` hiện tại) phải thay bằng concurrency control của provider. Đánh đổi: thêm 1 hạ tầng phải quản lý, UX mất cảm giác real-time liền mạch. Chưa đáng làm ngay — nguyên nhân cạn hạn mức Groq hôm nay là do chạy batch backfill 113 bài liên tục (việc một lần), không phải tải thật hằng ngày; làm khi có tín hiệu lỗi timeout thật từ production.
- Nâng Groq lên gói trả phí (thay thế/bổ sung cho mục trên).
