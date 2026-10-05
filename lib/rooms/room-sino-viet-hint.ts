const HAN = /\p{Script=Han}/u;

/** Các chữ Hán (dạng phồn thể) cần tra trong bảng âm Hán-Việt để dựng gợi ý cho một dòng. */
export function hanCharsForHint(parts: string[], toTraditional: (s: string) => string): string[] {
  return [...new Set(parts.flatMap((p) => [...toTraditional(p)]).filter((ch) => HAN.test(ch)))];
}

function readPart(text: string, readings: ReadonlyMap<string, string[]>): string[] | null {
  const words: string[] = [];
  for (const ch of text) {
    if (!HAN.test(ch)) continue; // dấu câu và khoảng trắng bỏ qua
    const r = readings.get(ch)?.[0];
    if (!r) return null; // thiếu một chữ thì không đoán
    words.push(r);
  }
  return words;
}

/**
 * Âm Hán-Việt của dòng với ô trống thay bằng "[…]", vd. "Cứu toán lộ tái […] ngã dã bất phạ". Chỉ trả khi mọi chữ Hán
 * (ngoài ô trống) đều có âm trong bảng; thiếu chữ nào thì null để giao diện bỏ gợi ý thay vì hiện sai.
 */
export function sinoVietLineHint(
  before: string,
  after: string,
  readings: ReadonlyMap<string, string[]>,
  toTraditional: (s: string) => string,
): string | null {
  const b = readPart(toTraditional(before), readings);
  const a = readPart(toTraditional(after), readings);
  if (!b || !a) return null;
  const text = [...b, "[…]", ...a].join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
