import { BANDS } from "@/lib/discover/discover-query";
import type { LessonSummary } from "./video-repo";

export type BandId = "1-2" | "3-4" | "5-6" | "7";
export const VIDEO_BANDS: { id: BandId; label: string }[] = [
  { id: "1-2", label: "HSK 1–2" },
  { id: "3-4", label: "HSK 3–4" },
  { id: "5-6", label: "HSK 5–6" },
  { id: "7", label: "HSK 7+" },
];

/** "new" giữ thứ tự máy chủ trả về (mới thêm trước). */
export type VideoSort = "new" | "easy" | "short";
export const VIDEO_SORTS: { id: VideoSort; label: string }[] = [
  { id: "new", label: "Mới nhất" },
  { id: "easy", label: "Dễ → khó" },
  { id: "short", label: "Ngắn → dài" },
];

/** Dải của một video theo HSK trung bình; null nếu video chưa có level. */
export function bandOfLevel(levelAvg: number | null): BandId | null {
  if (levelAvg === null) return null;
  return (Object.entries(BANDS).find(([, [lo, hi]]) => levelAvg >= lo && levelAvg < hi)?.[0] as BandId | undefined) ?? null;
}

/** Lọc theo dải (null = tất cả, video chưa có level chỉ hiện ở "tất cả") rồi sắp xếp; không đổi mảng gốc. */
export function filterAndSortVideos(videos: LessonSummary[], band: BandId | null, sort: VideoSort): LessonSummary[] {
  const list = band === null ? [...videos] : videos.filter((v) => bandOfLevel(v.levelAvg) === band);
  if (sort === "easy") list.sort((a, b) => (a.levelAvg ?? Infinity) - (b.levelAvg ?? Infinity));
  else if (sort === "short") list.sort((a, b) => a.durationSec - b.durationSec);
  return list;
}

/** Số video của từng dải, để hiện trên nút lọc và ẩn các dải trống. */
export function countByBand(videos: LessonSummary[]): Record<BandId, number> {
  const out: Record<BandId, number> = { "1-2": 0, "3-4": 0, "5-6": 0, "7": 0 };
  for (const v of videos) { const b = bandOfLevel(v.levelAvg); if (b) out[b]++; }
  return out;
}
