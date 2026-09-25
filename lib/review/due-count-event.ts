export const DUE_COUNT_EVENT = "lyric-lab-due-count-changed";

/** Báo cho các huy hiệu "số thẻ cần ôn" tải lại (sau khi chấm, hoàn tác, hoặc lưu/bỏ lưu thẻ). */
export const notifyDueCountChanged = () => window.dispatchEvent(new Event(DUE_COUNT_EVENT));
