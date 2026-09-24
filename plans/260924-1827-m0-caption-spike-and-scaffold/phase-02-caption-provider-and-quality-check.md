# Phase 02 — `parseVideoId` + `CaptionProvider` + quality check

## Context
- PRD IN-01, IN-02, IN-03, IN-05; §8.1 bước 1–2; §9 rủi ro "YouTube đổi/chặn cách lấy caption"
- CLAUDE.md: `lib/captions/` = CaptionProvider (interface) + YouTube impl

## Overview
Ưu tiên P0. Code dùng lại cho M1 — spike (phase 3, 4) chỉ là người gọi.

## Key insights
- **Không có cách lấy caption chính thức cho video người khác**: Data API `captions.list` (50 quota/lần) liệt kê được track (ngôn ngữ, `trackKind` standard/ASR) bằng API key, nhưng `captions.download` cần OAuth của chủ video. → Tải nội dung phải qua endpoint không chính thức.
- Các cách tải nội dung cần so sánh trong spike:
  - **A. InnerTube player** (`youtubei.js` hoặc gọi tay `/youtubei/v1/player`) → `captionTracks[].baseUrl` → tải `fmt=json3`. Rủi ro: YouTube đòi PO token / chặn IP datacenter.
  - **B. InnerTube `get_transcript`** (panel "Hiện bản chép lời") — đường khác, đôi khi sống khi A bị chặn.
  - **C. `yt-dlp --skip-download --write-subs --write-auto-subs`** — chỉ dùng làm *oracle* đối chiếu trong spike (Python, không deploy lên Vercel). Chỉ tải phụ đề, không tải media.
- Track tiếng Trung có nhiều mã: `zh`, `zh-Hans`, `zh-Hant`, `zh-CN`, `zh-TW`, `zh-HK`, `yue` (Quảng Đông — tách riêng, đánh dấu). Track dịch tự động (`tlang=`) **không tính**.
- MV C-pop hay có **lời in cứng trên hình (hardsub)**, không có CC → spike phải đo được nhóm này (video có lời nhưng 0 track).
- Track có thể song ngữ trong 1 dòng (中文 + English/pinyin) → cần đo tỉ lệ Hán theo ký tự, không theo dòng.

## Requirements
- `parseVideoId(input)`: `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/`, `music.youtube.com`, `m.youtube.com`, videoId trần 11 ký tự `[A-Za-z0-9_-]`. Trả `null` khi sai. Thuần client-safe.
- Interface:
  ```ts
  interface CaptionTrackInfo { lang: string; kind: 'manual' | 'asr'; name?: string }
  interface CaptionLine { text: string; start: number; end: number }
  interface CaptionFetchResult { track: CaptionTrackInfo; lines: CaptionLine[]; method: string }
  interface CaptionProvider {
    listTracks(videoId: string): Promise<CaptionTrackInfo[]>;
    fetchLines(videoId: string, track: CaptionTrackInfo): Promise<CaptionLine[]>;
  }
  ```
- `pickBestChineseTrack(tracks)`: manual trước ASR (IN-02); trong manual: zh-Hans/zh-CN > zh/zh-Hant/zh-TW/zh-HK; `yue` cuối.
- `cleanCaptionLines(lines)`: bỏ `[Music]`, `[音乐]`, `♪`, `♫`, dòng rỗng, trùng lặp liên tiếp; gộp dòng ASR bị cắt quá ngắn (<0,6 s) — ngưỡng cấu hình được.
- `assessLyricQuality(lines)` → `{ hanRatio, lineCount, coverageSec, medianLineSec, hasBilingualLines, script: 'simplified'|'traditional'|'mixed', verdict: 'ok' | 'unsupported' }`; `unsupported` khi <60% dòng là chữ Hán (IN-03).
- Lỗi có kiểu: `NoCaptionError`, `BlockedError` (bot check / 403 / 429), `ParseError` → phục vụ thống kê và IN-05.

## Architecture
```
lib/youtube/parse-video-id.ts
lib/captions/caption-provider-types.ts
lib/captions/caption-errors.ts
lib/captions/pick-best-chinese-track.ts
lib/captions/clean-caption-lines.ts
lib/captions/assess-lyric-quality.ts
lib/captions/youtube-innertube-caption-provider.ts   # method A (+B nếu A fail)
lib/captions/youtube-data-api-track-lister.ts         # captions.list, dùng để đối chiếu metadata
```
Phân loại phồn/giản: dùng bảng ký tự nhỏ đủ cho heuristic (ví dụ `opencc-js` nếu nhẹ; không thì danh sách ký tự khác biệt phổ biến). Chuyển đổi thật để M1.

## Related files
- Create: như trên + `lib/**/*.test.ts` tương ứng
- Fixtures test: dùng lời hư cấu `夜车` trong design-brief §6 (quy tắc 7) + chuỗi rác `[Music]`, ♪, dòng song ngữ tự viết.

## Implementation steps
1. docs-seeker: API hiện tại của `youtubei.js` (captions / transcript), định dạng `json3`.
2. `parseVideoId` + test bảng (≥ 15 case, gồm case sai).
3. Types + errors.
4. `pickBestChineseTrack` + test.
5. `cleanCaptionLines` + `assessLyricQuality` + test với fixture hư cấu.
6. `YoutubeInnertubeCaptionProvider`: method A, fallback B; timeout 10 s; map lỗi sang error type.
7. `youtube-data-api-track-lister` (server-only).
8. Chạy thử tay trên 2–3 video (không commit output).
9. Commit: `feat(captions): add video id parser and youtube caption provider (IN-01, IN-02, IN-03)`.

## Todo
- [ ] parseVideoId + test
- [ ] types, errors
- [ ] pickBestChineseTrack + test
- [ ] clean + assess + test
- [ ] InnerTube provider (A, B)
- [ ] Data API track lister
- [ ] Commit

## Success criteria
- Unit test xanh, coverage `lib/youtube` + logic thuần `lib/captions` ≥ 90%.
- Provider lấy được caption cho ≥ 1 video thật từ máy local.

## Risks
- `youtubei.js` hỏng do YouTube đổi → lớp interface cho phép thay; ghi version chính xác vào report.
- ToS: endpoint không chính thức là vùng xám → ghi rõ trong report phase 5, không đưa vào production khi chưa đánh giá.

## Security
- Validate `videoId` bằng regex trước mọi request (PRD §7).
- Data API key chỉ đọc qua `server-env`.
