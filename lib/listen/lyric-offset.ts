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

/** Độ lệch mặc định mới của bài khi quản trị viên lưu thêm `delta` lên trên mức mặc định hiện có (làm tròn, kẹp ±60 giây). */
export const addToDefaultOffset = (current: number, delta: number): number => normalizeOffset(current + delta);

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

/**
 * Độ lệch cá nhân đã lưu cục bộ cho một bài: `o` là độ lệch (cộng lên trên mức mặc định của bài) và `base` là mức mặc định
 * của bài LÚC người dùng chỉnh. Hai giá trị này cho biết bản chỉnh còn hợp lệ không khi admin đổi mức mặc định sau đó.
 */
export interface OffsetEntry {
  o: number;
  base: number;
}

/** Bảng độ lệch cá nhân lưu cục bộ. Chấp nhận cả dạng cũ (chỉ một số = chỉnh khi bài chưa có mức mặc định, `base` 0). Bỏ mục sai kiểu. */
export function parseOffsetEntries(raw: string | null): Record<string, OffsetEntry> {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const out: Record<string, OffsetEntry> = {};
    for (const [id, v] of Object.entries(data)) {
      if (typeof v === "number" && Number.isFinite(v)) out[id] = { o: normalizeOffset(v), base: 0 };
      else if (v && typeof v === "object" && Number.isFinite((v as OffsetEntry).o) && Number.isFinite((v as OffsetEntry).base)) {
        out[id] = { o: normalizeOffset((v as OffsetEntry).o), base: normalizeOffset((v as OffsetEntry).base) };
      }
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Độ lệch cá nhân đang có hiệu lực. `undefined` = người dùng chưa chỉnh bài này ở máy này. Khi admin đã đổi mức mặc định
 * sau lúc người dùng chỉnh (`entry.base` khác `knownDefault`), bản chỉnh cũ bị bỏ (về 0) để không cộng đôi với mức mới.
 * Chưa biết mức mặc định hiện tại (`knownDefault` undefined) thì tin bản đang lưu.
 */
export function resolveOffset(entry: OffsetEntry | undefined, knownDefault: number | undefined): number | undefined {
  if (!entry) return undefined;
  if (knownDefault !== undefined && entry.base !== knownDefault) return 0;
  return entry.o;
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
