import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { parseGrammarStats, type GrammarStats } from "./grammar-stats";

async function current() {
  const sb = createSupabaseBrowserClient();
  const userId = (await sb.auth.getSession()).data.session?.user.id;
  if (!userId) throw new Error("no_session");
  return { sb, userId };
}

/** Đọc thống kê của người dùng hiện tại; ném lỗi nếu chưa đăng nhập hoặc bảng chưa tạo (caller coi là "không đồng bộ"). */
export async function loadRemoteGrammarStats(): Promise<GrammarStats> {
  const { sb, userId } = await current();
  const { data, error } = await sb.from("user_grammar_stats").select("stats").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return parseGrammarStats((data as { stats: unknown } | null)?.stats);
}

export async function saveRemoteGrammarStats(stats: GrammarStats): Promise<void> {
  const { sb, userId } = await current();
  const { error } = await sb.from("user_grammar_stats").upsert({ user_id: userId, stats, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
