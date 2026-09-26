import { MAX_ITEMS_PER_ROUND, PRACTICE_MODES, maxRoundPoints, type PracticeMode } from "@/lib/practice/scoring";

export interface ScoreSubmission {
  mode: PracticeMode;
  points: number;
  correct: number;
  total: number;
  durationSec: number;
}

export type ScoreError = "invalid" | "too_many_points" | "too_fast";

// Mỗi câu cần ít nhất chừng này giây thật sự (đọc, nghe, gõ): lượt nhanh hơn thế là bất thường.
const MIN_SECONDS_PER_ITEM = 1.5;
const MAX_DURATION_SEC = 3 * 3600;

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/**
 * Kiểm tra điểm client gửi lên. Điểm do client tính nên chỉ chặn những giá trị vô lý (âm, vượt trần chế độ, nhanh bất thường),
 * không thể chống hoàn toàn gian lận; bảng xếp hạng này là để vui và tạo động lực, không có giải thưởng.
 */
export function validateScore(input: unknown): { ok: true; value: ScoreSubmission } | { ok: false; error: ScoreError } {
  const s = input as Partial<ScoreSubmission> | null;
  if (!s || typeof s !== "object" || !PRACTICE_MODES.includes(s.mode as PracticeMode)) return { ok: false, error: "invalid" };
  const { points, correct, total, durationSec } = s;
  if (![points, correct, total, durationSec].every(isInt)) return { ok: false, error: "invalid" };
  const p = points as number, c = correct as number, t = total as number, d = durationSec as number;
  if (t < 1 || t > MAX_ITEMS_PER_ROUND || c < 0 || c > t || p < 0 || d < 0 || d > MAX_DURATION_SEC) return { ok: false, error: "invalid" };
  if (p > maxRoundPoints(s.mode as PracticeMode, t)) return { ok: false, error: "too_many_points" };
  if (d < t * MIN_SECONDS_PER_ITEM && s.mode !== "match") return { ok: false, error: "too_fast" };
  if (s.mode === "match" && d < 4) return { ok: false, error: "too_fast" }; // ghép 6 cặp không thể xong dưới vài giây
  return { ok: true, value: { mode: s.mode as PracticeMode, points: p, correct: c, total: t, durationSec: d } };
}
