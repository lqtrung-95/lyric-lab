import { deleteSongProgress, restoreSongProgress, type ProgressRow } from "@/lib/user-data/song-progress-repo";
import { RECENT_SONGS_KEY, addRecentSong, parseRecentSongs, removeRecentSong, type RecentSong } from "./recent-songs";

const EVENT = "lyric-lab-recent-songs";

export interface RemovedSong {
  recent: RecentSong | null;
  progress: ProgressRow | null;
}

function writeRecent(list: RecentSong[]) {
  try {
    localStorage.setItem(RECENT_SONGS_KEY, JSON.stringify(list));
  } catch {
    // localStorage bị chặn: thay đổi chỉ có hiệu lực tới khi tải lại.
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Bỏ một bài khỏi "Bài hát gần đây" và "Bài hát của tôi": xóa khỏi danh sách trong trình duyệt và xóa tiến độ nghe trên tài khoản.
 * Từ đã lưu và thẻ ôn của bài KHÔNG bị xóa (chúng thuộc kho từ của người dùng, không thuộc lịch sử bài hát).
 * Trả dữ liệu đã bỏ để hoàn tác.
 */
export async function removeSongFromHistory(videoId: string): Promise<RemovedSong> {
  let recent: RecentSong | null = null;
  try {
    const list = parseRecentSongs(localStorage.getItem(RECENT_SONGS_KEY));
    recent = list.find((s) => s.videoId === videoId) ?? null;
    writeRecent(removeRecentSong(list, videoId));
  } catch {
    // Bỏ qua.
  }
  return { recent, progress: await deleteSongProgress(videoId) };
}

/** Đưa bài trở lại như cũ (nút "Hoàn tác"). */
export async function restoreSongToHistory(removed: RemovedSong): Promise<void> {
  if (removed.recent) {
    try {
      writeRecent(addRecentSong(parseRecentSongs(localStorage.getItem(RECENT_SONGS_KEY)), removed.recent));
    } catch {
      // Bỏ qua.
    }
  }
  if (removed.progress) await restoreSongProgress(removed.progress);
}
