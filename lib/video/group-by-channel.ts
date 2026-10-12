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
