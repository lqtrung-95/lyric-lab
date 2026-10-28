import { parseCoopRecord, withCoopSolve } from "@/lib/explore/coop/coop-reward";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type ExploreStateKind = "progress" | "story";

/** Đọc khối tiến độ của người dùng hiện tại. `null` = chưa có dòng nào; ném lỗi nếu chưa đăng nhập hoặc bảng chưa tạo (caller coi là "không đồng bộ"). */
export async function loadRemoteState(kind: ExploreStateKind): Promise<unknown | null> {
  const sb = createSupabaseBrowserClient();
  const userId = (await sb.auth.getSession()).data.session?.user.id;
  if (!userId) throw new Error("no_session");
  const { data, error } = await sb.from("user_explore_state").select("data").eq("user_id", userId).eq("kind", kind).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (data as { data: unknown }).data : null;
}

export async function saveRemoteState(kind: ExploreStateKind, value: unknown): Promise<void> {
  const sb = createSupabaseBrowserClient();
  const userId = (await sb.auth.getSession()).data.session?.user.id;
  if (!userId) throw new Error("no_session");
  const { error } = await sb.from("user_explore_state").upsert({ user_id: userId, kind, data: value, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** Tiến độ cốt truyện lưu một dòng `story` chứa mọi vụ án: `{ cases: { [caseId]: tiến độ } }`. Dữ liệu cũ (một khối tiến độ trần) thuộc vụ án đầu tiên. */
const LEGACY_CASE = "wooden-box";
type StoryBook = { cases: Record<string, unknown>; coop?: unknown };

function toBook(raw: unknown): StoryBook {
  const r = raw as { cases?: Record<string, unknown>; flags?: unknown } | null;
  if (r && typeof r.cases === "object" && r.cases) return { cases: { ...r.cases }, ...((raw as { coop?: unknown }).coop !== undefined ? { coop: (raw as { coop?: unknown }).coop } : {}) };
  if (r && Array.isArray(r.flags)) return { cases: { [LEGACY_CASE]: r } };
  return { cases: {} };
}

export async function loadRemoteStory(caseId: string): Promise<unknown | null> {
  return toBook(await loadRemoteState("story")).cases[caseId] ?? null;
}

/** Ghi tiến độ một vụ án, giữ nguyên các vụ khác trong cùng dòng. */
export async function saveRemoteStory(caseId: string, value: unknown): Promise<void> {
  const book = toBook(await loadRemoteState("story"));
  book.cases[caseId] = value;
  await saveRemoteState("story", book);
}

/** Ghi nhận một vụ án đã giải cùng bạn (và ngày chơi) vào khối `story` của tài khoản, cạnh tiến độ các vụ; dùng cho huy hiệu "cặp thám tử". Ném lỗi nếu chưa đăng nhập (caller bỏ qua). */
export async function recordRemoteCoopSolve(caseId: string, dayKey: string): Promise<void> {
  const book = toBook(await loadRemoteState("story"));
  book.coop = withCoopSolve(parseCoopRecord(book.coop), caseId, dayKey);
  await saveRemoteState("story", book);
}
