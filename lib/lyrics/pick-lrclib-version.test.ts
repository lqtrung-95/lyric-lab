import { describe, expect, it } from "vitest";
import type { LrclibItem } from "./lyrics-types";
import { pickLrclibVersion } from "./pick-lrclib-version";

const item = (p: Partial<LrclibItem>): LrclibItem => ({
  id: 1, trackName: "夜车", artistName: "歌手甲", duration: 200, instrumental: false, syncedLyrics: "[00:00.00]x", ...p,
});
const video = { title: "歌手甲 Singer A【夜車 Night Train】Official MV", channelTitle: "歌手甲 Official", durationSec: 204 };

describe("pickLrclibVersion", () => {
  it("khớp tên bài (phồn/giản) và độ dài", () => {
    const picked = pickLrclibVersion([item({ id: 7 })], video);
    expect(picked?.item.id).toBe(7);
    expect(picked?.gapSec).toBe(4);
  });

  it("loại bản lệch độ dài quá ngưỡng (live, remix)", () => {
    expect(pickLrclibVersion([item({ duration: 260 })], video)).toBeNull();
  });

  it("loại bản không có lời đồng bộ hoặc là nhạc không lời", () => {
    expect(pickLrclibVersion([item({ syncedLyrics: null }), item({ instrumental: true })], video)).toBeNull();
  });

  it("không khớp tên bài dù độ dài giống → null", () => {
    expect(pickLrclibVersion([item({ trackName: "雨天" })], video)).toBeNull();
  });

  it("ưu tiên khớp nghệ sĩ rồi độ lệch nhỏ nhất", () => {
    const picked = pickLrclibVersion(
      [item({ id: 1, artistName: "歌手乙", duration: 204 }), item({ id: 2, duration: 199 }), item({ id: 3, duration: 202 })],
      video,
    );
    expect(picked?.item.id).toBe(3);
  });

  it("không có độ dài video → null", () => {
    expect(pickLrclibVersion([item({})], { ...video, durationSec: 0 })).toBeNull();
  });
});
