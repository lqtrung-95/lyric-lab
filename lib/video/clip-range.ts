// Đoạn phát của một câu khi chép chính tả / luyện nói: đúng mốc của câu, cộng phần người học tự chỉnh. Mốc của bảng "Bản chép lời" YouTube chỉ có giây
// nguyên (làm tròn xuống) nên có khi lệch; không tự đệm thêm vì đệm lẫn chữ của câu bên cạnh, để người học chỉnh từng câu theo nấc nhỏ.

export const CLIP_ADJUST_STEP = 0.1;
export const CLIP_ADJUST_LIMIT = 3;
const MIN_CLIP_SECONDS = 0.6;

/** Người học chỉnh đoạn phát của một câu: `start` âm = bắt đầu sớm hơn, `end` dương = kết thúc muộn hơn (giây). */
export interface ClipAdjust { start: number; end: number }
export const NO_ADJUST: ClipAdjust = { start: 0, end: 0 };

const clampAdjust = (n: number) => Math.min(CLIP_ADJUST_LIMIT, Math.max(-CLIP_ADJUST_LIMIT, Math.round(n * 100) / 100));

/** Đoạn phát thật: mốc của câu cộng phần người học chỉnh; luôn dài ít nhất 0,6 giây và không bắt đầu trước 0. */
export function clipRange(line: { start: number; end: number }, adjust: ClipAdjust = NO_ADJUST): { start: number; end: number } {
  const start = Math.max(0, line.start + adjust.start);
  const end = Math.max(start + MIN_CLIP_SECONDS, line.end + adjust.end);
  return { start, end };
}

/** Cộng `delta` giây vào đầu hoặc cuối đoạn, giới hạn ±3 giây. */
export function nudgeAdjust(adjust: ClipAdjust, edge: keyof ClipAdjust, delta: number): ClipAdjust {
  return { ...adjust, [edge]: clampAdjust(adjust[edge] + delta) };
}

export const isAdjusted = (a: ClipAdjust) => a.start !== 0 || a.end !== 0;
