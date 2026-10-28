import { stripTermFromMeaning } from "./strip-term-from-meaning";

const QUOTED = /["“‘「『]([^"”’」』]+)["”’」』]/;
// "Ở câu này, từ này mang nghĩa là …", "Trong câu này nó có nghĩa là …", "Từ 笨拙 ở câu này mang nghĩa …"
const LEAD_IN = /^(?:(?:từ|chữ|cụm từ)\s+(?:này\s+)?)?(?:(?:ở|trong)\s+(?:câu|đoạn|ngữ cảnh|bài)\s+(?:này|đây)\s*[,:]?\s*)(?:(?:từ|chữ|cụm từ|nó)\s+(?:này\s+)?)?(?:(?:mang|có)\s+(?:nghĩa|ý nghĩa)(?:\s+là)?|nghĩa là|dùng để chỉ|được hiểu là)?\s*[,:]?\s*/iu;
const BARE_LEAD_IN = /^(?:(?:mang|có)\s+(?:nghĩa|ý nghĩa)(?:\s+là)?|nghĩa là)\s*[,:]?\s*/iu;

/**
 * Nghĩa để lưu vào thẻ từ: chỉ nghĩa đơn thuần như mục từ điển. Bỏ cụm dẫn nhập ("Ở câu này mang nghĩa là …"),
 * lấy phần nằm trong ngoặc kép nếu có, bỏ phần giải thích sau câu đầu tiên và chữ Hán của từ (không lộ đáp án ở bài tập).
 * Không còn gì sau khi làm sạch thì giữ nguyên bản gốc.
 */
export function cleanSavedMeaning(meaning: string, term = ""): string {
  const original = meaning.trim();
  let text = stripTermFromMeaning(original, term).replace(/\s+/g, " ").trim();
  const hadLeadIn = LEAD_IN.test(text) || BARE_LEAD_IN.test(text);
  text = text.replace(LEAD_IN, "").replace(BARE_LEAD_IN, "").trim();
  if (hadLeadIn) {
    const quoted = /^["“‘「『]/.test(text) ? QUOTED.exec(text) : null;
    text = quoted ? quoted[1] : (text.split(/(?<=[.!?。])\s+/)[0] ?? text);
  }
  text = text.replace(/^["“‘「『]+|["”’」』]+$/g, "").replace(/[.。\s]+$/, "").trim();
  return text || original;
}
