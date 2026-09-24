# Phase 03 — Dataset 50 bài + spike runner (IP nhà)

## Context
- PRD §10 M0; §2 chỉ số "Tỉ lệ phân tích thành công ≥ 85%"; §9 rủi ro caption
- Phase 02 cung cấp provider + quality check

## Overview
Ưu tiên P0. Đo tỉ lệ caption dùng được ở **2 mức**:
- **Video-level:** link người dùng hay dán (MV chính thức) có caption dùng được không.
- **Song-level:** có *ít nhất một* video của bài đó dùng được không (MV, lyric video 动态歌词, audio chính thức). Đây là số kiểm chứng giải pháp IN-05 "gợi ý bản lyrics video".

## Key insights
- 50 bài chọn theo nhóm để số liệu có ý nghĩa, không chỉ top hit:

  | Nhóm | Số bài |
  |---|---|
  | Mandopop Đại lục | 12 |
  | Mandopop Đài Loan / HK / SG-MY | 12 |
  | OST phim / C-drama | 10 |
  | Viral Douyin | 10 |
  | Band / indie / rap nhanh | 6 |

  Danh sách chi tiết: [phase-03-cpop-sample-song-list-proposal.md](phase-03-cpop-sample-song-list-proposal.md). Cantopop không có trong MVP.

- Mỗi bài 1–3 candidate `videoId`, gắn `role: 'official_mv' | 'lyric_video' | 'official_audio' | 'fan_upload'`.
- Danh sách chỉ chứa `videoId`, tên bài, nghệ sĩ, nhóm, role — **không chứa lời** → được commit.
- Lấy candidate: tìm tay trên YouTube (hoặc `search.list`, 100 quota/lần — 50 bài ≈ 5 000 quota, trong hạn 10 000/ngày). Ưu tiên tìm tay để tránh chọn lệch.

## Requirements
- `scripts/caption-spike/cpop-sample-songs.json` — dataset.
- `scripts/caption-spike/run-caption-spike.ts` (chạy `npx tsx`):
  - Với mỗi candidate: Data API `captions.list` + provider A/B + (tuỳ chọn) oracle yt-dlp.
  - Ghi raw từng video vào `spike-output/raw/<videoId>.json` (gitignore).
  - Ghi `spike-output/results.json` + `results.csv` chỉ chứa metrics.
  - Throttle 1 req/2 s, retry 1 lần, resume được (bỏ qua video đã có kết quả).
- Metrics mỗi video: `hasAnyTrack`, `tracks[]`, `bestTrack`, `kind`, `hanRatio`, `script`, `lineCount`, `coverage` (tổng thời gian có lời / thời lượng video), `medianLineSec`, `bilingual`, `verdict`, `method thành công`, `latencyMs`, `errorType`, `hardsubSuspected` (điền tay khi 0 track mà xem video thấy lời in trên hình).
- **Kiểm tra lệch thời gian tay** (LS-02 ≤ 300 ms): chọn 10 video `ok`, mở player tại 5 dòng ngẫu nhiên, ghi lệch ước lượng vào `spike-output/timing-check.csv`, commit bản tổng hợp số (không lời).
- **Chấm "dùng được" tay** cho các video ASR `ok`: đọc lướt 10 dòng, đánh giá đúng/sai lời (thang 0–2). ASR tiếng Trung với giọng hát thường rất sai → không tin `hanRatio` một mình.

## Định nghĩa "dùng được"
`verdict = ok` **và** coverage ≥ 50% **và** (manual track **hoặc** ASR chấm tay ≥ 1). Chốt định nghĩa này trước khi chạy để không chỉnh sau khi thấy số.

## Related files
- Create: 2 file trên, `scripts/caption-spike/summarize-spike-results.ts` (đọc results.json → bảng tỉ lệ theo nhóm/role/method)
- Modify: `.gitignore` (`spike-output/` — đã thêm ở phase 01)

## Implementation steps
1. Soạn dataset 50 bài (cần user duyệt/góp danh sách — xem câu hỏi mở).
2. Viết runner, chạy thử 3 video.
3. Chạy đủ ~100–120 candidate từ máy local.
4. Kiểm tra tay: timing (10 video), ASR quality, hardsub.
5. Chạy summarize → bảng số liệu.
6. Commit: `chore(spike): add c-pop caption spike runner and dataset`.

## Todo
- [ ] Dataset 50 bài + candidate
- [ ] Runner + resume + throttle
- [ ] Chạy full local
- [ ] Kiểm tra tay timing / ASR / hardsub
- [ ] Summarize
- [ ] Commit (không có raw)

## Success criteria
- 50/50 bài có kết quả (kể cả lỗi có phân loại).
- `git status` không có file chứa lời.

## Risks
- Bị rate-limit/bot-check ngay cả từ IP nhà → giảm tốc, ghi nhận như một kết quả.
- Chọn mẫu lệch về bài nổi tiếng (thường có caption tốt hơn) → nhóm Douyin/fan upload bù lại.

## Security
- Raw caption chỉ ở `spike-output/` local. Không upload lên đâu.
