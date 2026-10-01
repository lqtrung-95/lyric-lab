import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import type { LrclibItem, VideoMeta } from "./lyrics-types";

// Bản lời lệch độ dài quá ngưỡng này so với video thường là bản khác (live, cover, remix).
export const MAX_DURATION_GAP_SEC = 10;
// Không khớp nghệ sĩ thì chỉ chấp nhận khi độ dài gần như trùng khớp (tránh nhầm bản cover có độ dài tình cờ giống bản gốc).
export const ARTIST_OPTIONAL_GAP_SEC = 2;

const normalize = (s: string) =>
  toSimplifiedChinese(s).toLowerCase().replace(/[^\p{Script=Han}a-z0-9]/gu, "");

export interface PickedLrclib {
  item: LrclibItem;
  gapSec: number;
}

/**
 * Chọn bản LRCLIB khớp video: có lời đồng bộ, tên bài xuất hiện trong tiêu đề video (so sánh sau khi đổi giản thể),
 * độ dài lệch ≤ MAX_DURATION_GAP_SEC. Không khớp nghệ sĩ thì bắt buộc độ dài gần như trùng khớp (≤ ARTIST_OPTIONAL_GAP_SEC):
 * nhiều bản cover/hát lại có độ dài tình cờ gần bản gốc nhưng lời khác nhịp hoàn toàn. Trong các bản còn lại, ưu tiên khớp
 * nghệ sĩ, rồi độ lệch nhỏ nhất. Không có độ dài video → không chọn (không có cách xác minh bản). Cho phép tên bài/nghệ sĩ
 * chỉ 1 ký tự (vd. bài "当") — điều kiện gapSec + artistMatch đã đủ chặn khớp nhầm, không cần ép độ dài tối thiểu riêng.
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
      titleMatch: normalize(item.trackName).length >= 1 && titleHaystack.includes(normalize(item.trackName)),
      artistMatch: normalize(item.artistName).length >= 1 && haystack.includes(normalize(item.artistName)),
    }))
    .filter((s) => s.titleMatch && s.gapSec <= MAX_DURATION_GAP_SEC && (s.artistMatch || s.gapSec <= ARTIST_OPTIONAL_GAP_SEC));

  scored.sort((a, b) => Number(b.artistMatch) - Number(a.artistMatch) || a.gapSec - b.gapSec);
  return scored[0] ? { item: scored[0].item, gapSec: scored[0].gapSec } : null;
}
