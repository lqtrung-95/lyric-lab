/** Hoạt động học theo video (chép chính tả, luyện nói) gửi lên máy chủ để tính chuỗi ngày và mục tiêu hằng ngày. Không có điểm và không vào bảng xếp hạng. */
export const VIDEO_STUDY_MODES = ["dictation", "shadowing"] as const;
export type VideoStudyMode = (typeof VIDEO_STUDY_MODES)[number];

export interface VideoStudySubmission {
  mode: VideoStudyMode;
  /** Số câu vừa làm xong (1–20). */
  lines: number;
  /** Số câu trong đó làm tốt (0..lines). */
  correct: number;
}

/** Trần số lần gửi mỗi giờ của một người: đủ cho việc học thật (mỗi câu một lần), chặn việc bơm dòng vào DB. */
export const MAX_VIDEO_STUDY_PER_HOUR = 300;
export const MAX_VIDEO_STUDY_LINES = 20;

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

export function validateVideoStudy(input: unknown): { ok: true; value: VideoStudySubmission } | { ok: false } {
  const s = input as Partial<VideoStudySubmission> | null;
  if (!s || typeof s !== "object" || !VIDEO_STUDY_MODES.includes(s.mode as VideoStudyMode)) return { ok: false };
  if (!isInt(s.lines) || !isInt(s.correct) || s.lines < 1 || s.lines > MAX_VIDEO_STUDY_LINES || s.correct < 0 || s.correct > s.lines) return { ok: false };
  return { ok: true, value: { mode: s.mode as VideoStudyMode, lines: s.lines, correct: s.correct } };
}
