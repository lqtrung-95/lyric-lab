import type { HanVietWord } from "./han-viet-words";
import { seededRng } from "./seeded-rng";

export const HAN_VIET_ROUNDS = 10;
const OPTIONS = 4;

export interface HanVietQuestion { word: HanVietWord; options: string[]; answer: number }

const shuffle = <T,>(items: readonly T[], rng: () => number): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

/**
 * Bộ câu theo hạt giống: cùng hạt giống và cùng kho từ thì cùng bộ câu (để bạn bè chơi đúng cùng đề). Đáp án ưu tiên từ "cognate" (Hán Việt quen thuộc)
 * khi đủ nhiều; 3 đáp án gây nhiễu ưu tiên từ cùng chung một chữ với đáp án (dễ nhầm), rồi mới tới từ bất kỳ, và không trùng âm Hán Việt với đáp án.
 * Trả mảng ngắn hơn `n` nếu kho quá nhỏ; rỗng nếu chưa đủ 4 từ.
 */
export function makeHanVietQuiz(pool: readonly HanVietWord[], seed: string, n = HAN_VIET_ROUNDS): HanVietQuestion[] {
  const sorted = [...pool].sort((a, b) => a.han.localeCompare(b.han));
  if (sorted.length < OPTIONS) return [];
  const rng = seededRng(seed);
  const cognates = sorted.filter((w) => w.cognate);
  const source = cognates.length >= n * 3 ? cognates : sorted;
  const answers = shuffle(source, rng).slice(0, Math.min(n, source.length));
  return answers.map((word) => {
    const others = sorted.filter((w) => w.han !== word.han && w.sinoViet !== word.sinoViet);
    const near = shuffle(others.filter((w) => [...w.han].some((c) => word.han.includes(c))), rng);
    const far = shuffle(others.filter((w) => !near.includes(w)), rng);
    const options = shuffle([word.han, ...[...near, ...far].slice(0, OPTIONS - 1).map((w) => w.han)], rng);
    return { word, options, answer: options.indexOf(word.han) };
  });
}

/** Danh hiệu theo tỉ lệ đúng (hiện trên thẻ chia sẻ). */
export function hanVietTitle(score: number, total: number): string {
  const r = total > 0 ? score / total : 0;
  return r >= 0.9 ? "Cao thủ Hán Việt" : r >= 0.7 ? "Dân Hán Việt chính hiệu" : r >= 0.5 ? "Biết kha khá" : "Mới nhập môn";
}
