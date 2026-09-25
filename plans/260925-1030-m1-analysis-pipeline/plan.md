---
title: M1 — Pipeline phân tích (lời → từ vựng/ngữ pháp có vị trí)
status: draft — chờ user duyệt
created: 2026-09-25
refs: docs/PRD.md §6.1, §8.1, §8.2, §8.3, §10 (M1); plans/260925-1004-lyrics-source-strategy-after-m0/plan.md
---

# M1 — Pipeline

Mục tiêu (PRD §10): tách từ, từ điển, prompt v1, validate, cache, bộ đánh giá 50 bài. Tiêu chí xong: ≤ 3% thẻ sai trên bộ đánh giá.

Thay đổi so với PRD nhờ kết quả M0: bước "Lấy lời" có 2 nguồn (caption YouTube → LRCLIB), cần thêm chọn bản theo độ dài video.

## Phases
| # | Phase | Nội dung | Ước lượng |
|---|---|---|---|
| 1 | `LyricsProvider` | Interface gộp `CaptionProvider` + `LrclibProvider`; thứ tự ưu tiên; chọn bản LRCLIB theo tên + độ dài video (loại bản lệch > 10s, cover/live); nhãn nguồn `youtube_caption` / `lrclib`; Vitest bằng fixture hư cấu | 1 ngày |
| 2 | Chuẩn hóa lời | Làm sạch (đã có `cleanCaptionLines`), phồn → giản thể để tra cứu (`opencc-js`), giữ bản gốc để hiển thị, bỏ dòng nhạc lý (vd. "Re So So Si…") | 1 ngày |
| 3 | Từ điển | Migration Supabase + nạp CC-CEDICT (CC BY-SA), danh sách HSK, âm Hán Việt (Unihan `kVietnamese`); hàm tra: pinyin, nghĩa, level, Hán Việt | 1,5 ngày |
| 4 | Tách từ + ứng viên | `@node-rs/jieba` (binary dựng sẵn, chạy được trên Vercel; `nodejieba` cần biên dịch native); tính tần suất, level, ứng viên | 1 ngày |
| 5 | LLM + validate | Groq (Llama 3.3 70B) + model dự phòng; schema Zod cho `SongAnalysis`; ghép vị trí `occurrences`, loại mục không khớp; pinyin/level/Hán Việt luôn từ từ điển; `promptVersion` | 2 ngày |
| 6 | Cache | Bảng `songs`, `song_analyses` (key: videoId + ngôn ngữ học + ngôn ngữ giải thích + promptVersion), RLS chỉ server ghi; chính sách lưu lời theo mục rủi ro pháp lý | 1 ngày |
| 7 | Bộ đánh giá | 50 bài, đáp án do người chấm; script chạy khi đổi prompt/model; đo % thẻ sai | 1,5 ngày + thời gian chấm của user |

Phụ thuộc: 1 → 2 → (3 ∥ 4) → 5 → 6 → 7.

## Ràng buộc
- LLM không viết lời; pinyin, HSK, Hán Việt từ từ điển (quy tắc 1, 2). Mục không khớp vị trí bị loại (quy tắc 3).
- Khóa Groq chỉ ở server (quy tắc 4).
- Fixture/test chỉ dùng bài hư cấu 夜车 (quy tắc 7). Bộ đánh giá 50 bài thật cần lời thật → **lưu ngoài repo** (thư mục ignore) và chỉ commit đáp án dạng ID/từ, không kèm lời.

## Cần từ user
1. **Duyệt kế hoạch** này (CLAUDE.md: lập kế hoạch → chờ duyệt → code).
2. HSK 2.0 (6 cấp) hay 3.0 (9 cấp)? (PRD câu hỏi mở; đề xuất 2.0 vì PRD và design dùng HSK1–6).
3. Project Supabase Cloud (URL, anon key, service role key) trước phase 3; Groq API key trước phase 5.
4. Người chấm đáp án cho bộ đánh giá (phase 7): bạn tự chấm hay nhờ người biết tiếng Trung?

## Câu hỏi mở
- LRCLIB: điều khoản/giới hạn tốc độ khi dùng cho app công khai; có nên tự mirror dữ liệu không.
- Lệch mốc thời gian LRC so với video: đo tay 10 bài trước khi chốt cách xử lý (offset do người dùng chỉnh, hay tự phát hiện).
