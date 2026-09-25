---
title: M1 — Pipeline phân tích (lời → từ vựng/ngữ pháp có vị trí)
status: user đã duyệt 2026-09-25 — đang làm (phase 1 xong)
created: 2026-09-25
refs: docs/PRD.md §6.1, §8.1, §8.2, §8.3, §10 (M1); plans/260925-1004-lyrics-source-strategy-after-m0/plan.md
---

# M1 — Pipeline

Mục tiêu (PRD §10): tách từ, từ điển, prompt v1, validate, cache, bộ đánh giá 50 bài. Tiêu chí xong: ≤ 3% thẻ sai trên bộ đánh giá.

Thay đổi so với PRD nhờ kết quả M0: bước "Lấy lời" có 2 nguồn (caption YouTube → LRCLIB), cần thêm chọn bản theo độ dài video.

## Phases
| # | Phase | Nội dung | Ước lượng |
|---|---|---|---|
| 1 ✅ | `LyricsProvider` | Interface gộp `CaptionProvider` + `LrclibProvider`; thứ tự ưu tiên; chọn bản LRCLIB theo tên + độ dài video (loại bản lệch > 10s, cover/live); nhãn nguồn `youtube_caption` / `lrclib`; Vitest bằng fixture hư cấu | 1 ngày |
| 2 ✅ | Chuẩn hóa lời | Làm sạch (đã có `cleanCaptionLines`), phồn → giản thể để tra cứu (`opencc-js`), giữ bản gốc để hiển thị, bỏ dòng nhạc lý (vd. "Re So So Si…") | 1 ngày |
| 3 ✅ | Từ điển | Migration Supabase + nạp CC-CEDICT (CC BY-SA), danh sách HSK, âm Hán Việt (Unihan `kVietnamese`); hàm tra: pinyin, nghĩa, level, Hán Việt | 1,5 ngày |
| 4 ✅ | Tách từ + ứng viên | `@node-rs/jieba` (binary dựng sẵn, chạy được trên Vercel; `nodejieba` cần biên dịch native); tính tần suất, level, ứng viên | 1 ngày |
| 5 | LLM + validate | Groq (Llama 3.3 70B) + model dự phòng; schema Zod cho `SongAnalysis`; ghép vị trí `occurrences`, loại mục không khớp; pinyin/level/Hán Việt luôn từ từ điển; `promptVersion` | 2 ngày |
| 6 | Cache | Bảng `songs`, `song_analyses` (key: videoId + ngôn ngữ học + ngôn ngữ giải thích + promptVersion), RLS chỉ server ghi; chính sách lưu lời theo mục rủi ro pháp lý | 1 ngày |
| 7 | Bộ đánh giá | 50 bài, đáp án do người chấm; script chạy khi đổi prompt/model; đo % thẻ sai | 1,5 ngày + thời gian chấm của user |

Phụ thuộc: 1 → 2 → (3 ∥ 4) → 5 → 6 → 7.

## Ràng buộc
- LLM không viết lời; pinyin, HSK, Hán Việt từ từ điển (quy tắc 1, 2). Mục không khớp vị trí bị loại (quy tắc 3).
- Khóa Groq chỉ ở server (quy tắc 4).
- Fixture/test chỉ dùng bài hư cấu 夜车 (quy tắc 7). Bộ đánh giá 50 bài thật cần lời thật → **lưu ngoài repo** (thư mục ignore) và chỉ commit đáp án dạng ID/từ, không kèm lời.

## Quyết định của user (2026-09-25)
- Duyệt kế hoạch M1.
- Level dùng **HSK 3.0 (9 cấp)**, không phải 2.0. Hệ quả: PRD (`level: 1–6`), design brief (chọn level HSK1–6, bộ lọc) và onboarding cần cập nhật lên 1–9 (7–9 là nhóm nâng cao trong HSK 3.0). Nguồn danh sách từ HSK 3.0 cần tìm ở phase 3; nếu không có nguồn tin cậy thì phải hỏi lại.
- Đã thêm `.env.local`: Supabase (URL, anon, service role), Groq, YouTube Data API.
- User tự chấm đáp án bộ đánh giá (phase 7).

## Kết quả phase 1 (2026-09-25)
Code: `lib/lyrics/*` (`getLyricsForVideo`, `LrclibProvider`, `pickLrclibVersion`, `buildLrclibQueries`, `parseLrc`), `lib/text/to-simplified-chinese.ts`, `lib/youtube/fetch-video-meta.ts`.
Kiểm tra thật trên video đầu tiên của 50 bài (đi từ tiêu đề video, giống người dùng dán link), `scripts/caption-spike/lyrics-provider-e2e-check.mts`:
- Có lời: **42/50 (84%)** (LRCLIB 40, caption YouTube 2; caption tải nội dung đang bị 429 trên IP này nên phần lớn rơi sang LRCLIB).
- Không có: 8 bài, đều "LRCLIB có kết quả nhưng không bản nào khớp tên + độ dài ≤ 10s" (演员, 凉凉, 无羁, 风起时, 红颜劫, 成都, 双截棍, 大风吹). Cần xem lại từng ca (video là bản live/remix, hay tên bài lệch) — chưa xử lý.
- Ghi chú kỹ thuật: tìm LRCLIB bằng tiêu đề nguyên bản gần như không ra (vd. "晴天 Sunny Day"); phải rút cụm chữ Hán và đổi giản thể (lần chạy đầu 29/50, sau khi sửa 42/50).

## Cần từ user (đã xong, giữ để tham chiếu)
1. **Duyệt kế hoạch** này (CLAUDE.md: lập kế hoạch → chờ duyệt → code).
2. HSK 2.0 (6 cấp) hay 3.0 (9 cấp)? (PRD câu hỏi mở; đề xuất 2.0 vì PRD và design dùng HSK1–6).
3. Project Supabase Cloud (URL, anon key, service role key) trước phase 3; Groq API key trước phase 5.
4. Người chấm đáp án cho bộ đánh giá (phase 7): bạn tự chấm hay nhờ người biết tiếng Trung?

## Câu hỏi mở
- LRCLIB: điều khoản/giới hạn tốc độ khi dùng cho app công khai; có nên tự mirror dữ liệu không.
- Lệch mốc thời gian LRC so với video: đo tay 10 bài trước khi chốt cách xử lý (offset do người dùng chỉnh, hay tự phát hiện).

## Kết quả phase 2–3 (2026-09-25)
- Phase 2: `lib/lyrics/normalize-lyric-lines.ts` (bỏ credit, chú âm phù hiệu, solfege; thêm bản giản thể; `hasHan`).
- Phase 3, nguồn dữ liệu (tải vào `data-cache/`, đã gitignore, không commit): CC-CEDICT (CC BY-SA 4.0, 125.101 mục), `drkameleon/complete-hsk-vocabulary` (MIT; dùng bộ `new-*` = HSK 3.0 chuẩn 2021, 10.969 từ), Unihan `kVietnamese` (8.306 chữ).
- **Giới hạn HSK 3.0:** danh sách nguồn chỉ có cấp 1–6 và nhóm "7–9" gộp chung (lưu là cấp 7). Không tách được 7, 8, 9 riêng. Bộ `newest-*` trong cùng dataset không có tài liệu nên không dùng.
- Pinyin của CC-CEDICT được đổi sang dạng có dấu (`pinyin-tone-marks.ts`); từ nhiều âm gắn cấp HSK đúng cách đọc.
- Âm Hán Việt = ghép âm đầu tiên của từng chữ (Unihan); chữ thiếu trong bảng thì trả null, không đoán. Chưa đo độ phủ trên lời thật.
- Migration: `supabase/migrations/20260925000001_dictionary_tables.sql` (`dict_words`, `dict_hanzi_sino_viet`, RLS chỉ đọc công khai). **Chưa áp dụng**: không có thông tin kết nối DB/CLI, cần user chạy trong Supabase SQL Editor rồi mới chạy `scripts/dictionary/import-dictionary.mts`.

## Nạp từ điển (2026-09-25) — xong
Migration đã chạy; import bằng `NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/dictionary/import-dictionary.mts` (Node 20 thiếu WebSocket gốc mà supabase-js cần; Node 22 không cần cờ). Kết quả: `dict_words` 125.126 mục, `dict_hanzi_sino_viet` 8.306 chữ; anon key đọc được (RLS ok).
**Chất lượng Hán Việt (Unihan) — giới hạn đã đo trên 10 từ mẫu:** tra bằng dạng phồn thể (chữ giản thể thường thiếu hoặc ra âm Nôm). Đúng 7/10; sai/thiếu: 离 → "li" (chuẩn "ly"), 袋 → "đãy" (chuẩn "đại"), 亮 không có. Unihan lẫn âm Nôm, không đánh dấu nguồn. Cần nguồn Hán Việt tốt hơn (vd. Wiktionary tiếng Việt) trước khi hiển thị cho người dùng; hiện chưa làm. Quy tắc 2 vẫn giữ: Hán Việt lấy từ từ điển, không lấy từ LLM.

## Kết quả phase 4 (2026-09-25)
`lib/analysis/`: `tokenizeLyricLines` (`@node-rs/jieba`, tắt HMM, token giữ bản gốc phồn thể), `collectHanTerms`, `buildVocabCandidates` (bỏ hư từ + từ 1 chữ cơ bản, xếp theo số lần xuất hiện rồi cấp HSK).
Chạy thật phase 1→4 trên 6 bài (`scripts/caption-spike/analysis-pipeline-e2e-check.mts`): 73–117 từ/bài, **90–95% có trong từ điển**, 37–60 ứng viên/bài, phân bố cấp HSK 1–7 và không có cấp (từ ngoài HSK). Đủ đầu vào cho LLM.
