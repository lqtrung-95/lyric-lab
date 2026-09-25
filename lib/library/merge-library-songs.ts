import type { RecentSong } from "@/lib/user-state/recent-songs";

/** Bài trong thư viện: tiến độ nghe (từ Supabase) hoặc chỉ mới mở xem trước (từ danh sách gần đây trong trình duyệt). */
export interface LibrarySong {
  videoId: string;
  title: string;
  channelTitle: string;
  /** 0–1; 0 nếu chưa nghe. */
  progress: number;
  completed: boolean;
  /** Lần mở/nghe gần nhất (ms). */
  lastAt: number;
}

export interface RemoteSongProgress {
  videoId: string;
  title: string;
  channelTitle: string;
  durationSec: number;
  lastPositionSec: number;
  completed: boolean;
  updatedAt: string;
}

/** Gộp bài đã nghe (Supabase) với bài mới xem trước (cục bộ); mỗi video một dòng, mới nhất trước. */
export function mergeLibrarySongs(remote: RemoteSongProgress[], recent: RecentSong[]): LibrarySong[] {
  const byId = new Map<string, LibrarySong>();
  for (const r of remote) {
    byId.set(r.videoId, {
      videoId: r.videoId, title: r.title, channelTitle: r.channelTitle,
      progress: r.completed ? 1 : r.durationSec > 0 ? Math.min(1, r.lastPositionSec / r.durationSec) : 0,
      completed: r.completed, lastAt: Date.parse(r.updatedAt),
    });
  }
  for (const s of recent) {
    const existing = byId.get(s.videoId);
    if (existing) existing.lastAt = Math.max(existing.lastAt, s.openedAt);
    else byId.set(s.videoId, { videoId: s.videoId, title: s.title, channelTitle: s.channelTitle, progress: 0, completed: false, lastAt: s.openedAt });
  }
  return [...byId.values()].sort((a, b) => b.lastAt - a.lastAt);
}
