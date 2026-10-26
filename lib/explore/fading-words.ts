import { progressKey, isFaded, type ExploreProgress } from "./explore-progress";
import type { SceneDef } from "./explore-types";

/** Số từ đang "phai" (lâu không gặp, cần ôn) ở từng cảnh; chỉ tính từ còn trong cảnh. Cảnh không có từ phai thì không có khóa. */
export function fadingByScene(progress: ExploreProgress, scenes: readonly Pick<SceneDef, "id" | "objects">[], now: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of scenes) {
    const n = s.objects.filter((o) => isFaded(progress, progressKey(s.id, o.id), now)).length;
    if (n > 0) out[s.id] = n;
  }
  return out;
}

/** Cảnh có nhiều từ phai nhất (để đưa người chơi tới cứu trước); null nếu chưa có từ nào phai. */
export function mostFadingScene(counts: Record<string, number>): string | null {
  let best: string | null = null;
  for (const [id, n] of Object.entries(counts)) if (!best || n > counts[best]) best = id;
  return best;
}

export const totalFading = (counts: Record<string, number>): number => Object.values(counts).reduce((a, b) => a + b, 0);
