export interface ReviewSource { terms: string[]; glosses?: Record<string, string> }
export const CHECKPOINT_POOL = 30;
export const FINAL_POOL = 60;
export const CHECKPOINT_QUIZ_LENGTH = 20;
export const FINAL_QUIZ_LENGTH = 40;

type Random = () => number;

/**
 * Lấy mẫu từ cho chặng ôn: xoay vòng qua các chặng nguồn (mỗi vòng một từ ngẫu nhiên từ mỗi chặng) để chặng nào cũng có mặt, tới khi đủ `count` hoặc hết từ.
 * Trả danh sách từ (không trùng) cùng nghĩa tiếng Việt đã có của chúng. `random` truyền vào để test cố định.
 */
export function pickReviewTerms(sources: ReviewSource[], count: number, random: Random = Math.random): { terms: string[]; glosses: Record<string, string> } {
  const queues = sources.map((s) => {
    const a = [...new Set(s.terms)];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  });
  const terms: string[] = [];
  const seen = new Set<string>();
  for (let round = 0; terms.length < count && queues.some((q) => q.length > round); round++) {
    for (const q of queues) {
      const t = q[round];
      if (t && !seen.has(t) && terms.length < count) { seen.add(t); terms.push(t); }
    }
  }
  const glosses: Record<string, string> = {};
  for (const s of sources) for (const t of terms) if (s.glosses?.[t]) glosses[t] = s.glosses[t];
  return { terms, glosses };
}
