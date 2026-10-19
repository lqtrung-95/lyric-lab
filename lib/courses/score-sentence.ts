// Chấm điểm một dòng video làm câu ví dụ cho một từ HSK: câu ngắn vừa phải, có bản dịch, từ đích đứng nguyên thành một từ,
// các từ còn lại không khó hơn nhiều so với cấp của từ đích. Trả null khi câu không dùng được.
export interface SentenceCandidate {
  text: string;
  translation: string | null;
  tokens: { text: string }[];
}

export interface ScoreContext {
  term: string;
  /** Cấp HSK của từ đích (1-6; 7 = nhóm 7-9). */
  termLevel: number;
  /** Cấp HSK của một từ; undefined khi không thuộc danh sách HSK (tên riêng, từ hiếm). */
  levelOf: (word: string) => number | undefined;
}

const HAN_GLOBAL = /\p{Script=Han}/gu;
const HAS_HAN = /\p{Script=Han}/u;
export const MIN_SENTENCE_CHARS = 4;
export const MAX_SENTENCE_CHARS = 16;
const IDEAL_CHARS = 8;
const MAX_TRANSLATION_CHARS = 70;
/** Từ khó hơn cấp đích quá mức này (số cấp) thì tính là "khó". */
const LEVEL_SLACK = 1;

// Chỉ những từ chắc chắn không hợp làm câu ví dụ cho người mới; người duyệt vẫn là chốt cuối.
const BLOCKED = ["他妈的", "妈的", "操", "傻逼", "去死", "混蛋", "王八蛋", "滚蛋"];

export function scoreSentence(c: SentenceCandidate, ctx: ScoreContext): number | null {
  const translation = c.translation?.trim() ?? "";
  if (!translation) return null;
  const length = c.text.match(HAN_GLOBAL)?.length ?? 0;
  if (length < MIN_SENTENCE_CHARS || length > MAX_SENTENCE_CHARS) return null;
  if (!c.tokens.some((t) => t.text === ctx.term)) return null;
  if (BLOCKED.some((w) => c.text.includes(w))) return null;

  const others = c.tokens.filter((t) => t.text !== ctx.term && HAS_HAN.test(t.text));
  // Từ ngoài danh sách HSK (tên riêng, từ hiếm) bị phạt nửa mức so với từ chắc chắn khó.
  const burden = others.reduce((sum, t) => {
    const level = ctx.levelOf(t.text);
    return sum + (level === undefined ? 0.5 : level > ctx.termLevel + LEVEL_SLACK ? 1 : 0);
  }, 0);
  const difficulty = others.length === 0 ? 0 : burden / others.length;

  let score = 100;
  score -= Math.abs(length - IDEAL_CHARS) * 3;
  score -= difficulty * 45;
  if (translation.length > MAX_TRANSLATION_CHARS) score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface ScoredLine { videoId: string; lineIdx: number; quality: number }

/** Giữ tối đa `perTerm` câu tốt nhất, ưu tiên đa dạng video (mỗi video một câu trước, rồi mới lấy thêm). */
export function pickDiverse(lines: ScoredLine[], perTerm: number): ScoredLine[] {
  const sorted = [...lines].sort((a, b) => b.quality - a.quality || a.videoId.localeCompare(b.videoId) || a.lineIdx - b.lineIdx);
  const picked: ScoredLine[] = [];
  const seen = new Set<string>();
  for (const l of sorted) if (picked.length < perTerm && !seen.has(l.videoId)) { picked.push(l); seen.add(l.videoId); }
  for (const l of sorted) if (picked.length < perTerm && !picked.includes(l)) picked.push(l);
  return picked;
}
