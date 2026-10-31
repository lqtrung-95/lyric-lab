import type { GrammarStats } from "@/lib/grammar/grammar-stats";
import { weakPatternIds } from "@/lib/grammar/grammar-stats";
import type { RadicalProgress } from "@/lib/radicals/radicals-progress";
import { weakRadicals } from "@/lib/radicals/radicals-progress";

export type WeakKind = "vocab" | "grammar" | "radical" | "course";
export interface WeakCounts { vocab: number; grammar: number; radical: number; course: number }

/** Số mục yếu của từng nhóm (tách riêng để test và để màn tổng hợp, thẻ gợi ý dùng chung một cách đếm). */
export function weakCounts(input: { hardWords: number; grammar: GrammarStats; radicals: RadicalProgress; courseTerms: number }): WeakCounts {
  return { vocab: input.hardWords, grammar: weakPatternIds(input.grammar, 50).length, radical: weakRadicals(input.radicals, 50).length, course: input.courseTerms };
}

export interface WeakAdvice { kind: WeakKind; title: string; href: string; reason: string }

/** Việc nên làm trước: nhóm có nhiều mục yếu nhất (ngang nhau thì theo thứ tự từ vựng, ngữ pháp, bộ thủ, lộ trình); null khi không có mục yếu nào. */
export function pickAdvice(c: WeakCounts): WeakAdvice | null {
  const order: WeakKind[] = ["vocab", "grammar", "radical", "course"];
  const top = order.reduce<WeakKind | null>((best, k) => (c[k] > 0 && (best === null || c[k] > c[best]) ? k : best), null);
  if (!top) return null;
  const n = c[top];
  const advice: Record<WeakKind, Omit<WeakAdvice, "kind" | "reason">> = {
    vocab: { title: "Luyện từ khó", href: "/review/hard" },
    grammar: { title: "Ôn mẫu ngữ pháp hay sai", href: "/grammar" },
    radical: { title: "Luyện các bộ thủ hay nhầm", href: "/radicals/practice?source=weak" },
    course: { title: "Ôn từ hay sai ở lộ trình", href: "/courses" },
  };
  const unit: Record<WeakKind, string> = { vocab: "từ khó", grammar: "mẫu ngữ pháp", radical: "bộ thủ", course: "từ ở lộ trình" };
  return { kind: top, ...advice[top], reason: `Bạn đang có ${n} ${unit[top]} hay sai, nhiều nhất trong các mục.` };
}
