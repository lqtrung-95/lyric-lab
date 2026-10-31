import type { GrammarPattern } from "@/lib/grammar/grammar-types";

export interface SceneLite { id: string; title: string; objects: { term: string }[] }
export interface SceneSuggestion { id: string; title: string; shared: string[] }

/** Cấp HSK của khóa từ slug ("hsk-3" → 3); null nếu không phải khóa HSK. */
export function courseLevel(slug: string): number | null {
  const m = /^hsk-?(\d)$/.exec(slug);
  return m ? Math.min(6, Math.max(1, Number(m[1]))) : null;
}

/**
 * Cảnh Khám phá có vật mang các từ của chặng: chỉ gợi ý khi trùng ít nhất `minShared` từ (một từ trùng là chưa đủ để nói "cảnh này hợp bài vừa học"),
 * nhiều từ trùng nhất lên đầu, ngang nhau thì cảnh có ít vật hơn (tập trung hơn) trước.
 */
export function suggestScenes(terms: readonly string[], scenes: readonly SceneLite[], max = 2, minShared = 2): SceneSuggestion[] {
  const want = new Set(terms);
  return scenes
    .map((s) => ({ s, shared: [...new Set(s.objects.map((o) => o.term).filter((t) => want.has(t)))] }))
    .filter((x) => x.shared.length >= minShared)
    .sort((a, b) => b.shared.length - a.shared.length || a.s.objects.length - b.s.objects.length)
    .slice(0, max)
    .map((x) => ({ id: x.s.id, title: x.s.title, shared: x.shared }));
}

export interface GrammarSuggestion { pattern: GrammarPattern; sentence: string }

/**
 * Mẫu ngữ pháp nhận ra trong các câu thật của chặng, không cao hơn cấp khóa quá một bậc (người học HSK 1 chưa cần 虽然…但是 cấp 3); mẫu gặp ở nhiều câu nhất lên đầu,
 * kèm một câu làm ví dụ. `detect` do nơi gọi truyền vào để thư viện mẫu chỉ nạp khi cần.
 */
export function suggestGrammar(sentences: readonly string[], level: number | null, detect: (text: string) => GrammarPattern[], max = 2): GrammarSuggestion[] {
  const found = new Map<string, { pattern: GrammarPattern; sentence: string; n: number }>();
  for (const text of sentences) {
    for (const p of detect(text)) {
      if (level !== null && p.level > level + 1) continue;
      const cur = found.get(p.id);
      if (cur) cur.n += 1; else found.set(p.id, { pattern: p, sentence: text, n: 1 });
    }
  }
  return [...found.values()].sort((a, b) => b.n - a.n || a.pattern.level - b.pattern.level).slice(0, max).map(({ pattern, sentence }) => ({ pattern, sentence }));
}
