import type { AnalyzedLine } from "@/lib/analysis/analysis-types";

export const MAX_OFFSET_SEC = 60;
const STEP = 0.05;
// Người bấm thường chậm hơn thời điểm ca sĩ bắt đầu hát chừng một phần tư giây.
export const REACTION_COMPENSATION_SEC = 0.25;

/** Làm tròn tới 0,05 giây và kẹp trong ±60 giây. */
export function normalizeOffset(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value / STEP) * STEP;
  return Math.max(-MAX_OFFSET_SEC, Math.min(MAX_OFFSET_SEC, Math.round(rounded * 100) / 100));
}

/** Dịch mốc thời gian các dòng lời theo độ lệch. Dòng không bao giờ bắt đầu trước 0. */
export function shiftLines<T extends Pick<AnalyzedLine, "start" | "end">>(lines: T[], offset: number): T[] {
  if (offset === 0) return lines;
  return lines.map((l) => ({ ...l, start: Math.max(0, l.start + offset), end: Math.max(0, l.end + offset) }));
}

/**
 * Độ lệch suy ra khi người dùng bấm vào một dòng đúng lúc nghe ca sĩ bắt đầu hát dòng đó.
 * `videoTime` là thời gian video lúc bấm, `originalLineStart` là mốc gốc (chưa dịch) của dòng.
 */
export function offsetFromLineClick(videoTime: number, originalLineStart: number): number {
  return normalizeOffset(videoTime - REACTION_COMPENSATION_SEC - originalLineStart);
}

export type SyncRisk = "none" | "likely_off";

/**
 * Cảnh báo sớm lời có thể lệch với video: lời kết thúc sau khi video đã hết, hoặc kết thúc quá sớm so với video
 * (bản lời thuộc phiên bản khác, intro dài ngắn khác). Chỉ là gợi ý, không tự sửa.
 */
export function estimateSyncRisk(lines: Pick<AnalyzedLine, "end">[], videoDurationSec: number): SyncRisk {
  if (lines.length === 0 || videoDurationSec <= 0) return "none";
  const lastEnd = Math.max(...lines.map((l) => l.end));
  return lastEnd > videoDurationSec + 2 || videoDurationSec - lastEnd > 45 ? "likely_off" : "none";
}

/** Bảng độ lệch lưu cục bộ: videoId → giây. Bỏ mục sai kiểu. */
export function parseOffsets(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter((e): e is [string, number] => typeof e[1] === "number" && Number.isFinite(e[1])).map(([k, v]) => [k, normalizeOffset(v)]),
    );
  } catch {
    return {};
  }
}
