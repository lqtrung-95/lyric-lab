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

## Kết quả chạy lần 1 (2026-09-24, IP nhà, chưa hoàn tất)

150 video / 50 bài (3 ứng viên mỗi bài, từ `search.list`). Số liệu dưới đây là mức sàn vì 9 video chưa đo được (xem bên dưới).

| | Dùng được (manual, Hán, coverage ≥ 50%) |
|---|---|
| Mức video | 9/150 (6%) |
| Mức bài | 9/50 (18%) |

Theo nhóm (mức bài): Đại lục 3/12, Đài Loan/HK/SG-MY 1/12, OST 4/10, Douyin 1/10, band/indie 0/6.
Theo vai trò (mức video): MV chính thức 2/40, lyric video 5/67, khác 1/42.

Phát hiện:
- 127/150 video không có track tiếng Trung. Track tự động (asr) gần như không có: 8 video có asr, không cái nào tiếng Trung. STT phía client không được "kéo xuống" bởi caption tự động.
- 4 video có track `zh` nhưng là pinyin Latin → loại đúng bởi IN-03.
- yt-dlp khớp 104/104 video đối chiếu được → số liệu không do lỗi provider.
- **Tải nội dung caption bị HTTP 429 sau khoảng 100 request trong ~10 phút, kể cả bằng yt-dlp.** Liệt kê track vẫn chạy. Sau đó cả video từng tải được cũng 429. 9 video có track zh chưa đo được (ghi nhầm là `network`, đã sửa phân loại; chạy lại bằng `--retry-errors` khi hết chặn).
- Việc chọn 3 video đầu của `search.list` có thể bỏ sót bản lyric video khác có CC (IN-05). Chưa thử mở rộng ứng viên.

## Kết quả chạy lần 2 — mở rộng ứng viên (2026-09-24)

41 bài chưa dùng được được tìm thêm ~7 video mỗi bài (`search.list` "… 歌词", top 10). Tổng 454 video / 50 bài.

| | Dùng được |
|---|---|
| Mức video | 13/454 (3%) |
| Mức bài | 12/50 (24%) |
| Trần lý thuyết nếu 4 video còn bị 429 đều đạt | 16/50 (32%) |

- Theo nhóm (mức bài): Đại lục 3/12, Đài Loan/HK/SG-MY 1/12, OST 5/10, Douyin 3/10, band/indie 0/6.
- 24/50 bài không có bất kỳ video ứng viên nào có track tiếng Trung. 29 video có track zh; 11 trong số đó là pinyin Latin, 14 đạt.
- Mở rộng ứng viên chỉ nâng mức bài từ 18% lên 24%. Trần 32% vẫn dưới ngưỡng 40% đã chốt → **rơi vào vùng "dừng xem xét"** dù 4 video còn lại đo ra thế nào.
- Còn 4 video chưa đo do 429 (chạy lại: `--retry-errors`).
- Giới hạn: ứng viên chỉ từ top-10 `search.list`; không loại trừ có bản lyric video có CC ở ngoài top 10.
