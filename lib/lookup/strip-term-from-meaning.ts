const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const OPEN = "[\"'“‘「『]?";
const CLOSE = "[\"'”’」』]?";

/**
 * Bỏ chữ Hán của từ khỏi nghĩa giải thích: nghĩa được hiện làm gợi ý trong các bài luyện tập nên không được lộ đáp án.
 * "Từ “失去” ở câu này mang nghĩa…" → "Ở câu này mang nghĩa…"; chữ Hán còn sót ở chỗ khác được thay bằng "từ này".
 */
export function stripTermFromMeaning(meaning: string, term: string): string {
  if (!term) return meaning;
  const t = escapeRegExp(term);
  const stripped = meaning.replace(new RegExp(`^\\s*(?:Từ|Chữ|Cụm từ)\\s*${OPEN}${t}${CLOSE}\\s*`, "i"), "");
  const out = stripped.replace(new RegExp(`${OPEN}${t}${CLOSE}`, "g"), "từ này").replace(/\s+/g, " ").trim();
  if (out === meaning.trim()) return meaning; // không có chữ Hán: giữ nguyên, kể cả chữ hoa/thường
  return out ? out[0].toUpperCase() + out.slice(1) : meaning;
}
