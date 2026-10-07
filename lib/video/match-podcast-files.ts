import type { VideoMeta } from "./youtube-data-api";

/** Một tập podcast đọc từ thư mục đầu ra của công cụ làm podcast: tên file gốc, tiêu đề (nếu có file kịch bản) và thời điểm kết thúc cue cuối của file phụ đề. */
export interface PodcastEpisode {
  base: string;
  titleZh?: string;
  titleEn?: string;
  /** Giây kết thúc của cue cuối trong file phụ đề tiếng Trung. */
  lastEndSec: number;
}

export type MatchBy = "title" | "duration";
export interface EpisodeMatch { episode: PodcastEpisode; video: VideoMeta; by: MatchBy }

/** Video dài hơn phụ đề tối đa chừng này (giây): đoạn kết/nhạc cuối video không có lời. */
const MAX_TAIL_SEC = 45;

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Ghép từng tập với video YouTube. Ưu tiên khớp tiêu đề (tiêu đề video chứa tiêu đề tiếng Trung hoặc tiếng Anh của kịch bản); tập chưa khớp
 * thì khớp theo thời lượng: video có thời lượng nằm trong [cue cuối, cue cuối + 45s] và là ứng viên DUY NHẤT còn lại. Mỗi video chỉ gán cho
 * một tập. Trả các cặp khớp và danh sách tập không ghép được.
 */
export function matchEpisodes(episodes: PodcastEpisode[], videos: VideoMeta[]): { matches: EpisodeMatch[]; unmatched: PodcastEpisode[] } {
  const taken = new Set<string>();
  const matches: EpisodeMatch[] = [];
  const rest: PodcastEpisode[] = [];

  for (const ep of episodes) {
    const hits = videos.filter((v) => !taken.has(v.videoId) && ((ep.titleZh && v.title.includes(ep.titleZh)) || (ep.titleEn && norm(v.title).includes(norm(ep.titleEn)))));
    if (hits.length === 1) { taken.add(hits[0].videoId); matches.push({ episode: ep, video: hits[0], by: "title" }); }
    else rest.push(ep);
  }

  const unmatched: PodcastEpisode[] = [];
  for (const ep of rest) {
    const fits = videos.filter((v) => !taken.has(v.videoId) && v.durationSec >= ep.lastEndSec - 1 && v.durationSec <= ep.lastEndSec + MAX_TAIL_SEC);
    if (fits.length === 1) { taken.add(fits[0].videoId); matches.push({ episode: ep, video: fits[0], by: "duration" }); }
    else unmatched.push(ep);
  }
  return { matches, unmatched };
}
