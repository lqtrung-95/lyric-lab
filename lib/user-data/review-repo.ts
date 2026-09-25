import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { dayBounds } from "@/lib/srs/day-bounds";
import type { ReviewLogFields, SrsFields } from "@/lib/srs/fsrs-scheduler";
import { buildReviewQueue } from "@/lib/srs/review-queue";
import type { CardRow } from "./learner-sync";

export type ReviewCard = CardRow & SrsFields;

export interface ReviewSession {
  queue: ReviewCard[];
  newPerDay: number;
  /** Số thẻ đang chờ ôn hôm nay (đến hạn + thẻ mới trong hạn mức). */
  total: number;
}

const DEFAULT_NEW_PER_DAY = 15;
const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const CARD_COLUMNS =
  "item_key,kind,term,pinyin,han_viet,hsk_level,meaning,video_id,line_index,created_at,due,stability,difficulty,elapsed_days,scheduled_days,learning_steps,reps,lapses,state,last_review";

/** Tải hàng đợi ôn hôm nay: thẻ đến hạn + thẻ mới trong phần hạn mức còn lại (đếm từ nhật ký ôn theo múi giờ người dùng). */
export async function loadReviewSession(now = new Date()): Promise<ReviewSession> {
  const sb = createSupabaseBrowserClient();
  const profile = await sb.from("user_profiles").select("new_cards_per_day,timezone").maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  const newPerDay = profile.data?.new_cards_per_day ?? DEFAULT_NEW_PER_DAY;
  const { start, end } = dayBounds(now, profile.data?.timezone ?? DEFAULT_TIMEZONE);

  const [due, fresh, started] = await Promise.all([
    sb.from("user_cards").select(CARD_COLUMNS).neq("state", 0).lte("due", now.toISOString()),
    sb.from("user_cards").select(CARD_COLUMNS).eq("state", 0).order("created_at").limit(Math.max(newPerDay, 1)),
    sb.from("review_logs").select("id", { count: "exact", head: true }).eq("state", 0).gte("reviewed_at", start.toISOString()).lt("reviewed_at", end.toISOString()),
  ]);
  const error = due.error ?? fresh.error ?? started.error;
  if (error) throw new Error(error.message);

  const cards = [...(due.data ?? []), ...(fresh.data ?? [])] as ReviewCard[];
  const queue = buildReviewQueue({ cards, now, newPerDay, newStartedToday: started.count ?? 0 });
  return { queue, newPerDay, total: queue.length };
}

/** Ghi kết quả chấm: cập nhật thẻ rồi thêm nhật ký. Trả id nhật ký để hoàn tác. */
export async function saveGrade(userId: string, itemKey: string, next: SrsFields, log: ReviewLogFields): Promise<number> {
  const sb = createSupabaseBrowserClient();
  const update = await sb.from("user_cards").update({ ...next, updated_at: new Date().toISOString() }).eq("item_key", itemKey);
  if (update.error) throw new Error(update.error.message);
  const inserted = await sb.from("review_logs").insert({ ...log, user_id: userId, item_key: itemKey }).select("id").single();
  if (inserted.error) throw new Error(inserted.error.message);
  return inserted.data.id;
}

/** Hoàn tác lần chấm vừa rồi: trả thẻ về trạng thái cũ và xóa dòng nhật ký. */
export async function undoGrade(itemKey: string, previous: SrsFields, logId: number): Promise<void> {
  const sb = createSupabaseBrowserClient();
  const restore = await sb.from("user_cards").update({ ...previous, updated_at: new Date().toISOString() }).eq("item_key", itemKey);
  if (restore.error) throw new Error(restore.error.message);
  const removed = await sb.from("review_logs").delete().eq("id", logId);
  if (removed.error) throw new Error(removed.error.message);
}
