import { describe, expect, it } from "vitest";
import { FADE_AFTER_MS, progressKey, type ExploreProgress } from "./explore-progress";
import { fadingByScene, mostFadingScene, totalFading } from "./fading-words";

const NOW = 10 * FADE_AFTER_MS;
const term = (lastSeenAt: number) => ({ discoveredAt: 0, lastSeenAt, correct: 0, wrong: 0 });
const scenes = [
  { id: "a", objects: [{ id: "x" }, { id: "y" }, { id: "z" }] },
  { id: "b", objects: [{ id: "x" }] },
] as never;

describe("từ phai", () => {
  const progress: ExploreProgress = { terms: {
    [progressKey("a", "x")]: term(0), [progressKey("a", "y")]: term(0), [progressKey("a", "z")]: term(NOW),
    [progressKey("b", "x")]: term(0), [progressKey("gone", "q")]: term(0),
  } };

  it("đếm từ phai theo cảnh, bỏ từ còn mới và từ không còn trong cảnh", () => {
    expect(fadingByScene(progress, scenes, NOW)).toEqual({ a: 2, b: 1 });
    expect(totalFading({ a: 2, b: 1 })).toBe(3);
  });

  it("chọn cảnh phai nhiều nhất, không có thì null", () => {
    expect(mostFadingScene({ a: 2, b: 1 })).toBe("a");
    expect(mostFadingScene({})).toBeNull();
  });
});
