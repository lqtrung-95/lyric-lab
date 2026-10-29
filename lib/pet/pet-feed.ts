/** Số thẻ tối đa trong một lần "cho pet ăn" (ôn nhanh ngay trong thẻ pet). */
export const PET_FEED_MAX = 3;

/** Lần cho ăn này gồm bao nhiêu thẻ: tối đa `PET_FEED_MAX`, ít hơn nếu hôm nay chỉ còn vài thẻ. */
export const feedLimit = (queued: number): number => Math.max(0, Math.min(PET_FEED_MAX, Math.floor(Number.isFinite(queued) ? queued : 0)));

/** Đã ăn đủ chưa (`ate` = số lần chấm trong lần này). Không có thẻ nào (`limit` 0) thì không bao giờ "đủ" để khỏi báo no giả. */
export const feedDone = (ate: number, limit: number): boolean => limit > 0 && ate >= limit;
