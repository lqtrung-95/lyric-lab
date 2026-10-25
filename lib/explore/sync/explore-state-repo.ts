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
