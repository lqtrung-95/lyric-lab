# Phase 05 — Báo cáo spike + quyết định

## Context
- PRD §10 tiêu chí xong M0: "Có số liệu để chốt có cần STT sớm hay không"
- Output phase 3, 4

## Overview
Viết `plans/reports/caption-spike-260924-m0-cpop-caption-availability-report.md` (đổi ngày theo lúc viết), cập nhật PRD câu hỏi mở.

## Nội dung báo cáo
1. Phương pháp: dataset, định nghĩa "dùng được", version thư viện, thời điểm chạy.
2. Bảng tỉ lệ: video-level, song-level; theo nhóm; theo role; manual vs ASR; hardsub; phồn/giản; song ngữ.
3. Bảng method × môi trường (local / Vercel / khác).
4. Timing: lệch trung vị / p90 so với ngưỡng 300 ms.
5. Latency lấy caption (đóng góp vào ngân sách 8 s tới thẻ đầu tiên).
6. Khuyến nghị theo ngưỡng (chốt trước, dưới đây là đề xuất):

   | Song-level dùng được (từ Vercel) | Khuyến nghị |
   |---|---|
   | ≥ 70% | Giữ MVP như PRD. Làm IN-05 gợi ý lyric video kỹ. STT giữ ở v1.2 |
   | 40–70% | Giữ MVP, nâng IN-05 thành tìm lyric video tự động (`search.list`), cân nhắc kéo STT lên v1.1 |
   | < 40% | Dừng, xem lại: STT/forced alignment sớm, hoặc nguồn lời khác có license |

   Nếu Vercel bị chặn hoàn toàn: quyết định kiến trúc lấy caption (Edge Function / worker riêng / dịch vụ ngoài) trước khi vào M1.
7. Hệ quả cho M1: track picking, cleaning rules, xử lý phồn thể, `yue`.

## Cập nhật docs
- `docs/PRD.md` §10: tick câu hỏi "Tỉ lệ video C-pop có caption…" + số liệu + link report.
- `docs/PRD.md` §9: cập nhật khả năng/giảm thiểu rủi ro caption nếu số liệu khác giả định.
- README: trạng thái M0 xong.

## Todo
- [ ] Viết report
- [ ] Cập nhật PRD + README
- [ ] Quyết định giữ/xoá route probe
- [ ] Commit: `docs: add m0 caption spike results`

## Success criteria
- User đọc report và chốt được hướng cho M1 trong 1 lần đọc.
