---
title: M0 — Spike caption YouTube (50 bài C-pop) + scaffold Next.js/Supabase
status: câu hỏi mở đã chốt, chờ lệnh bắt đầu phase 1
created: 2026-09-24
branch: claude/m0-youtube-captions-cpop-a91b2e
refs: docs/PRD.md §6.1 (IN-01..IN-05), §8, §9, §10 (M0)
---

# M0 — Spike caption + scaffold

## Mục tiêu

Trả lời câu hỏi mở của PRD §10: **tỉ lệ bài C-pop có caption lời dùng được là bao nhiêu**, và **server (Vercel) có lấy được caption không** → chốt có cần kéo STT lên sớm / đổi kiến trúc lấy caption hay không.

Scaffold dựng song song vì code lấy caption viết luôn vào `lib/captions/` để M1 dùng lại (không viết script vứt đi).

## Phạm vi

- Có: scaffold Next.js + Tailwind + Vitest + Playwright + Supabase (client, CLI init); `parseVideoId` (IN-01); `CaptionProvider` + YouTube impl (IN-02); bộ kiểm tra chất lượng lời (IN-03); script spike; test từ IP cloud; báo cáo số liệu + khuyến nghị.
- Không: tách từ, từ điển, LLM, UI theo design, schema DB (để M1–M3).

## Phases

| # | Phase | File | Ước lượng | Trạng thái |
|---|---|---|---|---|
| 1 | Scaffold Next.js + Supabase + test tooling | [phase-01](phase-01-scaffold-nextjs-supabase-tooling.md) | 0,5–1 ngày | todo |
| 2 | `parseVideoId` + `CaptionProvider` + quality check | [phase-02](phase-02-caption-provider-and-quality-check.md) | 1–1,5 ngày | todo |
| 3 | Dataset 50 bài + spike runner (IP nhà) | [phase-03](phase-03-dataset-and-spike-runner.md) | 1 ngày | todo |
| 4 | Kiểm tra lấy caption từ IP cloud (Vercel preview) | [phase-04](phase-04-cloud-ip-fetch-check.md) | 0,5 ngày | todo |
| 5 | Báo cáo + quyết định Go/No-go STT | [phase-05](phase-05-spike-report-and-decision.md) | 0,5 ngày | todo |

Phụ thuộc: 1 → 2 → (3 ∥ 4) → 5.

## Tiêu chí xong M0

- `npm run dev|build|lint|test|test:e2e` chạy xanh.
- Chạy spike trên đủ 50 bài, có bảng số liệu ở `plans/reports/`.
- Biết rõ phương pháp lấy caption nào chạy được từ Vercel.
- Có khuyến nghị: giữ MVP "chỉ video có caption" hay kéo STT lên sớm / đổi nguồn.

## Ràng buộc từ CLAUDE.md áp dụng cho M0

- Không commit lời bài hát thật: caption raw lưu ở `spike-output/` (gitignore). Chỉ commit số liệu tổng hợp + danh sách `videoId`/tên bài.
- Không tải audio/video. Chỉ lấy track phụ đề.
- Key YouTube Data API chỉ ở server (`YOUTUBE_DATA_API_KEY`).
- Route debug trên Vercel không trả lời bài hát, chỉ trả metrics, có bảo vệ bằng secret.

## Quyết định (2026-09-24)

1. Danh sách 50 bài: Claude đề xuất, user đã duyệt → [phase-03-cpop-sample-song-list-proposal.md](phase-03-cpop-sample-song-list-proposal.md).
2. Cantopop: đề xuất **không đưa vào MVP**, spike chỉ đo tiếng Phổ thông (user xác nhận 2026-09-24).
3. Vercel: user tự tạo project, cần có trước phase 04.
4. `yt-dlp` làm oracle trong spike: đồng ý.
5. Ngưỡng phase 05: ≥ 70% giữ MVP / 40–70% tự tìm lyric video / < 40% dừng xem xét: đồng ý.

## User cần chuẩn bị

- Trước phase 02: YouTube Data API key (Google Cloud Console, bật YouTube Data API v3) → đặt vào `.env.local`.
- Trước phase 04: project Vercel nối với repo GitHub; tự đặt env `YOUTUBE_DATA_API_KEY`, `CAPTION_PROBE_SECRET` trên dashboard.
