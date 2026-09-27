import type { SearchSong } from "./search-types";

const MIN_DURATION_SEC = 90;
const MAX_DURATION_SEC = 600;
const MAX_RESULTS = 8;
const HAN = /\p{Script=Han}/u;

/**
 * Lọc và xếp hạng kết quả YouTube cho người học tiếng Trung:
 * bỏ video trùng, quá ngắn/dài (không phải một bài hát), không nhúng được; ưu tiên tên có chữ Hán
 * (và chỉ giữ các video có chữ Hán khi có từ 3 kết quả trở lên như vậy), giữ nguyên thứ tự liên quan của nguồn.
 */
export function rankSearchResults(results: SearchSong[], embeddableIds?: ReadonlySet<string>): SearchSong[] {
  const seen = new Set<string>();
  const kept = results.filter((r) => {
    if (seen.has(r.videoId)) return false;
    seen.add(r.videoId);
    if (embeddableIds && !embeddableIds.has(r.videoId)) return false;
    return r.durationSec === undefined || (r.durationSec >= MIN_DURATION_SEC && r.durationSec <= MAX_DURATION_SEC);
  });
  const withHan = kept.filter((r) => HAN.test(r.title) || HAN.test(r.channelTitle));
  return (withHan.length >= 3 ? withHan : kept).slice(0, MAX_RESULTS);
}
