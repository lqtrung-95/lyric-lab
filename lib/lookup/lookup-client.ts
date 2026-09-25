import type { TermEntry } from "./build-term-entry";
import type { TermExplanation } from "./explain-schema";

export type FetchResult<T> = { ok: true; value: T } | { ok: false; reason: "rate_limited" | "not_available" | "error" };

/** Gọi /api/lookup (từ điển). Trả `value: null` nếu từ không có trong từ điển. */
export async function fetchTermEntry(term: string, signal?: AbortSignal, fetchFn: typeof fetch = fetch): Promise<FetchResult<TermEntry | null>> {
  try {
    const res = await fetchFn(`/api/lookup?term=${encodeURIComponent(term)}`, { signal });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: "error" };
    return { ok: true, value: (await res.json()).entry ?? null };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** Gọi /api/explain (nghĩa theo ngữ cảnh câu hát). */
export async function fetchExplanation(
  req: { videoId: string; lineIndex: number; term: string },
  signal?: AbortSignal,
  fetchFn: typeof fetch = fetch,
): Promise<FetchResult<TermExplanation>> {
  try {
    const res = await fetchFn("/api/explain", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req), signal,
    });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (res.status === 404 || res.status === 400) return { ok: false, reason: "not_available" };
    if (!res.ok) return { ok: false, reason: "error" };
    return { ok: true, value: await res.json() };
  } catch {
    return { ok: false, reason: "error" };
  }
}
