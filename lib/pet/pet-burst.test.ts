import { describe, expect, it } from "vitest";
import { burstParticles, burstSound, type PetBurstKind } from "./pet-burst";

const KINDS: PetBurstKind[] = ["tap", "cheer", "goal", "sad", "crunch", "full", "gift", "adopt", "evolve", "try", "tapSleepy"];

describe("burstParticles", () => {
  it("mọi loại đều có hạt, cố định theo loại và có kèm tiếng", () => {
    for (const k of KINDS) {
      const a = burstParticles(k);
      expect(a.length).toBeGreaterThan(0);
      expect(burstParticles(k)).toEqual(a);
      expect(burstSound(k)).toBeTruthy();
      for (const p of a) expect(p.glyph).toBeTruthy();
    }
  });
  it("vui thì bay lên, buồn và nhai thì rơi xuống", () => {
    expect(burstParticles("cheer").every((p) => p.dy < 0)).toBe(true);
    expect(burstParticles("sad").every((p) => p.dy > 0)).toBe(true);
    expect(burstParticles("crunch").every((p) => p.dy > 0)).toBe(true);
  });
  it("tiến hóa là đợt hạt lớn nhất", () => {
    expect(burstParticles("evolve").length).toBeGreaterThan(burstParticles("tap").length);
  });
});
