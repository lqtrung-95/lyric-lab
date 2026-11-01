import { hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import type { MemoryRow } from "@/lib/srs/retrievability";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const MAX_ROWS = 3000;

/** Dữ liệu trí nhớ (FSRS) của các thẻ TỪ VỰNG của người dùng, theo từ. Rỗng nếu chưa có phiên hoặc lỗi: bản đồ lộ trình vẫn hiện, chỉ không có "độ bền". */
export async function loadCardMemory(): Promise<Map<string, MemoryRow>> {
  try {
    if (!(await hasExistingSession())) return new Map();
    const { data, error } = await createSupabaseBrowserClient().from("user_cards").select("term,reps,stability,last_review,due").eq("kind", "vocab").limit(MAX_ROWS);
    if (error) return new Map();
    return new Map(((data ?? []) as (MemoryRow & { term: string })[]).map((r) => [r.term, { reps: r.reps, stability: r.stability, last_review: r.last_review, due: r.due }]));
  } catch {
    return new Map();
  }
}
