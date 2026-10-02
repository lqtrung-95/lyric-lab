import type { TokenizedLine, VocabCandidate } from "./analysis-types";

// Tăng khi đổi prompt hoặc schema để tạo cache mới (PRD §8.3).
export const PROMPT_VERSION = "v6";

export const SYSTEM_PROMPT =
  "Bạn là giáo viên tiếng Trung kiêm dịch giả lời bài hát cho người Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. " +
  "Bạn KHÔNG được viết, đoán hay sửa lời bài hát: lời đã được cung cấp sẵn.";

/** Dựng prompt từ lời đã đánh số dòng và danh sách từ ứng viên (đã tra từ điển). */
export function buildAnalysisPrompt(lines: TokenizedLine[], candidates: VocabCandidate[]): string {
  const lyricBlock = lines.map((l) => `${l.index}\t${l.simplified}`).join("\n");
  const candidateBlock = candidates
    .map((c) => `${c.term}\tHSK ${c.hskLevel ?? "-"}\t${c.meanings.join("; ")}`)
    .join("\n");

  return `LỜI BÀI HÁT (mỗi dòng: chỉ số, tab, lời giản thể):
${lyricBlock}

TỪ ỨNG VIÊN (từ, cấp HSK, nghĩa tiếng Anh):
${candidateBlock}

Trả về JSON đúng cấu trúc:
{
  "summary": "2–3 câu tiếng Việt về nội dung và cảm xúc bài hát, KHÔNG trích nguyên câu hát",
  "moods": ["2–3 từ khóa cảm xúc tiếng Việt"],
  "vocab": [{"term": "...", "meaningInContext": "nghĩa trong bài, tiếng Việt", "contextNote": "ghi chú ngữ cảnh ngắn, tiếng Việt", "priority": 0-100}],
  "grammar": [{"pattern": "công thức", "explanation": "giải thích tiếng Việt", "example": {"zh": "câu ví dụ MỚI do bạn đặt", "vi": "dịch"}, "commonMistake": "lỗi người Việt hay mắc", "level": 1-7, "lineIndexes": [chỉ số dòng có cấu trúc này], "priority": 0-100}],
  "translations": [{"lineIndex": 0, "vi": "bản dịch lời bài hát, thoát ý và có chất thơ"}]
}

Quy tắc:
- vocab: chọn 20–25 từ đáng học nhất, "term" chép NGUYÊN VĂN từ danh sách ứng viên. Ưu tiên từ cấp trung và cao, từ mang hình ảnh hoặc cảm xúc của bài; bỏ từ quá cơ bản.
- grammar: 3–5 cấu trúc THẬT SỰ xuất hiện trong lời. "pattern" viết bằng chữ Hán cố định và ký hiệu A, B, V, O, adj (ví dụ "从来没 + V + 过"); "lineIndexes" là các dòng chứa cấu trúc. "example" là câu mới do bạn đặt, không lấy từ lời bài hát.
- translations: dịch mọi dòng, giữ đúng chỉ số. Dịch THOÁT Ý như dịch lời bài hát/thơ, KHÔNG dịch word-by-word theo đúng trật tự chữ Hán — ưu tiên câu văn tiếng Việt mượt, có hình ảnh và cảm xúc, giữ đúng nghĩa và sắc thái gốc chứ không bịa thêm nội dung. Đảo trật tự từ, dùng từ ngữ văn chương khi hợp lý để câu nghe tự nhiên như lời bài hát tiếng Việt thật, không phải bản dịch máy móc.
- Xưng hô (我/你/我们 dịch thành gì): chọn ĐÚNG MỘT bộ xưng hô ngay từ đầu rồi DÙNG THỐNG NHẤT CHO MỌI DÒNG, không đổi qua lại giữa các cặp (vd. không vừa dùng "tớ/cậu" vừa "tôi/cậu" vừa "mình" trong cùng một bài). Xác định trước 2 điều: (a) 我 đang nói VỚI AI — người yêu/bạn cụ thể, người nghe chung chung, hay không nói với ai (tự sự); (b) giọng điệu — trẻ trung/dễ thương hay chín chắn/trầm lắng. Rồi chọn theo bảng sau:
  - Có đối tượng cụ thể là người yêu, trẻ trung/dễ thương → "tớ - cậu" hoặc "mình - cậu"
  - Có đối tượng cụ thể là người yêu, lãng mạn/chín chắn/sâu lắng → "anh - em" hoặc "em - anh" (theo giới tính người hát nếu suy ra được từ lời)
  - Có đối tượng cụ thể là bạn bè thân → "tớ - cậu" hoặc "mình - bạn"
  - Có đối tượng là cha/mẹ/con cái, người thân trong gia đình → xưng hô gia đình đúng vai (con/cha/mẹ...), KHÔNG dùng cặp tình yêu
  - Không có đối tượng cụ thể, tự sự/suy tư/triết lý về cuộc sống hoặc tình yêu nói chung → "tôi"
  - Nói với người nghe nói chung mang tính cổ vũ/truyền cảm hứng (không phải 1 người yêu/bạn cụ thể) → "tôi" xưng mình, "bạn" gọi người nghe
  - 我们: dịch "chúng ta" nếu gồm cả người nghe/đối tượng đang nói tới (phổ biến hơn trong lời nhạc), "chúng tôi" nếu rõ ràng loại trừ người nghe.
  Có thể để trống đại từ khi câu không nói thẳng ai với ai.
- KHÔNG ghi pinyin, cấp HSK hay âm Hán Việt cho từ vựng (hệ thống tự tra từ điển).`;
}
