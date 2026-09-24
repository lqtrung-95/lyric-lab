# Phase 04 — Kiểm tra lấy caption từ IP cloud (Vercel preview)

## Context
- PRD §8 (Route Handlers trên Vercel), §9 rủi ro "YouTube chặn cách lấy caption"
- Phase 02 provider

## Overview
Ưu tiên P0 — **rủi ro kiến trúc lớn nhất của M0**. YouTube thường chặn request InnerTube/timedtext từ IP datacenter ("Sign in to confirm you're not a bot", 429, yêu cầu PO token). Nếu local chạy tốt mà Vercel bị chặn thì tỉ lệ ở phase 3 vô nghĩa với production.

## Requirements
- Route `app/api/debug/caption-probe/route.ts` (runtime `nodejs`):
  - Chỉ bật khi `VERCEL_ENV !== 'production'` **và** header `x-probe-secret` khớp `CAPTION_PROBE_SECRET`; sai → 404.
  - Input: `videoId` (validate bằng `parseVideoId`).
  - Output **chỉ metrics** (track list, lineCount, hanRatio, method, latency, errorType). Không trả text lời (quy tắc 6, 7).
- Script `scripts/caption-spike/run-cloud-probe.ts`: gọi route preview cho cùng tập candidate (hoặc mẫu 30 video), ghi `spike-output/cloud-results.json`.
- So sánh local vs cloud theo từng method.

## Implementation steps
1. Thêm `CAPTION_PROBE_SECRET` vào `.env.example` (server-only) + `server-env`.
2. Viết route + test unit cho phần guard (secret, env, videoId sai).
3. Deploy Vercel preview (user cần link project Vercel — câu hỏi mở).
4. Chạy cloud probe, throttle như phase 3.
5. Nếu bị chặn: thử nhanh (≤ 0,5 ngày) các hướng thay thế, **chỉ đo, không chọn**:
   - Supabase Edge Function (IP khác Vercel)
   - Chạy fetch caption ở client (trình duyệt người dùng) → kiểm tra CORS: gần như chắc chắn bị chặn, ghi nhận
   - Proxy residential/dịch vụ transcript bên thứ ba (ghi chi phí, không tích hợp)
6. Ghi kết quả vào phase 5.
7. Sau M0: xoá route hoặc giữ sau cờ env — quyết định ở phase 5.

## Todo
- [ ] Route probe có guard + test
- [ ] Deploy preview
- [ ] Cloud probe run
- [ ] So sánh local vs cloud
- [ ] (Nếu bị chặn) đo nhanh phương án thay thế

## Success criteria
- Có bảng tỉ lệ thành công theo method × môi trường (local / Vercel / phương án khác).

## Risks
- Kết quả cloud dao động theo thời gian → chạy 2 lần cách nhau ≥ 12 giờ.

## Security
- Route không lộ lời, không public, không index; secret chỉ ở env Vercel.
