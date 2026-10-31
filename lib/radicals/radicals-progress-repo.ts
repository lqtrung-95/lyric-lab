import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { parseRadicalProgress, type RadicalProgress } from "./radicals-progress";

async function current() {
  const sb = createSupabaseBrowserClient();
  const userId = (await sb.auth.getSession()).data.session?.user.id;
  if (!userId) throw new Error("no_session");
  return { sb, userId };
}

/** Đọc tiến độ của người dùng hiện tại; ném lỗi nếu chưa đăng nhập hoặc bảng chưa tạo (caller coi là "không đồng bộ"). */
export async function loadRemoteRadicalProgress(): Promise<RadicalProgress> {
  const { sb, userId } = await current();
  const { data, error } = await sb.from("user_radical_progress").select("progress").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return parseRadicalProgress((data as { progress: unknown } | null)?.progress);
}

export async function saveRemoteRadicalProgress(progress: RadicalProgress): Promise<void> {
  const { sb, userId } = await current();
  const { error } = await sb.from("user_radical_progress").upsert({ user_id: userId, progress, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
