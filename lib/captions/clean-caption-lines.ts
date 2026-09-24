import type { CaptionLine } from "./caption-provider-types";

// Dòng chỉ chứa ký hiệu âm nhạc / chú thích âm thanh, không phải lời.
const NOISE_ONLY =
  /^(?:[\s♪♫♬🎵🎶*#~\-–—.…]*|[[(（【]\s*(?:music|applause|laughter|singing|instrumental|音乐|音樂|纯音乐|純音樂|掌声|掌聲|笑声|笑聲|演唱|前奏|间奏|間奏|尾奏)\s*[\])）】])$/i;
const NOTE_CHARS = /[♪♫♬🎵🎶]/g;

export interface CleanOptions {
  /** Dòng ngắn hơn ngưỡng này (giây) được gộp với dòng kế nếu liền kề. */
  minLineSec?: number;
  /** Khoảng hở tối đa (giây) để coi hai dòng là liền kề khi gộp. */
  maxMergeGapSec?: number;
}

export function cleanCaptionLines(
  lines: CaptionLine[],
  { minLineSec = 0.6, maxMergeGapSec = 0.3 }: CleanOptions = {},
): CaptionLine[] {
  const cleaned: CaptionLine[] = [];
  for (const line of lines) {
    const text = line.text.replace(NOTE_CHARS, "").replace(/\s+/g, " ").trim();
    if (!text || NOISE_ONLY.test(line.text.trim())) continue;
    const prev = cleaned[cleaned.length - 1];
    if (prev && prev.text === text) {
      prev.end = Math.max(prev.end, line.end);
      continue;
    }
    cleaned.push({ text, start: line.start, end: line.end });
  }

  const merged: CaptionLine[] = [];
  for (const line of cleaned) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.end - prev.start < minLineSec &&
      line.start - prev.end <= maxMergeGapSec
    ) {
      prev.text = `${prev.text} ${line.text}`;
      prev.end = line.end;
    } else {
      merged.push({ ...line });
    }
  }
  return merged;
}
