import { cleanSavedMeaning } from "@/lib/lookup/clean-saved-meaning";
import type { SavedItem } from "@/lib/user-state/learner-state";

/**
 * Dạy pet: pet "chưa biết" một từ trong bộ thẻ của người dùng, người dùng chọn nghĩa đúng để dạy (học bằng cách dạy lại).
 * Pet nhớ từ theo mức 1–3; lâu không được dạy lại thì pet quên (mức càng cao nhớ càng lâu). Không ghi XP, không đụng lịch FSRS.
 */
export interface TaughtWord { term: string; pinyin: string | null; meaning: string; taughtAt: number; lastAt: number; level: number }

export const PET_TAUGHT_KEY = "lyric-lab-pet-taught";
export const PET_TAUGHT_EVENT = "lyric-lab-pet-taught";
export const TEACH_ROUND = 3;
export const TEACH_MAX_LEVEL = 3;
/** Số ngày pet nhớ một từ theo mức (chỉ số = mức - 1): quá ngần đó ngày chưa được dạy lại thì quên. */
export const FORGET_AFTER_DAYS = [3, 7, 14] as const;
const MEANING_MAX = 40;
const DAY_MS = 86_400_000;

/** Từ ứng viên để dạy: thẻ đã lưu có chữ và nghĩa dùng được. */
export interface TeachCandidate { term: string; pinyin: string | null; meaning: string }

export function candidatesFromSaved(saved: readonly SavedItem[]): TeachCandidate[] {
  const out: TeachCandidate[] = [];
  const seen = new Set<string>();
  for (const s of saved) {
    const term = s.term?.trim();
    const raw = cleanSavedMeaning(s.meaning ?? "", term ?? "").trim();
    if (s.type !== "vocab" || !term || !raw || seen.has(term)) continue;
    seen.add(term);
    out.push({ term, pinyin: s.reading?.trim() || null, meaning: [...raw].length > MEANING_MAX ? `${[...raw].slice(0, MEANING_MAX - 1).join("")}…` : raw });
  }
  return out;
}

export function parseTaught(raw: unknown): TaughtWord[] {
  if (!Array.isArray(raw)) return [];
  const out: TaughtWord[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    const taughtAt = num(o.taughtAt), lastAt = num(o.lastAt), level = num(o.level);
    if (typeof o.term !== "string" || !o.term || typeof o.meaning !== "string" || !o.meaning || taughtAt === null || lastAt === null || level === null) continue;
    out.push({ term: o.term, meaning: o.meaning, pinyin: typeof o.pinyin === "string" && o.pinyin ? o.pinyin : null, taughtAt, lastAt, level: Math.min(TEACH_MAX_LEVEL, Math.max(1, Math.round(level))) });
  }
  return out;
}

/** Pet đã quên từ này chưa (quá hạn nhớ của mức hiện tại kể từ lần dạy gần nhất). */
export const isForgotten = (w: TaughtWord, now: number): boolean => now - w.lastAt > FORGET_AFTER_DAYS[w.level - 1] * DAY_MS;

export const forgottenWords = (taught: readonly TaughtWord[], now: number): TaughtWord[] => taught.filter((w) => isForgotten(w, now));

/** Dạy đúng: thêm từ mới ở mức 1, hoặc dạy lại thì lên một mức (tối đa 3) và làm mới lần nhớ. */
export function applyTeach(taught: readonly TaughtWord[], word: TeachCandidate, now: number): TaughtWord[] {
  const at = taught.find((w) => w.term === word.term);
  if (!at) return [...taught, { term: word.term, pinyin: word.pinyin, meaning: word.meaning, taughtAt: now, lastAt: now, level: 1 }];
  // Quên rồi mà dạy lại thì chỉ nhớ lại (giữ mức); còn nhớ mà được ôn thêm thì lên mức.
  const level = isForgotten(at, now) ? at.level : Math.min(TEACH_MAX_LEVEL, at.level + 1);
  return taught.map((w) => (w.term === word.term ? { ...w, meaning: word.meaning, pinyin: word.pinyin ?? w.pinyin, lastAt: now, level } : w));
}

export interface TeachQuestion { word: TeachCandidate; options: string[]; answer: number }

/** Hoán vị cố định theo `seed` (kiểm thử được, không giật giữa các lần vẽ). */
function shuffled<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = Math.abs(Math.trunc(seed)) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Câu hỏi dạy tiếp theo: ưu tiên từ pet đã quên, rồi từ pet chưa biết, rồi từ lâu nhất chưa dạy lại; bỏ các từ trong `skip` (đã hỏi trong lần này).
 * 3 đáp án = nghĩa đúng + 2 nghĩa khác của các thẻ còn lại (khác nhau). Cần ít nhất 3 nghĩa khác nhau, nếu không thì null.
 */
export function nextTeachQuestion(pool: readonly TeachCandidate[], taught: readonly TaughtWord[], skip: ReadonlySet<string>, now: number, seed: number): TeachQuestion | null {
  if (new Set(pool.map((p) => p.meaning)).size < 3) return null;
  const byTerm = new Map(taught.map((w) => [w.term, w]));
  const rank = (c: TeachCandidate) => {
    const t = byTerm.get(c.term);
    return !t ? 1 : isForgotten(t, now) ? 0 : 2 + t.lastAt / 1e15;
  };
  const open = pool.filter((c) => !skip.has(c.term));
  if (open.length === 0) return null;
  const best = Math.min(...open.map(rank));
  const tied = open.filter((c) => rank(c) === best);
  const word = shuffled(tied, seed)[0];
  const distractors = shuffled([...new Set(pool.filter((p) => p.meaning !== word.meaning).map((p) => p.meaning))], seed + 7).slice(0, 2);
  if (distractors.length < 2) return null;
  const options = shuffled([word.meaning, ...distractors], seed + 13);
  return { word, options, answer: options.indexOf(word.meaning) };
}
