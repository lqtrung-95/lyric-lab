import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { UnitProgress, UnitStatus } from "@/lib/courses/course-types";

interface Row { unit_id: string; status: UnitStatus; best_score: number; step_state: Record<string, unknown> | null; completed_at: string | null }
const toProgress = (r: Row): UnitProgress => ({ unitId: r.unit_id, status: r.status, bestScore: r.best_score, stepState: r.step_state ?? {}, completedAt: r.completed_at });

/** Tiến độ các bài của người dùng hiện tại. Trả rỗng nếu chưa có phiên hoặc lỗi (kể cả bảng chưa có vì migration chưa chạy), để lộ trình vẫn hiện, chỉ chưa ghi nhớ. */
export async function listUnitProgress(): Promise<UnitProgress[]> {
  try {
    if (!(await hasExistingSession())) return [];
    const { data, error } = await createSupabaseBrowserClient().from("user_unit_progress").select("unit_id,status,best_score,step_state,completed_at");
    return error ? [] : ((data ?? []) as Row[]).map(toProgress);
  } catch {
    return [];
  }
}

/** Gộp kết quả mới vào tiến độ cũ: điểm giữ mức cao nhất, đã hoàn thành thì không tụt về dở dang. Hàm thuần để test. */
export function mergeProgress(prev: UnitProgress | undefined, next: { status: UnitStatus; score: number; stepState?: Record<string, unknown> }, now = new Date()): Omit<UnitProgress, "unitId"> {
  const completed = prev?.status === "completed" || next.status === "completed";
  return {
    status: completed ? "completed" : "in_progress",
    bestScore: Math.max(prev?.bestScore ?? 0, Math.round(next.score)),
    stepState: next.stepState ?? prev?.stepState ?? {},
    completedAt: completed ? (prev?.completedAt ?? now.toISOString()) : null,
  };
}

/** Lưu tiến độ một bài (tạo phiên ẩn danh nếu cần). Trả true nếu ghi được; lỗi/bảng chưa có thì false và không ném lỗi. */
export async function saveUnitProgress(unitId: string, prev: UnitProgress | undefined, next: { status: UnitStatus; score: number; stepState?: Record<string, unknown> }): Promise<boolean> {
  try {
    if (!(await ensureAnonymousSession())) return false;
    const sb = createSupabaseBrowserClient();
    const userId = (await sb.auth.getSession()).data.session?.user.id;
    if (!userId) return false;
    const m = mergeProgress(prev, next);
    const { error } = await sb.from("user_unit_progress").upsert({
      user_id: userId, unit_id: unitId, status: m.status, best_score: m.bestScore, step_state: m.stepState, completed_at: m.completedAt, updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
