import type { RoomView } from "./room-types";

/** Ân hạn sau hạn trả lời mà server còn nhận (khớp hàm SQL), cộng 100 ms đệm để máy gọi tiến câu không bị `not_ready` oan. */
export const ADVANCE_DELAY_MS = 1100;

/** Độ lệch đồng hồ: cộng vào giờ máy để ra giờ server. Tính từ `serverNow` của lần tải gần nhất (bỏ qua độ trễ mạng, vài chục ms). */
export const serverOffsetMs = (serverNowIso: string, receivedAtMs: number): number => Date.parse(serverNowIso) - receivedAtMs;

export type QuestionPhase = "countdown" | "open" | "closed";

/** Giai đoạn của câu theo giờ server: đếm ngược trước khi mở, đang mở (còn bao nhiêu ms), hoặc đã quá hạn trả lời. */
export function questionPhase(q: { opensAt: string; deadlineAt: string }, serverTimeMs: number): { phase: QuestionPhase; msToOpen: number; msLeft: number } {
  const opens = Date.parse(q.opensAt);
  const deadline = Date.parse(q.deadlineAt);
  if (serverTimeMs < opens) return { phase: "countdown", msToOpen: opens - serverTimeMs, msLeft: deadline - opens };
  if (serverTimeMs <= deadline) return { phase: "open", msToOpen: 0, msLeft: deadline - serverTimeMs };
  return { phase: "closed", msToOpen: 0, msLeft: 0 };
}

/**
 * Bao lâu nữa (ms, theo giờ server) máy này nên gọi "tiến câu", hoặc null nếu không cần (ván không đang chơi). 0 nghĩa là gọi ngay:
 * mọi người còn trong phòng đã trả lời, hoặc đã quá hạn + ân hạn. Câu chưa mở thì đợi tới lúc mở rồi tính tiếp (trả về hạn chót).
 */
export function msUntilAdvance(view: RoomView, serverTimeMs: number): number | null {
  const q = view.currentQuestion;
  if (view.status !== "playing" || !q) return null;
  const opens = Date.parse(q.opensAt);
  const active = view.players.filter((p) => !p.left);
  const allAnswered = active.length > 0 && active.every((p) => p.answered);
  if (serverTimeMs >= opens && allAnswered) return 0;
  return Math.max(0, Date.parse(q.deadlineAt) + ADVANCE_DELAY_MS - serverTimeMs);
}
