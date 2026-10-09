// Supadata tính 1 credit mỗi lần gọi và gói miễn phí chỉ có 100 credit mỗi tháng, dùng chung với luồng thêm video của người dùng.
// Phần dành cho lời bài hát bị giới hạn để không làm cạn credit của luồng đó.
export const SUPADATA_SONGS_PER_MONTH = 40;

export type SupadataLyricsBudget = "ok" | "exhausted";

/** `usedThisMonth`: số bài đã dùng lời Supadata từ đầu tháng (đếm theo `song_analyses.lyrics_source = 'supadata'`). */
export function decideSupadataLyricsBudget(usedThisMonth: number): SupadataLyricsBudget {
  return usedThisMonth < SUPADATA_SONGS_PER_MONTH ? "ok" : "exhausted";
}

/** Mốc đầu tháng hiện tại (UTC) dạng ISO, để đếm số bài đã dùng trong tháng. */
export function monthStartIso(now: Date = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}
