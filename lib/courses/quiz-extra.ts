/** Phần thuần của các dạng bài ngoài trắc nghiệm: cắt câu thành mảnh để sắp xếp, và so khớp pinyin người học gõ. */

const PUNCT = /[，,。.!?！？、；;：:"“”‘’()（）\s…—\-]/g;
const MIN_CHUNKS = 3;
const MAX_CHUNKS = 8;
const MAX_CHARS = 16;

/** Câu không dấu câu (để so sánh thứ tự các mảnh). */
export const stripPunctuation = (text: string): string => text.replace(PUNCT, "");

/**
 * Cắt một câu thành các mảnh theo thứ tự đúng để người học ghép lại: ưu tiên khớp các từ đã biết (dài nhất trước), phần còn lại cắt từng cặp chữ.
 * Bỏ dấu câu. Trả null nếu câu quá ngắn/dài hoặc ra quá ít/nhiều mảnh (không thành bài sắp xếp hay).
 */
export function chunkSentence(text: string, terms: readonly string[]): string[] | null {
  const s = stripPunctuation(text);
  if (s.length < 4 || s.length > MAX_CHARS) return null;
  const known = [...new Set(terms)].filter((t) => t.length >= 2).sort((a, b) => b.length - a.length);
  const chunks: string[] = [];
  let run = "";
  const flush = () => {
    for (let i = 0; i < run.length; i += 2) chunks.push(run.slice(i, i + 2));
    run = "";
  };
  for (let i = 0; i < s.length; ) {
    const hit = known.find((t) => s.startsWith(t, i));
    if (hit) { flush(); chunks.push(hit); i += hit.length; } else { run += s[i]; i++; }
  }
  flush();
  return chunks.length >= MIN_CHUNKS && chunks.length <= MAX_CHUNKS ? chunks : null;
}

const TONES: Record<string, [string, number]> = {
  ā: ["a", 1], á: ["a", 2], ǎ: ["a", 3], à: ["a", 4], ē: ["e", 1], é: ["e", 2], ě: ["e", 3], è: ["e", 4],
  ī: ["i", 1], í: ["i", 2], ǐ: ["i", 3], ì: ["i", 4], ō: ["o", 1], ó: ["o", 2], ǒ: ["o", 3], ò: ["o", 4],
  ū: ["u", 1], ú: ["u", 2], ǔ: ["u", 3], ù: ["u", 4], ǖ: ["v", 1], ǘ: ["v", 2], ǚ: ["v", 3], ǜ: ["v", 4],
};

/** Tách pinyin thành phần chữ cái (ü → v, bỏ khoảng trắng và dấu nháy) và danh sách thanh theo thứ tự (từ dấu trên nguyên âm hoặc số 1-4; thanh nhẹ/số 0,5 bỏ qua). */
export function parsePinyin(p: string): { base: string; tones: string } {
  let base = "";
  let tones = "";
  for (const ch of p.toLowerCase().normalize("NFC")) {
    const mark = TONES[ch];
    if (mark) { base += mark[0]; tones += mark[1]; }
    else if (ch === "ü") base += "v";
    else if (/[a-z]/.test(ch)) base += ch;
    else if (/[1-4]/.test(ch)) tones += ch;
  }
  return { base, tones };
}

/** Chỉ phần chữ cái của pinyin (bỏ mọi thanh điệu). */
export const basePinyin = (p: string): string => parsePinyin(p).base;

export type PinyinCheck = "exact" | "toneless" | "wrong";

/**
 * So pinyin gõ vào với pinyin đúng. "exact": đúng âm và đúng các thanh (gõ dấu hoặc số); "toneless": đúng âm nhưng chưa gõ thanh nào (vẫn tính đúng, kèm nhắc thanh);
 * "wrong": sai âm hoặc có gõ thanh nhưng sai.
 */
export function checkPinyinInput(input: string, expected: string): PinyinCheck {
  const typed = parsePinyin(input);
  const answer = parsePinyin(expected);
  if (!typed.base || typed.base !== answer.base) return "wrong";
  if (typed.tones === answer.tones) return "exact";
  return typed.tones === "" ? "toneless" : "wrong";
}
