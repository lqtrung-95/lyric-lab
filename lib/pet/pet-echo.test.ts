import { describe, expect, it } from "vitest";
import { echoLine, echoTier } from "./pet-echo";

describe("echoTier", () => {
  it("chia mức theo ngưỡng", () => {
    expect(echoTier(95)).toBe("great");
    expect(echoTier(85)).toBe("great");
    expect(echoTier(84)).toBe("good");
    expect(echoTier(60)).toBe("good");
    expect(echoTier(59)).toBe("tryAgain");
    expect(echoTier(Number.NaN)).toBe("tryAgain");
  });
});

describe("echoLine", () => {
  it("điểm thấp vẫn khích lệ, có tên pet", () => {
    for (const t of ["great", "good", "tryAgain"] as const) expect(echoLine(t, "Mi")).toContain("Mi");
    expect(echoLine("tryAgain", "Mi")).not.toMatch(/sai|tệ|dở|kém/i);
  });
});
