import type { SkipReason } from "./ingest-video";

/** Trạng thái của từng video trong hàng đợi nạp trên trang quản trị. */
export type QueueStatus =
  | { state: "waiting" }
  | { state: "running"; note?: string }
  | { state: "done"; lineCount: number; translatedLineCount: number }
  | { state: "skipped"; reason: SkipReason }
  | { state: "failed"; blocked: boolean };

export const SKIP_LABEL: Record<SkipReason, string> = {
  exists: "Đã có", not_embeddable: "Không nhúng được", no_human_zh_captions: "Không có phụ đề tiếng Trung do người làm", no_lines: "Không còn dòng nào sau khi làm sạch",
};

/** Dừng hàng đợi khi bấy nhiêu video liền nhau đều thất bại vì YouTube chặn tạm (nạp tiếp chỉ kéo dài thời gian bị chặn). */
export const MAX_BLOCKED_IN_ROW = 2;
/** Số lần thử lại một video bị chặn tạm và thời gian nghỉ (ms) trước mỗi lần. */
export const RETRY_WAITS_MS = [20_000, 60_000];

export function summarizeQueue(items: { status: QueueStatus }[]) {
  const count = (s: QueueStatus["state"]) => items.filter((i) => i.status.state === s).length;
  return { total: items.length, done: count("done"), skipped: count("skipped"), failed: count("failed"), waiting: count("waiting") + count("running") };
}
