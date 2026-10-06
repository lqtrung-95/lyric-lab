import { alignPinyinToText } from "@/lib/rooms/align-pinyin";
import type { LessonLine } from "./video-lesson-types";

export type DictationMode = "pinyin" | "hanzi";
/** correct = đúng; tone = đúng chữ cái nhưng thiếu hoặc sai thanh (tính nửa điểm); wrong = sai; missing = chưa gõ tới. */
export type UnitStatus = "correct" | "tone" | "wrong" | "missing";

export interface DictationUnit {
  expected: string;
  status: UnitStatus;
}

export interface DictationResult {
  units: DictationUnit[];
  /** Ký tự gõ thừa (không khớp đơn vị nào). */
  extra: number;
  /** 0..1 */
  score: number;
}

const HAN = /\p{Script=Han}/u;
const MIN_HAN_CHARS = 3;
const TONE_MARKS: Record<string, number> = { "\u0304": 1, "\u0301": 2, "\u030c": 3, "\u0300": 4 };

const hanChars = (text: string) => [...text].filter((c) => HAN.test(c));

/** Các dòng đưa vào bài chép chính tả: bỏ dòng quá ngắn (tiếng đệm, "好的") vì không đủ để luyện nghe. */
export function dictationLines(lines: LessonLine[]): LessonLine[] {
  return lines.filter((l) => hanChars(l.text).length >= MIN_HAN_CHARS);
}

/** Đáp án chuẩn theo chế độ: từng chữ Hán, hoặc từng âm tiết pinyin (có dấu) của các chữ Hán đó. */
export function expectedUnits(line: LessonLine, mode: DictationMode): string[] {
  if (mode === "hanzi") return hanChars(line.text);
  const aligned = alignPinyinToText(line.text, line.pinyin);
  if (aligned) return aligned.flatMap((c) => (c.py ? [c.py.normalize("NFC").toLowerCase()] : []));
  // Pinyin lệch số chữ Hán: lấy các âm tiết không phải dấu câu.
  return line.pinyin.split(/\s+/).filter((t) => /\p{L}/u.test(t)).map((t) => t.normalize("NFC").toLowerCase());
}

/** Chữ cái gốc của một âm tiết: bỏ dấu thanh và số, ü/v coi như u (gõ ü khó nên cho lỏng). */
const baseOf = (s: string) => s.normalize("NFD").replace(/[\u0300-\u030f]/g, "").replace(/[0-9]/g, "").normalize("NFC").replace(/[üv]/g, "u").toLowerCase();

function toneOf(s: string): number {
  for (const ch of s.normalize("NFD")) if (TONE_MARKS[ch]) return TONE_MARKS[ch];
  return 0;
}

/** Chuẩn hóa pinyin gõ vào: chữ thường, `u:` thành ü, bỏ khoảng trắng và dấu ngăn, bỏ số 0/5 (thanh nhẹ). */
const normalizeTyped = (input: string) =>
  input.normalize("NFC").toLowerCase().replace(/u:/g, "ü").replace(/[^\p{L}\p{M}1-4]/gu, "");

function comparePinyin(typed: string, expected: string[]): DictationResult {
  let rest = normalizeTyped(typed);
  const units = expected.map((syllable): DictationUnit => {
    if (!rest) return { expected: syllable, status: "missing" };
    const base = baseOf(syllable);
    const tone = toneOf(syllable);
    // Thử dạng có số thanh (ni3) trước, rồi dạng chữ (có dấu hoặc không thanh).
    const withDigit = rest.slice(0, base.length + 1);
    if (withDigit.length === base.length + 1 && /[1-4]$/.test(withDigit) && baseOf(withDigit) === base) {
      rest = rest.slice(withDigit.length);
      return { expected: syllable, status: Number(withDigit.slice(-1)) === tone ? "correct" : "tone" };
    }
    const word = rest.slice(0, base.length);
    if (word.length === base.length && baseOf(word) === base) {
      rest = rest.slice(word.length);
      const typedTone = toneOf(word);
      return { expected: syllable, status: typedTone === tone && (tone !== 0 || word === word.normalize("NFD").replace(/[\u0300-\u030f]/g, "").normalize("NFC")) ? "correct" : "tone" };
    }
    rest = rest.slice(Math.min(base.length, rest.length));
    return { expected: syllable, status: "wrong" };
  });
  const weight = units.reduce((a, u) => a + (u.status === "correct" ? 1 : u.status === "tone" ? 0.5 : 0), 0);
  return { units, extra: rest.length > 0 ? 1 : 0, score: expected.length === 0 ? 0 : weight / expected.length };
}

/** Khớp dài nhất giữa hai chuỗi chữ (đánh dấu các vị trí của `a` được khớp), để thiếu hoặc thừa một chữ không làm sai cả phần sau. */
function lcsMatches(a: string[], b: string[]): boolean[] {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const matched = new Array<boolean>(a.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { matched[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return matched;
}

function compareHanzi(typed: string, expected: string[]): DictationResult {
  const got = hanChars(typed.normalize("NFC"));
  const matched = lcsMatches(expected, got);
  const hits = matched.filter(Boolean).length;
  const units = expected.map((c, i): DictationUnit => ({ expected: c, status: matched[i] ? "correct" : got.length === 0 ? "missing" : "wrong" }));
  const extra = got.length - hits;
  return { units, extra, score: expected.length === 0 ? 0 : hits / Math.max(expected.length, got.length) };
}

/** So câu gõ với đáp án của dòng theo chế độ. Pinyin chấp nhận có dấu, số thanh (ni3 hao3), hoặc không thanh (nửa điểm). */
export function compareDictation(typed: string, line: LessonLine, mode: DictationMode): DictationResult {
  const expected = expectedUnits(line, mode);
  return mode === "hanzi" ? compareHanzi(typed, expected) : comparePinyin(typed, expected);
}

/** Đạt khi không đơn vị nào sai hoặc thiếu và không gõ thừa; thiếu hoặc sai thanh điệu vẫn được (chỉ bị trừ điểm). */
export const isPassing = (r: DictationResult) => r.extra === 0 && r.units.every((u) => u.status === "correct" || u.status === "tone");
