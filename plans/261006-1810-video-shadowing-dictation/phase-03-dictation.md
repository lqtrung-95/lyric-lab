# Giai đoạn 3: Chép chính tả

## Context
- [plan.md](plan.md). Tái dùng `lib/practice/pinyin-answer.ts`, đoạn nghe một dòng (`SnippetPlayer`/`room-clip-player`).

## Tổng quan
Chưa làm. Nghe một câu (lặp được), gõ lại, hệ thống so từng chữ và hiện đáp án kèm nghĩa.

## Yêu cầu
- Chế độ gõ: pinyin (có hoặc không dấu thanh) hoặc chữ Hán; chọn trong cài đặt chế độ.
- Hàm thuần `compareDictation(typed, expected, mode)` trả về từng chữ đúng/sai/thiếu; có test đầy đủ (dấu thanh, khoảng trắng, dấu câu).
- Luồng: nghe câu (tối đa N lượt, có chậm 0.75x), gõ, kiểm tra, xem đáp án và nghĩa, sang câu kế; hiện tổng kết cuối bài và nút lưu từ sai.
- Tiến độ lưu trong trình duyệt (chưa có bảng người dùng).

## Todo
- [x] `compareDictation` + test
- [x] Màn chép chính tả
- [x] Tổng kết (câu nên xem lại); lưu hàng loạt từ sai **hoãn**: lưu từng từ ở màn xem là đủ cho bản đầu
- [x] E2E

## Tiêu chí hoàn thành
Chép được một video từ đầu tới cuối, thấy sai từng chữ, lưu được các từ sai.

## Rủi ro
Chữ Hán đồng âm (so khớp theo chữ khắt khe hơn pinyin): mặc định pinyin, chữ Hán là tùy chọn khó.
