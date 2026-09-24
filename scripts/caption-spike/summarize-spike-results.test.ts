import { describe, expect, it } from "vitest";
import type { SpikeRow } from "./caption-spike-row";
import { summarizeSpike } from "./summarize-spike-results";

const row = (p: Partial<SpikeRow>): SpikeRow => ({
  songId: 1, videoId: "x", group: "G", role: "official_mv", durationSec: 200, tracks: [], bestTrack: null,
  kind: null, quality: null, coverage: null, trackIsRomanized: false, errorType: null, latencyMs: 1000,
  oracle: null, usable: "no", ...p,
});

describe("summarizeSpike", () => {
  it("mức bài lấy video tốt nhất, mức video đếm từng video", () => {
    const s = summarizeSpike([
      row({ songId: 1, videoId: "a", usable: "no", errorType: "no_caption" }),
      row({ songId: 1, videoId: "b", usable: "yes", role: "lyric_video" }),
      row({ songId: 2, videoId: "c", usable: "no" }),
      row({ songId: 3, videoId: "d", usable: "asr_unreviewed" }),
    ]);
    expect(s.video).toEqual({ total: 4, yes: 1, asr: 1, no: 2 });
    expect(s.song).toEqual({ total: 3, yes: 1, asr: 1, no: 1 });
    expect(s.errors).toEqual({ no_caption: 1 });
    expect(s.videoByRole.lyric_video.yes).toBe(1);
  });

  it("đo độ khớp với yt-dlp", () => {
    const s = summarizeSpike([
      row({ tracks: ["zh-CN/manual"], oracle: { manualZh: true, autoZh: true } }),
      row({ tracks: [], oracle: { manualZh: true, autoZh: false } }),
      row({ tracks: [], oracle: null }),
    ]);
    expect(s.oracleAgreement).toEqual({ compared: 2, agree: 1 });
  });
});
