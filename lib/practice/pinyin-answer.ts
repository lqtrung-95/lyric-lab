// So câu trả lời pinyin của người dùng với pinyin chuẩn của từ. Chấp nhận nhiều cách gõ:
// có dấu (nǐ hǎo), số thanh (ni3 hao3; thanh nhẹ có thể bỏ hoặc gõ 5), hoặc không thanh (ni hao).

export type PinyinResult = "exact" | "no-tone" | "wrong-tone" | "wrong";

const TONE_MARK = /[\u0300\u0301\u0304\u030c]/; // huyền, sắc, ngang, hỏi (grave, acute, macron, caron)
const TONE_MARKS = new RegExp(TONE_MARK.source, "g");
const TONE_VALUE: Record<string, number> = { "\u0304": 1, "\u0301": 2, "\u030c": 3, "\u0300": 4 };
const SEPARATORS = /[\s'’·\-]+/g;

const withoutMarks = (s: string) => s.normalize("NFD").replace(TONE_MARKS, "").normalize("NFC");
const syllablesOf = (pinyin: string) => pinyin.normalize("NFC").toLowerCase().split(SEPARATORS).filter(Boolean);

function toneOf(syllable: string): number {
  const mark = syllable.normalize("NFD").match(TONE_MARK)?.[0];
  return mark ? TONE_VALUE[mark] : 0;
}

/** So sánh không phân biệt thanh: bỏ dấu và số 1–4; ü, v, u coi như một chữ (gõ ü khó nên cho lỏng). */
const stripTones = (s: string) => withoutMarks(s).replace(/[1-4]/g, "").replace(/[üv]/g, "u");

/** Ba dạng của pinyin chuẩn để so: có dấu, số thanh (thanh nhẹ bỏ trống, ü → v) và không thanh. */
export function pinyinForms(pinyin: string): { marked: string; numeric: string; toneless: string } {
  const syllables = syllablesOf(pinyin);
  return {
    marked: syllables.join(""),
    numeric: syllables.map((s) => withoutMarks(s).replace(/ü/g, "v") + (toneOf(s) || "")).join(""),
    toneless: syllables.map(stripTones).join(""),
  };
}

/** Chuẩn hóa đầu vào: chữ thường, bỏ khoảng trắng và dấu ngăn, `u:` thành ü, bỏ số 5/0 (thanh nhẹ). */
const normalizeInput = (input: string) =>
  input.normalize("NFC").toLowerCase().replace(/u:/g, "ü").replace(SEPARATORS, "").replace(/[05]/g, "");

const hasToneInfo = (s: string) => /[1-4]/.test(s) || TONE_MARK.test(s.normalize("NFD"));

function checkOne(input: string, expected: string): PinyinResult {
  const s = normalizeInput(input);
  if (!s) return "wrong";
  const forms = pinyinForms(expected);
  if (s === forms.marked || s.replace(/ü/g, "v") === forms.numeric) return "exact";
  if (stripTones(s) !== forms.toneless) return "wrong";
  // Chữ cái đúng: phân biệt "không gõ thanh" với "gõ sai thanh".
  return hasToneInfo(s) ? "wrong-tone" : "no-tone";
}

const RANK: Record<PinyinResult, number> = { exact: 0, "no-tone": 1, "wrong-tone": 2, wrong: 3 };

/** So với một hoặc nhiều cách đọc hợp lệ (từ nhiều âm), lấy kết quả tốt nhất. */
export function checkPinyin(input: string, expected: string | string[]): PinyinResult {
  const list = Array.isArray(expected) ? expected : [expected];
  return list.map((e) => checkOne(input, e)).sort((a, b) => RANK[a] - RANK[b])[0] ?? "wrong";
}

/** Gợi ý theo cấp: 1 = số âm tiết, 2 = chữ cái đầu của mỗi âm tiết, 3 = pinyin không thanh. */
export function pinyinHint(pinyin: string, level: 1 | 2 | 3): string {
  const syllables = syllablesOf(pinyin);
  if (level === 1) return `${syllables.length} âm tiết`;
  if (level === 2) return syllables.map((s) => `${withoutMarks(s)[0]}…`).join(" ");
  return syllables.map(withoutMarks).join(" ");
}
