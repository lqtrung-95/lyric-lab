import { ensureAnonymousSession, hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { UnitProgress, UnitStatus } from "@/lib/courses/course-types";

interface Row { unit_id: string; status: UnitStatus; best_score: number; step_state: Record<string, unknown> | null; completed_at: string | null }
const toProgress = (r: Row): UnitProgress => ({ unitId: r.unit_id, status: r.status, bestScore: r.best_score, stepState: r.step_state ?? {}, completedAt: r.completed_at });

const LOCAL_KEY = "songhanzi-unit-progress-local-v1";

/** Hợp hai bản tiến độ của cùng một bài theo hướng chỉ tăng: hoàn thành nếu một bên hoàn thành, điểm và điểm từng cấp lấy mức cao nhất. Hàm thuần để test. */
export function mergeProgressStates(a: UnitProgress | undefined, b: UnitProgress | undefined): UnitProgress | undefined {
  if (!a) return b;
  if (!b) return a;
  const levels: Record<string, number> = {};
  for (const src of [a.stepState?.levels, b.stepState?.levels]) {
    if (src && typeof src === "object" && !Array.isArray(src)) for (const [k, v] of Object.entries(src as Record<string, unknown>)) if (typeof v === "number") levels[k] = Math.max(levels[k] ?? 0, v);
  }
  const completed = a.status === "completed" || b.status === "completed";
  return {
    unitId: a.unitId,
    status: completed ? "completed" : "in_progress",
    bestScore: Math.max(a.bestScore, b.bestScore),
    stepState: { ...a.stepState, ...b.stepState, ...(Object.keys(levels).length > 0 ? { levels } : {}) },
    completedAt: a.completedAt ?? b.completedAt,
  };
}

/** Bản dự phòng trên thiết bị: chỉ ghi khi lưu lên máy chủ thất bại (không có phiên, bị chặn captcha, mất mạng), để người học chưa đăng nhập vẫn học tiếp được cấp sau. Mất khi xóa dữ liệu trình duyệt. */
function readLocal(): Record<string, UnitProgress> {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}") as unknown;
    return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, UnitProgress>) : {};
  } catch {
    return {};
  }
}
function writeLocal(all: Record<string, UnitProgress>): void {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(all)); } catch { /* đầy bộ nhớ hoặc bị chặn: bỏ qua */ }
}

/** Tiến độ các bài của người dùng hiện tại, hợp với bản dự phòng trên thiết bị (nếu có). Trả rỗng nếu chưa có phiên hoặc lỗi (kể cả bảng chưa có vì migration chưa chạy), để lộ trình vẫn hiện. */
export async function listUnitProgress(): Promise<UnitProgress[]> {
  let remote: UnitProgress[] = [];
  try {
    if (await hasExistingSession()) {
      const { data, error } = await createSupabaseBrowserClient().from("user_unit_progress").select("unit_id,status,best_score,step_state,completed_at");
      if (!error) remote = ((data ?? []) as Row[]).map(toProgress);
    }
  } catch { /* dùng bản dự phòng */ }
  const local = readLocal();
  const ids = new Set([...remote.map((p) => p.unitId), ...Object.keys(local)]);
  return [...ids].flatMap((id) => mergeProgressStates(remote.find((p) => p.unitId === id), local[id]) ?? []);
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
  const m = mergeProgress(prev, next);
  let ok = false;
  try {
    if (await ensureAnonymousSession()) {
      const sb = createSupabaseBrowserClient();
      const userId = (await sb.auth.getSession()).data.session?.user.id;
      if (userId) {
        const { error } = await sb.from("user_unit_progress").upsert({
          user_id: userId, unit_id: unitId, status: m.status, best_score: m.bestScore, step_state: m.stepState, completed_at: m.completedAt, updated_at: new Date().toISOString(),
        });
        ok = !error;
      }
    }
  } catch { ok = false; }
  // Lưu máy chủ thất bại thì giữ bản dự phòng trên thiết bị (người chưa đăng nhập vẫn mở được cấp sau); thành công thì xóa bản dự phòng của bài này.
  const local = readLocal();
  if (ok) { if (local[unitId]) { delete local[unitId]; writeLocal(local); } }
  else writeLocal({ ...local, [unitId]: mergeProgressStates(local[unitId], { unitId, ...m })! });
  return ok;
}
