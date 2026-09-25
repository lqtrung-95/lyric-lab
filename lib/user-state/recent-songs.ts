// Danh sách bài học gần đây, lưu trong trình duyệt cho tới khi có tài khoản (M3). Phần thuần để test được.
export interface RecentSong {
  videoId: string;
  title: string;
  channelTitle: string;
  /** Thời điểm mở gần nhất (ms). */
  openedAt: number;
}

export const RECENT_SONGS_KEY = "lyric-lab-recent-songs";
export const MAX_RECENT_SONGS = 12;

/** Đưa bài lên đầu danh sách (bỏ bản cũ của cùng video), giữ tối đa MAX_RECENT_SONGS bài. */
export function addRecentSong(list: RecentSong[], song: RecentSong, max = MAX_RECENT_SONGS): RecentSong[] {
  return [song, ...list.filter((s) => s.videoId !== song.videoId)].slice(0, max);
}

export function parseRecentSongs(raw: string | null): RecentSong[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (s): s is RecentSong =>
        typeof s?.videoId === "string" && typeof s?.title === "string" &&
        typeof s?.channelTitle === "string" && typeof s?.openedAt === "number",
    );
  } catch {
    return [];
  }
}
