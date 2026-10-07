import { describe, expect, it } from "vitest";
import { matchEpisodes, type PodcastEpisode } from "./match-podcast-files";
import type { VideoMeta } from "./youtube-data-api";

const video = (videoId: string, title: string, durationSec: number): VideoMeta => ({ videoId, title, channelTitle: "K", channelId: "C", durationSec, embeddable: true });
const ep = (base: string, lastEndSec: number, titleZh?: string, titleEn?: string): PodcastEpisode => ({ base, lastEndSec, titleZh, titleEn });

describe("matchEpisodes", () => {
  it("khớp theo tiêu đề tiếng Trung hoặc tiếng Anh, không phân biệt hoa thường", () => {
    const { matches, unmatched } = matchEpisodes(
      [ep("a", 600, "如何找到热情？"), ep("b", 700, undefined, "learning to say NO")],
      [video("v1", "Discover (如何找到热情？) HSK3", 640), video("v2", "Learning to Say No Without Guilt", 730)],
    );
    expect(matches.map((m) => [m.episode.base, m.video.videoId, m.by])).toEqual([["a", "v1", "title"], ["b", "v2", "title"]]);
    expect(unmatched).toEqual([]);
  });
  it("tập chưa khớp tiêu đề thì khớp theo thời lượng nếu chỉ có đúng một video phù hợp", () => {
    const { matches, unmatched } = matchEpisodes([ep("x", 1500)], [video("v1", "Tiêu đề khác", 1520), video("v2", "Video ngắn", 60)]);
    expect(matches).toEqual([{ episode: ep("x", 1500), video: video("v1", "Tiêu đề khác", 1520), by: "duration" }]);
    expect(unmatched).toEqual([]);
  });
  it("không ghép khi có nhiều video cùng thời lượng (mơ hồ) hoặc video đã gán cho tập khác", () => {
    const videos = [video("v1", "A", 600), video("v2", "B", 610)];
    expect(matchEpisodes([ep("x", 600)], videos).unmatched.map((e) => e.base)).toEqual(["x"]);
    const taken = matchEpisodes([ep("a", 600, "Một"), ep("b", 600)], [video("v1", "Một tiêu đề Một", 605)]);
    expect(taken.matches.map((m) => m.episode.base)).toEqual(["a"]);
    expect(taken.unmatched.map((e) => e.base)).toEqual(["b"]);
  });
  it("thời lượng video phải không ngắn hơn phụ đề và không dài hơn quá phần kết", () => {
    expect(matchEpisodes([ep("x", 600)], [video("v1", "A", 590)]).matches).toEqual([]);
    expect(matchEpisodes([ep("x", 600)], [video("v1", "A", 700)]).matches).toEqual([]);
  });
});
