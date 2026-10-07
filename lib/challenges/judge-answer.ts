import { ROOM_QUESTION_MS, roomAnswerPoints } from "@/lib/rooms/room-scoring";

/** Khoảng nghỉ giữa hai câu ở màn chơi (hiện kết quả câu trước): thời gian này không tính vào thời gian trả lời câu sau. */
export const RESULT_PAUSE_MS = 4_000;
/** Dung sai độ trễ mạng/thiết bị trước khi coi một câu là quá giờ. */
export const GRACE_MS = 3_000;

export interface JudgeInput {
  /** Lựa chọn của người chơi (0–3) hoặc -1 khi hết giờ. */
  choice: number;
  correctIndex: number;
  /** Thời gian trả lời do máy khách báo. */
  clientElapsedMs: number;
  /** Mili giây từ lúc kết thúc câu trước (hoặc lúc bắt đầu lượt) tới lúc server nhận câu trả lời. */
  serverGapMs: number;
}

export interface Judgement {
  correct: boolean;
  points: number;
  elapsedMs: number;
  choice: number;
}

/**
 * Chấm một câu. Máy khách tự báo thời gian nên không tin hoàn toàn: thời gian tính điểm là số lớn hơn giữa số máy khách báo và
 * khoảng chờ thật ở server (trừ khoảng nghỉ giữa câu). Nếu khoảng chờ thật vượt quá giờ của câu (kể cả dung sai) thì xem như hết giờ,
 * không có điểm, để không thể treo câu hỏi đi tra đáp án rồi mới gửi. Cùng công thức điểm với phòng thi đấu.
 */
export function judgeAnswer({ choice, correctIndex, clientElapsedMs, serverGapMs }: JudgeInput): Judgement {
  const serverElapsed = Math.max(0, serverGapMs - RESULT_PAUSE_MS);
  const timedOut = choice < 0 || serverElapsed > ROOM_QUESTION_MS + GRACE_MS;
  const elapsedMs = Math.min(ROOM_QUESTION_MS, Math.max(0, Math.floor(Math.max(clientElapsedMs, serverElapsed))));
  if (timedOut) return { correct: false, points: 0, elapsedMs: ROOM_QUESTION_MS, choice: -1 };
  const correct = choice === correctIndex;
  return { correct, points: roomAnswerPoints(correct, elapsedMs), elapsedMs, choice };
}
