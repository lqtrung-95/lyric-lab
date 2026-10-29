/**
 * Phân loại độ chính xác mốc thời gian của một video đã lưu: phụ đề đọc từ bảng "Bản chép lời" của YouTube chỉ có giây nguyên
 * (câu shadowing/chép chính tả bị cụt hoặc lệch gần 1 giây), còn phụ đề lấy từ response của trình phát, SRT/VTT hay Supadata có mili giây.
 * `ms` = đa số câu có mốc lẻ; `seconds` = mọi mốc đều là số nguyên; `mixed` = chỉ một ít câu có mốc lẻ (nên xem lại bằng tay).
 */
export type TimestampPrecision = "ms" | "seconds" | "mixed" | "none";

export interface PrecisionReport { precision: TimestampPrecision; fractionalLines: number; lines: number; ratio: number }

const EPS = 1e-6;
const isFractional = (n: number): boolean => Number.isFinite(n) && Math.abs(n - Math.round(n)) > EPS;
/** Từ tỉ lệ câu có mốc lẻ này trở lên thì coi cả video là có mili giây. */
export const MS_RATIO = 0.3;

export function classifyTimestamps(lines: readonly { start: number; end: number }[]): PrecisionReport {
  const fractionalLines = lines.filter((l) => isFractional(l.start) || isFractional(l.end)).length;
  const ratio = lines.length === 0 ? 0 : fractionalLines / lines.length;
  const precision: TimestampPrecision = lines.length === 0 ? "none" : ratio >= MS_RATIO ? "ms" : fractionalLines === 0 ? "seconds" : "mixed";
  return { precision, fractionalLines, lines: lines.length, ratio };
}
