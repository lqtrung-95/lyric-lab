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
  /**
   * Hết ngày hôm nay theo múi giờ người dùng (00:00 ngày mai). Thẻ đang ở trạng thái Review đến hạn khi hạn rơi TRƯỚC mốc này
   * (như Anki: thẻ hẹn "5 ngày" hiện từ sáng ngày thứ 5, không phải đúng giờ đã chấm); thẻ đang học/học lại vẫn theo giờ phút.
   * Bỏ trống thì mọi thẻ tính theo giờ hiện tại.
   */
  dayEnd?: Date;
  /** Số thẻ ôn lại (không phải thẻ mới) còn được ôn hôm nay. Bỏ trống = không giới hạn. */
  reviewRoom?: number;
}

/** Số thẻ ôn lại tối đa mỗi ngày (như mặc định của Anki); thẻ cũ nhất được ôn trước, phần còn lại để dành sang hôm sau. */
export const MAX_REVIEWS_PER_DAY = 200;

const REVIEW_STATE = 2;

/** Thẻ (không phải thẻ mới) có đến hạn không: Review theo ngày, Học/Học lại theo giờ phút. */
export function isDue(c: QueueCard, now: Date, dayEnd?: Date): boolean {
  if (c.state === 0) return false;
  const limit = c.state === REVIEW_STATE && dayEnd ? dayEnd.getTime() - 1 : now.getTime();
  return Date.parse(c.due) <= limit;
}

/**
 * Hàng đợi ôn: thẻ đến hạn (cũ nhất trước) rồi tới thẻ mới (lưu sớm nhất trước) trong phần hạn mức còn lại của ngày.
 * Thẻ mới chưa tới lượt hôm nay vẫn nằm yên, không bị mất.
 */
export function buildReviewQueue<T extends QueueCard>({ cards, now, newPerDay, newStartedToday, dayEnd, reviewRoom }: QueueInput<T>): T[] {
  const due = cards
    .filter((c) => isDue(c, now, dayEnd))
    .sort((a, b) => Date.parse(a.due) - Date.parse(b.due))
    .slice(0, reviewRoom === undefined ? undefined : Math.max(0, reviewRoom));
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
