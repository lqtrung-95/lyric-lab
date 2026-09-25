import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import type { LrclibItem, VideoMeta } from "./lyrics-types";

// Bản lời lệch độ dài quá ngưỡng này so với video thường là bản khác (live, cover, remix).
export const MAX_DURATION_GAP_SEC = 10;

const normalize = (s: string) =>
  toSimplifiedChinese(s).toLowerCase().replace(/[^\p{Script=Han}a-z0-9]/gu, "");

export interface PickedLrclib {
  item: LrclibItem;
  gapSec: number;
}

/**
 * Chọn bản LRCLIB khớp video: có lời đồng bộ, tên bài xuất hiện trong tiêu đề video (so sánh sau khi
 * đổi giản thể), độ dài lệch ≤ MAX_DURATION_GAP_SEC. Ưu tiên khớp nghệ sĩ, rồi độ lệch nhỏ nhất.
 * Không có độ dài video → không chọn (không có cách xác minh bản).
 */
export function pickLrclibVersion(
  items: LrclibItem[],
  video: Pick<VideoMeta, "title" | "channelTitle" | "durationSec">,
): PickedLrclib | null {
  if (video.durationSec <= 0) return null;
  const haystack = normalize(`${video.title} ${video.channelTitle}`);
  const titleHaystack = normalize(video.title);

  const scored = items
    .filter((i) => i.syncedLyrics && !i.instrumental)
    .map((item) => ({
      item,
      gapSec: Math.abs(item.duration - video.durationSec),
      titleMatch: normalize(item.trackName).length >= 2 && titleHaystack.includes(normalize(item.trackName)),
      artistMatch: normalize(item.artistName).length >= 2 && haystack.includes(normalize(item.artistName)),
    }))
    .filter((s) => s.titleMatch && s.gapSec <= MAX_DURATION_GAP_SEC);

  scored.sort((a, b) => Number(b.artistMatch) - Number(a.artistMatch) || a.gapSec - b.gapSec);
  return scored[0] ? { item: scored[0].item, gapSec: scored[0].gapSec } : null;
}
