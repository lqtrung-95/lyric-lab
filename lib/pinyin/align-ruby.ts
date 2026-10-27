/** Chữ Hán (một chữ, nằm trong BMP nên chỉ số chuỗi trùng chỉ số chữ). */
const HAN = /\p{Script=Han}/u;
/** Âm tiết pinyin hoặc chữ cái Latin (có chữ cái). Dấu câu và số không có chữ cái. */
const HAS_LETTER = /\p{L}/u;

/**
 * Chia pinyin cả câu (từ từ điển, âm tiết cách nhau bằng dấu cách, dấu câu thành token riêng) thành pinyin từng chữ, để vẽ ngay dưới chữ.
 * Trả mảng cùng độ dài với `zh`: mỗi chữ Hán có một âm tiết, ký tự khác là "" (dấu câu, số, khoảng trắng). Trả null nếu số âm tiết không khớp số chữ Hán
 * (khi đó người dùng thấy dòng pinyin cả câu như trước).
 */
export function alignPinyin(zh: string, pinyin: string | undefined): string[] | null {
  if (!pinyin) return null;
  const tokens = pinyin.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let t = 0;
  for (const ch of zh) {
    if (ch.length !== 1) return null; // ký tự ngoài BMP: không căn được theo chỉ số
    if (HAN.test(ch)) {
      const tok = tokens[t++];
      if (!tok || !HAS_LETTER.test(tok)) return null;
      out.push(tok);
      continue;
    }
    // Ký tự không phải chữ Hán: nếu token kế tiếp là chính nó hoặc là dấu câu/số (không chữ cái) thì dùng token đó.
    const next = tokens[t];
    if (next !== undefined && (next === ch || !HAS_LETTER.test(next))) t++;
    out.push("");
  }
  // Còn token thừa mà là âm tiết thì lệch số lượng.
  if (tokens.slice(t).some((tok) => HAS_LETTER.test(tok))) return null;
  return out;
}
