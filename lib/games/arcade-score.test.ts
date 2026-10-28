import { describe, expect, it } from "vitest";
import { validateScore } from "@/lib/leaderboard/validate-score";
import { arcadeRound } from "./arcade-score";

describe("arcadeRound", () => {
  it("luôn qua kiểm tra điểm của máy chủ", () => {
    for (const [p, c, a, d] of [[99999, 80, 80, 5], [0, 0, 0, 0], [400, 3, 2, 1], [-5, -1, 7, 10]] as const) {
      expect(validateScore({ mode: "blaster", ...arcadeRound(p, c, a, d) }).ok).toBe(true);
    }
  });
});
