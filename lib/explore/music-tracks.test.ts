import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Mood } from "./ambient-music";
import { MOODS } from "./ambient-music";
import { TRACKS, trackFor } from "./music-tracks";

describe("music-tracks", () => {
  it("mọi file nhạc có trong public, độ to hợp lệ", () => {
    for (const t of Object.values(TRACKS)) {
      expect(existsSync(join(process.cwd(), "public", t.src)), t.src).toBe(true);
      expect(t.volume).toBeGreaterThan(0);
      expect(t.volume).toBeLessThanOrEqual(1);
    }
  });

  it("đang phá án luôn là bài trinh thám; chế độ tự do chọn bài theo cảnh, mọi cảnh đều có bài", () => {
    for (const m of Object.keys(MOODS) as Mood[]) {
      expect(trackFor(m, true).id).toBe("detective");
      expect(["cozy", "warm"]).toContain(trackFor(m, false).id);
    }
    expect(trackFor("hospital", false).id).toBe("cozy");
    expect(trackFor("market", false).id).toBe("warm");
  });
});
