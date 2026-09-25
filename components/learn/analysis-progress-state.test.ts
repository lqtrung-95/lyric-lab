import { describe, expect, it } from "vitest";
import { activeStepIndex, initialProgress, progressReducer } from "./analysis-progress-state";

describe("progressReducer", () => {
  it("đi qua các bước và ghi nhận meta, lỗi", () => {
    let s = progressReducer(initialProgress, { type: "meta", title: "t", channelTitle: "c" });
    expect(s.meta).toEqual({ title: "t", channelTitle: "c" });
    s = progressReducer(s, { type: "step", step: "lyrics" });
    expect(activeStepIndex(s.step)).toBe(0);
    s = progressReducer(s, { type: "step", step: "analysis" });
    expect(activeStepIndex(s.step)).toBe(1);
    s = progressReducer(s, { type: "done" });
    expect(activeStepIndex(s.step)).toBe(3);
    expect(progressReducer(s, { type: "error", code: "no_lyrics" }).error).toBe("no_lyrics");
  });
});
