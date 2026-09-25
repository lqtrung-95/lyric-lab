---
title: Chiến lược nguồn lời sau M0
status: user chốt hướng 2026-09-25 — dùng kho lời có sẵn (LRCLIB) làm nguồn chính; chờ duyệt kế hoạch M1
created: 2026-09-25
refs: docs/PRD.md §4, §6.1, §9, §10; CLAUDE.md quy tắc 1, 5, 6
---

# Nguồn lời sau M0

## Bối cảnh
Caption YouTube dùng được cho 12/50 bài (24%, trần 32%) → không đủ (PRD cần ≥ 85%). STT không khả thi cho MVP: quy tắc 5 cấm tải audio lên server, và trình duyệt không lấy được audio từ iframe YouTube (cần extension, v1.2).

## Quyết định của user (2026-09-25)
1. **Không** bắt người dùng tự dán lời / tự đồng bộ (phiền, làm người dùng bỏ app).
2. Tìm nguồn lời có sẵn, miễn có là được.
3. Vercel: user tự tạo project khi tới phase 4.

## Kết quả đo LRCLIB (kho lời đồng bộ mở, API công khai, không cần key)
Script: `scripts/caption-spike/lrclib-coverage-spike.mts` (chỉ ghi số liệu, không lưu lời). 50 bài của spike:

| Chỉ số | Kết quả |
|---|---|
| Có lời đồng bộ khớp tên bài | 43/50 (86%) |
| Khớp cả tên nghệ sĩ | 41/50 |
| Chữ Hán đạt (IN-03) | 43/50 |
| Độ dài lệch ≤ 10s so với ít nhất một video ứng viên (dấu hiệu đồng bộ được) | 39/50 (78%) |

Theo nhóm (chữ Hán đạt): Đại lục 11/12, Đài Loan 11/12, OST 7/10, Douyin 10/10, band/indie 4/6. So với caption YouTube: 24%.
Bài không có: 李白, 遇见, 无羁, 风起时, 红颜劫, 双截棍, 大风吹.

Cần kiểm chứng ở M1: (a) khớp theo tên có thể ra bản cover/live → phải đối chiếu độ dài với video; (b) lệch mốc thời gian giữa bản LRC và video (intro khác nhau) → cần offset/hiệu chỉnh; (c) 4 bài lệch độ dài lớn (光年之外 16s, 默 90s, 芒种 189s, 孤勇者 190s) là ca cần xử lý.

## Rủi ro pháp lý (quyết định của user, không phải của Claude)
LRCLIB do cộng đồng đóng góp, lời vẫn có bản quyền. PRD §9 đã cảnh báo. Giảm thiểu đề xuất:
- Không hiển thị lời ngoài trang bài học `noindex`, luôn kèm video nhúng.
- Lấy lời theo yêu cầu, cache ngắn hạn; cache phân tích lâu dài chỉ giữ từ vựng/ngữ pháp + vị trí, hạn chế lưu toàn văn.
- Kênh gỡ nội dung 72 giờ; xin license (Musixmatch/LyricFind) trước khi thu phí.
- Giữ `LyricsProvider` là interface để thay nguồn khi cần; ưu tiên caption YouTube khi có (chính chủ).

## Nguồn khác đã cân nhắc
- Musixmatch API chính thức: cần license, gói miễn phí chỉ trả một phần lời, không có mốc thời gian theo dòng.
- NetEase / QQ Music / Kugou (API không chính thức): độ phủ C-pop cao nhưng vi phạm điều khoản, dễ bị chặn → **không đề xuất**.
- Genius: không có mốc thời gian.

## Bước tiếp theo
1. Phase 4 (thử từ IP Vercel): gọi cả YouTube caption và LRCLIB từ Vercel. Cần project Vercel của user.
2. Phase 5: báo cáo M0, cập nhật PRD §4/§9/§10 và CLAUDE.md quy tắc 1.
3. Lập kế hoạch M1 (pipeline: `LyricsProvider` = caption YouTube → LRCLIB; chọn bản theo độ dài video; offset; tách từ; từ điển; LLM) — chờ duyệt trước khi code.
