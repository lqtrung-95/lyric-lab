export interface QueueCard {
  item_key: string;
  state: number;
  due: string;
  created_at: string;
}

export interface QueueInput<T extends QueueCard> {
  cards: T[];
  now: Date;
  /** Hạn mức thẻ mới mỗi ngày (cài đặt người dùng). */
  newPerDay: number;
  /** Số thẻ mới đã bắt đầu học trong ngày hôm nay (đếm từ nhật ký ôn). */
  newStartedToday: number;
}

/**
 * Hàng đợi ôn: thẻ đến hạn (cũ nhất trước) rồi tới thẻ mới (lưu sớm nhất trước) trong phần hạn mức còn lại của ngày.
 * Thẻ mới chưa tới lượt hôm nay vẫn nằm yên, không bị mất.
 */
export function buildReviewQueue<T extends QueueCard>({ cards, now, newPerDay, newStartedToday }: QueueInput<T>): T[] {
  const due = cards
    .filter((c) => c.state !== 0 && Date.parse(c.due) <= now.getTime())
    .sort((a, b) => Date.parse(a.due) - Date.parse(b.due));
  const room = Math.max(0, newPerDay - newStartedToday);
  const fresh = cards
    .filter((c) => c.state === 0)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
    .slice(0, room);
  return [...due, ...fresh];
}

/** Số thẻ cần ôn hôm nay (cho huy hiệu ở thanh điều hướng): cùng luật với hàng đợi. */
export const countDueToday = <T extends QueueCard>(input: QueueInput<T>) => buildReviewQueue(input).length;

// Thẻ vừa chấm mà còn đang học (hẹn lại trong vài phút) quay lại sau chừng này thẻ khác, không bị dồn ra cuối buổi.
const RELEARN_GAP = 4;
const LEARN_AHEAD_MS = 20 * 60_000;

/**
 * Đưa thẻ vừa chấm trở lại hàng đợi nếu lần ôn kế nằm trong buổi học (≤ 20 phút, tức đang ở bước học/học lại).
 * `rest` là phần hàng đợi còn lại (không gồm thẻ vừa chấm).
 */
export function requeueAfterGrade<T extends { due: string }>(rest: T[], graded: T, now: Date): T[] {
  if (Date.parse(graded.due) - now.getTime() > LEARN_AHEAD_MS) return rest;
  const at = Math.min(RELEARN_GAP, rest.length);
  return [...rest.slice(0, at), graded, ...rest.slice(at)];
}
