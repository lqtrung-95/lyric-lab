import { cardRetrievability, type MemoryRow } from "@/lib/srs/retrievability";

/** Dưới mức này thì từ được coi là "sắp quên" (FSRS nhắm giữ lại 90%, nên 85% là lúc đã đáng ôn). */
export const FADING_BELOW = 0.85;
/** Cần ít nhất ngần này từ sắp quên (và một phần ba số từ đã ôn) thì chặng mới báo "cần ôn", để một hai từ lẻ không làm nhiễu bản đồ. */
export const MIN_FADING = 3;

export interface UnitStrength {
  /** Số từ của chặng đã từng được ôn (có dữ liệu trí nhớ). */
  known: number;
  /** Số từ đang dưới ngưỡng nhớ. */
  fading: number;
  /** Trung bình xác suất còn nhớ của các từ đã ôn, 0..100; null nếu chưa từ nào được ôn. */
  strengthPct: number | null;
  needsReview: boolean;
}

/**
 * "Độ bền" của một chặng: tính từ xác suất còn nhớ (đường quên FSRS) của các từ thuộc chặng mà người học đã lưu và ôn. Từ chưa có thẻ hoặc thẻ chưa ôn lần nào không tính
 * (không có dữ liệu thì không đoán). `memory` là bản đồ từ → dữ liệu thẻ.
 */
export function unitStrength(terms: readonly string[], memory: ReadonlyMap<string, MemoryRow>, now: Date): UnitStrength {
  const rs = terms.flatMap((t) => { const m = memory.get(t); const r = m ? cardRetrievability(m, now) : null; return r === null ? [] : [r]; });
  const fading = rs.filter((r) => r < FADING_BELOW).length;
  return {
    known: rs.length, fading,
    strengthPct: rs.length ? Math.round((100 * rs.reduce((a, b) => a + b, 0)) / rs.length) : null,
    needsReview: fading >= MIN_FADING && fading >= rs.length / 3,
  };
}
