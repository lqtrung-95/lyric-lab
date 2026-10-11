import type { DiscoverSong } from "@/lib/discover/discover-query";
import { bandOfLevel } from "@/lib/video/video-level-filter";
import type { LessonSummary } from "@/lib/video/video-repo";
import { levelToBand, type ContinueSong } from "./home-logic";

export interface StudyPick {
  kind: "continue" | "video" | "song";
  videoId: string;
  title: string;
  href: string;
  levelAvg: number | null;
}

/** Số ngày kể từ 1970 của khóa ngày "YYYY-MM-DD": đổi mỗi ngày nên gợi ý xoay vòng theo ngày mà không cần lưu gì. */
const dayNumber = (dayKey: string) => Math.floor(Date.parse(`${dayKey}T00:00:00Z`) / 86_400_000) || 0;

/**
 * Một việc học vừa sức cho hôm nay: bài đang nghe dở (nếu có) → hoặc luân phiên theo ngày giữa một video và một bài hát hợp level
 * (ngày chẵn ưu tiên video, ngày lẻ ưu tiên bài hát; thiếu loại nào thì lấy loại kia). Video hợp level = cùng dải HSK với level người dùng,
 * thiếu thì lấy video bất kỳ. Trả null khi không có gì để gợi ý.
 */
export function pickTodayStudy(input: { continueSong: ContinueSong | null; videos: LessonSummary[]; songs: DiscoverSong[]; level: number; dayKey: string }): StudyPick | null {
  const { continueSong, videos, songs, level, dayKey } = input;
  if (continueSong) {
    return { kind: "continue", videoId: continueSong.videoId, title: continueSong.title, href: `/learn/${continueSong.videoId}/listen?t=${continueSong.positionSec}`, levelAvg: null };
  }
  const day = dayNumber(dayKey);
  const band = levelToBand(level);
  const fitting = videos.filter((v) => bandOfLevel(v.levelAvg) === band);
  const videoPool = fitting.length > 0 ? fitting : videos;
  const video = videoPool.length > 0 ? videoPool[day % videoPool.length] : null;
  const song = songs.length > 0 ? songs[day % songs.length] : null;
  const asVideo = (v: LessonSummary): StudyPick => ({ kind: "video", videoId: v.videoId, title: v.title, href: `/video/${v.videoId}`, levelAvg: v.levelAvg });
  const asSong = (s: DiscoverSong): StudyPick => ({ kind: "song", videoId: s.videoId, title: s.title, href: `/learn/${s.videoId}`, levelAvg: s.levelAvg });
  const preferVideo = day % 2 === 0;
  if (video && (preferVideo || !song)) return asVideo(video);
  if (song) return asSong(song);
  return video ? asVideo(video) : null;
}
