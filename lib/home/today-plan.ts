import type { DiscoverSong } from "@/lib/discover/discover-query";
import { bandOfLevel, videoBandForLevel } from "@/lib/video/video-level-filter";
import type { LessonSummary } from "@/lib/video/video-repo";

export interface StudyPick {
  kind: "video" | "song";
  videoId: string;
  title: string;
  href: string;
  levelAvg: number | null;
}

/** Số ngày kể từ 1970 của khóa ngày "YYYY-MM-DD": đổi mỗi ngày nên gợi ý xoay vòng theo ngày mà không cần lưu gì. */
const dayNumber = (dayKey: string) => Math.floor(Date.parse(`${dayKey}T00:00:00Z`) / 86_400_000) || 0;

/**
 * Một gợi ý học vừa sức cho hôm nay: luân phiên theo ngày giữa một video và một bài hát hợp level (ngày chẵn ưu tiên video, ngày lẻ ưu tiên bài hát;
 * thiếu loại nào thì lấy loại kia). Video hợp level = cùng dải (`videoBandForLevel`) với level người dùng, thiếu thì lấy video bất kỳ. Trả null khi không có gì để gợi ý.
 * Không gợi ý "tiếp tục bài nghe dở" và số thẻ cần ôn: bảng "Hôm nay" bên cạnh đã hiện hai việc đó, nhắc lại sẽ bị trùng.
 */
export function pickTodayStudy(input: { videos: LessonSummary[]; songs: DiscoverSong[]; level: number; dayKey: string }): StudyPick | null {
  const { videos, songs, level, dayKey } = input;
  const day = dayNumber(dayKey);
  const band = videoBandForLevel(level);
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
