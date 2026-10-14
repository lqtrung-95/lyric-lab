import type { LessonSummary } from "./video-repo";

// Danh sách thẻ chủ đề CỐ ĐỊNH của video (không để AI tự đặt, để bộ lọc gọn). Cột `video_lessons.tags` lưu `id`; nhãn hiển thị ở đây.
export const VIDEO_TAGS = [
  { id: "hoat-hinh", label: "Hoạt hình" },
  { id: "vlog", label: "Vlog" },
  { id: "doi-song", label: "Đời sống" },
  { id: "du-lich", label: "Du lịch" },
  { id: "hai", label: "Hài" },
  { id: "thieu-nhi", label: "Thiếu nhi" },
  { id: "phim-ngan", label: "Phim ngắn" },
  { id: "podcast", label: "Podcast" },
  { id: "bai-hoc", label: "Bài học tiếng Trung" },
] as const;
export type VideoTagId = (typeof VIDEO_TAGS)[number]["id"];
export const MAX_TAGS_PER_VIDEO = 3;

const KNOWN = new Set<string>(VIDEO_TAGS.map((t) => t.id));
export const isVideoTag = (value: unknown): value is VideoTagId => typeof value === "string" && KNOWN.has(value);
export const tagLabel = (id: VideoTagId): string => VIDEO_TAGS.find((t) => t.id === id)?.label ?? id;

/** Chỉ giữ thẻ hợp lệ, bỏ trùng, tối đa `MAX_TAGS_PER_VIDEO`, giữ thứ tự gặp đầu tiên. Đầu vào lạ (không phải mảng) cho mảng rỗng. */
export function normalizeTags(raw: unknown): VideoTagId[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter(isVideoTag))].slice(0, MAX_TAGS_PER_VIDEO);
}

// Quy tắc từ khóa trong tên video/kênh: dùng khi AI không trả được thẻ, nên chỉ bắt những dấu hiệu rõ ràng.
const RULES: [VideoTagId, RegExp][] = [
  ["hoat-hinh", /动画|動畫|动漫|動漫|卡通|cartoon|animation|animated|anime|沙雕动|沙雕動|佩奇|peppa|喜羊羊|熊出没|熊出沒|小丸子/i],
  ["vlog", /vlog|日记|日記/i],
  ["du-lich", /旅行|旅游|旅遊|travel|trip|city ?walk|自由行|旅拍/i],
  ["podcast", /podcast|播客/i],
  ["thieu-nhi", /儿歌|兒歌|童谣|童謠|童话|童話|幼儿|幼兒|宝宝|寶寶|kids|nursery|佩奇|peppa/i],
  ["hai", /搞笑|沙雕|爆笑|funny|comedy|幽默|笑死/i],
  ["phim-ngan", /短剧|短劇|微电影|微電影|short film|微剧|微劇/i],
  ["bai-hoc", /学习中文|學習中文|学中文|學中文|学汉语|學漢語|中文课|中文課|learn (chinese|mandarin)|chinese (lesson|conversation|shadowing)|mandarin (lesson|practice)|speak chinese|可理解|comprehensible|\bhsk ?\d|slow chinese/i],
  ["doi-song", /生活|日常|居家|daily|lifestyle|life /i],
];

/** Thẻ đoán từ tên video và tên kênh (không dùng AI); mảng rỗng nếu không có dấu hiệu nào. */
export function heuristicTags(title: string, channelTitle: string): VideoTagId[] {
  const text = `${title} ${channelTitle}`;
  return normalizeTags(RULES.filter(([, re]) => re.test(text)).map(([id]) => id));
}

/**
 * Chỉnh kết quả AI: hoạt hình/thiếu nhi KHÔNG đồng thời là "Bài học tiếng Trung" trừ khi tên video/kênh có dấu hiệu bài giảng thật (AI hay nhầm hoạt hình có pinyin/Vietsub trong tên
 * là bài giảng; đo 2026-10-14 trên kênh DaihuaXiyou).
 */
export function refineTags(tags: VideoTagId[], title: string, channelTitle: string): VideoTagId[] {
  const entertainment = tags.includes("hoat-hinh") || tags.includes("thieu-nhi");
  if (!entertainment || !tags.includes("bai-hoc") || heuristicTags(title, channelTitle).includes("bai-hoc")) return tags;
  return tags.filter((t) => t !== "bai-hoc");
}

/** Giữ video có thẻ `tag` (null = tất cả). Video chưa có thẻ chỉ hiện ở "Tất cả". */
export function filterByTag(videos: LessonSummary[], tag: VideoTagId | null): LessonSummary[] {
  return tag === null ? videos : videos.filter((v) => v.tags?.includes(tag));
}

/** Số video của từng thẻ, để hiện trên nút lọc và ẩn thẻ không có video nào. */
export function countByTag(videos: LessonSummary[]): Record<VideoTagId, number> {
  const out = Object.fromEntries(VIDEO_TAGS.map((t) => [t.id, 0])) as Record<VideoTagId, number>;
  for (const v of videos) for (const t of v.tags ?? []) if (isVideoTag(t)) out[t]++;
  return out;
}
