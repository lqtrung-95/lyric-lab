import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { cardRowFromSaved, type CardRow, type RemoteLearner, type SyncOps } from "./learner-sync";

// Truy cập Supabase từ trình duyệt bằng phiên của người dùng; RLS bảo đảm chỉ đọc/ghi được dữ liệu của chính họ.
const CARD_COLUMNS = "item_key,kind,term,pinyin,han_viet,hsk_level,meaning,video_id,line_index,created_at";

export async function fetchRemoteLearner(): Promise<RemoteLearner> {
  const sb = createSupabaseBrowserClient();
  const [profile, known, cards] = await Promise.all([
    sb.from("user_profiles").select("level").maybeSingle(),
    sb.from("user_known_terms").select("item_key"),
    sb.from("user_cards").select(CARD_COLUMNS).order("created_at"),
  ]);
  const error = profile.error ?? known.error ?? cards.error;
  if (error) throw new Error(error.message);
  return {
    level: profile.data?.level ?? null,
    known: (known.data ?? []).map((r) => r.item_key),
    cards: (cards.data ?? []) as CardRow[],
  };
}

/** Ghi các thay đổi lên Supabase. Thẻ đã có (đã ôn) không bị ghi đè: `ignoreDuplicates` giữ nguyên trạng thái FSRS. */
export async function pushLearnerOps(userId: string, ops: SyncOps): Promise<void> {
  const sb = createSupabaseBrowserClient();
  const results = [];
  if (ops.level !== undefined) {
    results.push(await sb.from("user_profiles").upsert({ user_id: userId, level: ops.level, updated_at: new Date().toISOString() }));
  }
  if (ops.knownAdd.length) {
    results.push(await sb.from("user_known_terms").upsert(ops.knownAdd.map((item_key) => ({ user_id: userId, item_key })), { ignoreDuplicates: true }));
  }
  if (ops.knownRemove.length) results.push(await sb.from("user_known_terms").delete().in("item_key", ops.knownRemove));
  const rows = ops.cardsAdd.map(cardRowFromSaved).filter((r) => r !== null).map((r) => ({ ...r, user_id: userId }));
  if (rows.length) results.push(await sb.from("user_cards").upsert(rows, { onConflict: "user_id,item_key", ignoreDuplicates: true }));
  if (ops.cardsRemove.length) results.push(await sb.from("user_cards").delete().in("item_key", ops.cardsRemove));
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
