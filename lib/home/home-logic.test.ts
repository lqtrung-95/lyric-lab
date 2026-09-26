import { describe, expect, it } from "vitest";
import type { RemoteSongProgress } from "@/lib/library/merge-library-songs";
import { chooseNextAction, formatPosition, goalFraction, levelToBand, pickContinueSong } from "./home-logic";

const song = (over: Partial<RemoteSongProgress>): RemoteSongProgress => ({
  videoId: "aaaaaaaaaaa", title: "A", channelTitle: "K", durationSec: 200, lastPositionSec: 60, completed: false, updatedAt: "2026-03-10T00:00:00Z", ...over,
});

describe("pickContinueSong", () => {
  it("lấy bài dở dang mới nhất, bỏ bài đã xong, mới nghe < 5s hoặc gần hết", () => {
    const out = pickContinueSong([
      song({ videoId: "old00000001", updatedAt: "2026-03-01T00:00:00Z" }),
      song({ videoId: "new00000001", updatedAt: "2026-03-09T00:00:00Z", lastPositionSec: 84.7 }),
      song({ videoId: "done0000001", completed: true, updatedAt: "2026-03-11T00:00:00Z" }),
      song({ videoId: "tiny0000001", lastPositionSec: 2, updatedAt: "2026-03-12T00:00:00Z" }),
      song({ videoId: "near0000001", lastPositionSec: 195, updatedAt: "2026-03-13T00:00:00Z" }),
    ]);
    expect(out).toEqual({ videoId: "new00000001", title: "A", positionSec: 84 });
  });

  it("không có bài nào phù hợp thì null", () => {
    expect(pickContinueSong([])).toBeNull();
    expect(pickContinueSong([song({ completed: true })])).toBeNull();
  });
});

describe("chooseNextAction", () => {
  const cont = { videoId: "a", title: "t", positionSec: 10 };
  it("thẻ đến hạn thắng bài nghe dở; không có thẻ thì tiếp tục nghe; không có gì thì gợi ý", () => {
    expect(chooseNextAction({ due: 3, continueSong: cont })).toEqual({ kind: "review", due: 3 });
    expect(chooseNextAction({ due: 0, continueSong: cont })).toEqual({ kind: "continue", song: cont });
    expect(chooseNextAction({ due: 0, continueSong: null })).toEqual({ kind: "discover" });
  });
});

describe("levelToBand", () => {
  it("ánh xạ level 1–7 sang dải của tab Khám phá", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(levelToBand)).toEqual(["1-2", "1-2", "3-4", "3-4", "5-6", "5-6", "7"]);
  });
});

describe("goalFraction / formatPosition", () => {
  it("tỉ lệ kẹp 0–1, mục tiêu 0 không chia cho 0", () => {
    expect(goalFraction(8, 15)).toBeCloseTo(0.533, 2);
    expect(goalFraction(20, 15)).toBe(1);
    expect(goalFraction(3, 0)).toBe(0);
  });

  it("định dạng m:ss", () => {
    expect(formatPosition(84)).toBe("1:24");
    expect(formatPosition(5.9)).toBe("0:05");
    expect(formatPosition(-3)).toBe("0:00");
  });
});
