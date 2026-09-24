import type { CaptionTrackInfo } from "./caption-provider-types";

// Thứ tự ưu tiên: manual trước asr (IN-02); giản thể trước phồn thể; tiếng Quảng Đông cuối cùng.
const SIMPLIFIED = new Set(["zh-hans", "zh-cn", "zh-sg"]);
const OTHER_MANDARIN = new Set(["zh", "zh-hant", "zh-tw", "zh-hk", "zh-mo"]);

function langRank(lang: string): number | null {
  const l = lang.toLowerCase();
  if (SIMPLIFIED.has(l)) return 0;
  if (OTHER_MANDARIN.has(l)) return 1;
  if (l.startsWith("zh-")) return 1;
  if (l === "yue" || l.startsWith("yue-")) return 2;
  return null;
}

export function isChineseTrack(track: CaptionTrackInfo): boolean {
  return langRank(track.lang) !== null;
}

/** Trả về track tiếng Trung tốt nhất, hoặc null nếu không có track tiếng Trung. */
export function pickBestChineseTrack(
  tracks: CaptionTrackInfo[],
): CaptionTrackInfo | null {
  const candidates = tracks
    .map((track) => ({ track, rank: langRank(track.lang) }))
    .filter((c): c is { track: CaptionTrackInfo; rank: number } => c.rank !== null);
  if (candidates.length === 0) return null;

  const score = (c: { track: CaptionTrackInfo; rank: number }) =>
    (c.track.kind === "manual" ? 0 : 10) + c.rank;
  candidates.sort((a, b) => score(a) - score(b));
  return candidates[0].track;
}
