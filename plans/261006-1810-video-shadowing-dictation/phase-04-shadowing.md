# Giai đoạn 4: Shadowing

## Context
- [plan.md](plan.md). Tái dùng `components/listen/use-line-recorder.ts` và `line-practice-card.tsx` (Nghe, Nghĩ, Nói, Nghe lại).

## Tổng quan
Chưa làm. Lặp từng câu, ẩn chữ, người học nói theo rồi tự nghe lại so với bản gốc. Ghi âm chỉ lưu tạm trong trình duyệt, không gửi lên server.

## Yêu cầu
- Chuyển `LinePracticeCard` thành dùng chung cho cả bài hát và video (nhận dòng với kiểu chung thay vì `AnalyzedLine`).
- Tùy chọn ẩn chữ Hán/pinyin/dịch để buộc nghe; tốc độ 0.75x, 1x.
- Chấm tự động bằng nhận dạng giọng nói: **ngoài phạm vi** (xem backlog); chỉ tự chấm.

## Todo
- [ ] Tách kiểu dòng dùng chung
- [ ] Màn shadowing cho video
- [ ] E2E (micro giả của Playwright)

## Tiêu chí hoàn thành
Luyện được một video theo từng câu và nghe lại giọng mình; bài hát vẫn dùng được thẻ luyện như cũ.

## Rủi ro
Micro bị từ chối hoặc trình duyệt không hỗ trợ: đã có trạng thái `denied`/`unsupported`.
