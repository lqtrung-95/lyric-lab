import type { LessonSummary } from "./video-repo";

// Dải riêng cho video (khác tab Khám phá của bài hát: ở đó 3–4 gộp một dải). Level video đo theo độ khó từ vựng và tốc độ nói nên phần lớn video rơi vào
// khoảng 2,5–4,5; chia đôi dải đó thành "HSK 3" và "HSK 4" mới cho bộ lọc có ích.
export type BandId = "1-2" | "3" | "4" | "5+";
const RANGES: Record<BandId, [number, number]> = { "1-2": [0, 2.5], "3": [2.5, 3.5], "4": [3.5, 4.5], "5+": [4.5, 99] };
export const VIDEO_BANDS: { id: BandId; label: string }[] = [
  { id: "1-2", label: "HSK 1–2" },
  { id: "3", label: "HSK 3" },
  { id: "4", label: "HSK 4" },
  { id: "5+", label: "HSK 5+" },
];

/** "new" giữ thứ tự máy chủ trả về (mới thêm trước). */
export type VideoSort = "new" | "easy" | "short";
export const VIDEO_SORTS: { id: VideoSort; label: string }[] = [
  { id: "new", label: "Mới nhất" },
  { id: "easy", label: "Dễ → khó" },
  { id: "short", label: "Ngắn → dài" },
];

/** Dải của một video theo level; null nếu video chưa có level. */
export function bandOfLevel(levelAvg: number | null): BandId | null {
  if (levelAvg === null) return null;
  return (Object.entries(RANGES).find(([, [lo, hi]]) => levelAvg >= lo && levelAvg < hi)?.[0] as BandId | undefined) ?? null;
}

/** Dải video hợp với level người học (1–7): ≤2 → "1-2", 3 → "3", 4 → "4", từ 5 trở lên → "5+". */
export function videoBandForLevel(level: number): BandId {
  if (level <= 2) return "1-2";
  if (level < 4) return "3";
  if (level < 5) return "4";
  return "5+";
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
  const out: Record<BandId, number> = { "1-2": 0, "3": 0, "4": 0, "5+": 0 };
  for (const v of videos) { const b = bandOfLevel(v.levelAvg); if (b) out[b]++; }
  return out;
}
