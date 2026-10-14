import type { LessonSummary } from "./video-repo";

export interface ChannelGroup {
  channelTitle: string;
  videos: LessonSummary[];
}

/**
 * Gom video theo kênh. Kênh nhiều video xếp trước (cùng số video thì theo tên), thứ tự video trong mỗi kênh giữ nguyên như mảng đầu vào
 * (đã lọc và sắp xếp). Tên kênh so khớp không phân biệt hoa thường và khoảng trắng thừa; kênh không có tên gom vào "Kênh khác" ở cuối.
 */
export function groupByChannel(videos: LessonSummary[]): ChannelGroup[] {
  const map = new Map<string, ChannelGroup>();
  for (const v of videos) {
    const title = v.channelTitle.trim();
    const key = title.toLowerCase();
    const group = map.get(key) ?? { channelTitle: title, videos: [] };
    group.videos.push(v);
    map.set(key, group);
  }
  const groups = [...map.values()];
  const unnamed = groups.filter((g) => !g.channelTitle);
  const named = groups.filter((g) => g.channelTitle).sort((a, b) => b.videos.length - a.videos.length || a.channelTitle.localeCompare(b.channelTitle));
  return [...named, ...unnamed.map((g) => ({ ...g, channelTitle: "Kênh khác" }))];
}

/** Mỗi kênh ở trang Video chỉ hiện chừng này video đầu; muốn xem hết thì bấm "Xem tất cả" sang trang riêng của kênh. */
export const CHANNEL_PREVIEW_COUNT = 4;
/** Tên thay cho kênh không có tên trong địa chỉ trang kênh (đoạn đường dẫn không được rỗng). */
const UNNAMED_SLUG = "-";

const normalize = (title: string) => title.trim().toLowerCase();

/** Địa chỉ trang liệt kê mọi video của một kênh: `/video/kenh/<tên kênh mã hóa>`. */
export const channelHref = (channelTitle: string): string => `/video/kenh/${encodeURIComponent(channelTitle.trim() || UNNAMED_SLUG)}`;

/** Đọc lại tên kênh từ đoạn đường dẫn (có thể đã hoặc chưa được giải mã); "-" là kênh không có tên. */
export function channelFromSlug(slug: string): string {
  let title = slug;
  try { title = decodeURIComponent(slug); } catch { /* đoạn đường dẫn không phải mã hóa hợp lệ: dùng nguyên văn */ }
  return title === UNNAMED_SLUG ? "" : title;
}

/** Các video của một kênh (so khớp như `groupByChannel`: không phân biệt hoa thường, bỏ khoảng trắng thừa), giữ nguyên thứ tự đầu vào. */
export const videosOfChannel = (videos: LessonSummary[], channelTitle: string): LessonSummary[] =>
  videos.filter((v) => normalize(v.channelTitle) === normalize(channelTitle));
