import { describe, expect, it } from "vitest";
import { classifyVideoRole } from "./classify-video-role";

describe("classifyVideoRole", () => {
  it.each([
    ["晴天 周杰伦 (歌词版)", "GM Lyric", "周杰伦", "lyric_video"],
    ["Song [Lyrics + Pinyin]", "Some Channel", "X", "lyric_video"],
    ["歌名 Official Audio", "Label", "X", "official_audio"],
    ["歌名 Official Music Video", "Label", "X", "official_mv"],
    ["歌名", "周杰倫 Jay Chou", "周杰倫", "official_mv"],
    ["歌名 cover", "Random", "X", "other"],
  ])("%s → %s", (title, channel, artist, role) => {
    expect(classifyVideoRole(title, channel, artist)).toBe(role);
  });
});
