---
title: Chế độ luyện tập dạng game cho màn Ôn tập (Gõ pinyin, Điền lời, Ghép cặp)
status: 3 chế độ đầu đã code xong (2026-09-27); chờ user thử tay
created: 2026-09-27
refs: docs/PRD.md §6.4 (RV-04 luyện điền từ), docs/backlog.md
---

# Chế độ luyện tập

## Quyết định (theo đề xuất đã trình bày, user chốt "làm 3 chế độ đầu")
- 3 chế độ: **Gõ pinyin**, **Điền lời**, **Ghép cặp**. Route: `/review/pinyin`, `/review/cloze`, `/review/match`; `/review` giữ nguyên là ôn thẻ chuẩn, thêm thanh chuyển chế độ.
- **Tính vào lịch FSRS:** chỉ Gõ pinyin và Điền lời, chỉ với thẻ ĐÃ ĐẾN HẠN (thẻ mới chỉ vào qua ôn chuẩn để giữ hạn mức thẻ mới/ngày). Đúng = Được, đúng âm nhưng sai/thiếu thanh = Khó, sai = Quên. Không bao giờ cho "Dễ". Ghép cặp chỉ luyện thêm.
- Chơi nhẹ nhàng mặc định: không đồng hồ, không mất mạng. Có điểm, combo, gợi ý (trừ điểm). Thử thách (3 mạng) là tùy chọn ở Gõ pinyin.
- Gõ pinyin chấp nhận `nǐ hǎo`, `ni3 hao3` (đúng hoàn toàn), `ni hao` (đúng âm, thiếu thanh = Khó). Điền lời dùng chọn 1/4 (không cần bộ gõ chữ Hán).
- Giao diện Gõ pinyin: khuông nhạc, mỗi từ là một nốt trượt vào; giảm chuyển động thì tắt hiệu ứng.

## Phần thuần (có unit test)
`lib/practice/`: `pinyin-answer` (chuẩn hóa/so pinyin), `pick-practice-cards` (ưu tiên thẻ đến hạn), `cloze` (đục lỗ và chọn đáp án nhiễu), `match-round` (dựng vòng ghép cặp), `practice-grade` (kết quả → mức FSRS, điều kiện được chấm).

## Ngoài phạm vi (để sau)
Nghe và chọn, Đoán Hán Việt, Thanh điệu, Xếp câu, Karaoke điền lời, bảng xếp hạng.
