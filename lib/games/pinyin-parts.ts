import { pinyinForms } from "@/lib/practice/pinyin-answer";

/** Một âm tiết tách thành phụ âm đầu, vần và thanh (1–5; 5 = thanh nhẹ). */
export interface Syl { initial: string; final: string; tone: number }
/** `unk`: người chơi không gõ thanh nên chưa có thông tin về thanh ở âm tiết đó. */
export type Mark = "hit" | "near" | "miss" | "unk";

const INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"];
const FINALS = new Set(("a o e i u v ai ei ao ou an en ang eng ong ia ie iao iu ian in iang ing iong ua uo uai ui uan un uang ue er").split(" "));
const FRONT = new Set(["j", "q", "x", "y"]);
const FRONT_FINAL: Record<string, string> = { v: "u", ve: "ue", van: "uan", vn: "un" };

/**
 * Tách "peng2" thành {p, eng, 2}; null nếu không phải âm tiết pinyin hợp lệ. ü gõ là v hoặc u: sau j/q/x/y viết u (ju, xue), còn lại v (nv, lv).
 * `tone` thiếu thì dùng `defaultTone` (null = bắt buộc có số thanh).
 */
export function parseSyllable(raw: string, defaultTone: number | null): Syl | null {
  const m = raw.normalize("NFC").toLowerCase().replace(/u:|ü/g, "v").trim().match(/^([a-z]+)([1-5])?$/);
  if (!m) return null;
  const tone = m[2] ? Number(m[2]) : defaultTone;
  if (tone === null) return null;
  const body = m[1];
  const initial = INITIALS.find((i) => body.startsWith(i) && FINALS.has(canonFinal(i, body.slice(i.length)))) ?? "";
  const final = canonFinal(initial, body.slice(initial.length));
  return FINALS.has(final) ? { initial, final, tone } : null;
}

function canonFinal(initial: string, final: string): string {
  if (FRONT.has(initial) && final in FRONT_FINAL) return FRONT_FINAL[final];
  return final === "ve" ? "ue" : final;
}

/** Các âm tiết của một từ từ pinyin có dấu ("péng yǒu"); null nếu có âm tiết không tách được. */
export function syllablesOf(pinyin: string): Syl[] | null {
  const parts = pinyin.normalize("NFC").trim().split(/[\s'’·-]+/).filter(Boolean);
  const out = parts.map((p) => parseSyllable(pinyinForms(p).numeric, 5));
  return out.every((s): s is Syl => s !== null) ? out : null;
}

/** Chấm kiểu Wordle cho một dãy giá trị: xanh = đúng vị trí, vàng = có nhưng sai vị trí (tính theo số lượng), xám = không có. */
export function wordleMarks<T>(answer: readonly T[], guess: readonly T[]): Mark[] {
  const marks: Mark[] = guess.map(() => "miss");
  const left = new Map<T, number>();
  guess.forEach((g, i) => {
    if (g === answer[i]) marks[i] = "hit";
    else left.set(answer[i], (left.get(answer[i]) ?? 0) + 1);
  });
  guess.forEach((g, i) => {
    if (marks[i] === "hit") return;
    const n = left.get(g) ?? 0;
    if (n > 0) { marks[i] = "near"; left.set(g, n - 1); }
  });
  return marks;
}

export interface GuessMarks { initial: Mark[]; final: Mark[]; tone: Mark[] }

/** Chấm một lượt đoán: phụ âm đầu, vần, thanh được chấm riêng từng nhóm (như Pinyle). */
export function scoreGuess(answer: readonly Syl[], guess: readonly Syl[]): GuessMarks {
  const tone = wordleMarks(answer.map((s) => s.tone), guess.map((s) => s.tone)).map((m, i): Mark => (guess[i].tone === 0 ? "unk" : m));
  return {
    initial: wordleMarks(answer.map((s) => s.initial), guess.map((s) => s.initial)),
    final: wordleMarks(answer.map((s) => s.final), guess.map((s) => s.final)),
    tone,
  };
}

export const isSolved = (m: GuessMarks): boolean => [...m.initial, ...m.final, ...m.tone].every((x) => x === "hit");

const EMOJI: Record<Mark, string> = { hit: "🟩", near: "🟨", miss: "⬛", unk: "⬜" };

/** Một hàng kết quả để chia sẻ (không lộ đáp án): mỗi âm tiết ba ô, các âm tiết cách nhau một khoảng trắng. */
export function shareRow(m: GuessMarks): string {
  return m.initial.map((_, i) => EMOJI[m.initial[i]] + EMOJI[m.final[i]] + EMOJI[m.tone[i]]).join(" ");
}
