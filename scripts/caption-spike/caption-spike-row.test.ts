import { describe, expect, it } from "vitest";
import type { LyricQuality } from "@/lib/captions/assess-lyric-quality";
import { decideUsable } from "./caption-spike-row";

const q = (verdict: "ok" | "unsupported"): LyricQuality => ({
  lineCount: 30, hanLineRatio: verdict === "ok" ? 1 : 0, hanCharRatio: 1, coverageSec: 100,
  medianLineSec: 4, bilingualLineCount: 0, script: "simplified", verdict,
});

describe("decideUsable", () => {
  it("manual + ok + coverage đủ → yes", () => expect(decideUsable(q("ok"), 0.7, "manual")).toBe("yes"));
  it("asr đạt ngưỡng → asr_unreviewed", () => expect(decideUsable(q("ok"), 0.7, "asr")).toBe("asr_unreviewed"));
  it("coverage dưới 50% → no", () => expect(decideUsable(q("ok"), 0.49, "manual")).toBe("no"));
  it("unsupported hoặc không có dữ liệu → no", () => {
    expect(decideUsable(q("unsupported"), 0.9, "manual")).toBe("no");
    expect(decideUsable(null, null, null)).toBe("no");
  });
});
