// Nhạc nền là các bài có sẵn (miễn phí bản quyền, tải từ Pixabay, xem docs/operations-runbook.md) đặt ở `public/explore/music/`.
// Nhạc thuật toán (`ambient-music.ts`) giữ làm phương án dự phòng khi không tải được file.

import type { Mood } from "./ambient-music";

export interface MusicTrack {
  id: string;
  src: string;
  /** Độ to riêng của bài (0–1) để các bài nghe ngang nhau (đã đo độ to trung bình: bài to thì để nhỏ). */
  volume: number;
}

export const TRACKS: Record<"cozy" | "warm" | "detective", MusicTrack> = {
  cozy: { id: "cozy", src: "/explore/music/cozy-ambience.mp3", volume: 0.36 },
  warm: { id: "warm", src: "/explore/music/cozy-mountain.mp3", volume: 0.59 },
  detective: { id: "detective", src: "/explore/music/detective.mp3", volume: 0.21 },
};

/** Cảnh yên tĩnh dùng bài êm (cozy), cảnh đông vui dùng bài ấm (warm); đang phá án thì dùng bài trinh thám. */
const QUIET: readonly Mood[] = ["room", "hotel", "hospital", "school", "park", "library", "beach"];

export function trackFor(mood: Mood, caseMode: boolean): MusicTrack {
  if (caseMode) return TRACKS.detective;
  return QUIET.includes(mood) ? TRACKS.cozy : TRACKS.warm;
}
