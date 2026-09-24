import type { CaptionErrorType } from "@/lib/captions/caption-errors";
import type { LyricQuality } from "@/lib/captions/assess-lyric-quality";

/** "yes" = manual + đạt chất lượng. "asr_unreviewed" = caption tự động đạt ngưỡng nhưng chưa chấm tay. */
export type Usable = "yes" | "asr_unreviewed" | "no";

export interface SpikeRow {
  songId: number;
  videoId: string;
  group: string;
  role: string;
  durationSec: number;
  tracks: string[];
  bestTrack: string | null;
  kind: "manual" | "asr" | null;
  quality: LyricQuality | null;
  coverage: number | null;
  /** Track tiếng Trung được chọn nhưng nội dung không có chữ Hán (ví dụ pinyin Latin). */
  trackIsRomanized: boolean;
  errorType: CaptionErrorType | null;
  latencyMs: number;
  oracle: { manualZh: boolean; autoZh: boolean } | null;
  usable: Usable;
}

export const MIN_COVERAGE = 0.5;

export function decideUsable(
  quality: LyricQuality | null,
  coverage: number | null,
  kind: "manual" | "asr" | null,
): Usable {
  if (!quality || quality.verdict !== "ok" || coverage === null || coverage < MIN_COVERAGE) return "no";
  return kind === "manual" ? "yes" : "asr_unreviewed";
}
