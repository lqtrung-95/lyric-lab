import { describe, expect, it } from "vitest";
import { parseIsoDuration } from "./parse-iso-duration";

describe("parseIsoDuration", () => {
  it.each([["PT4M30S", 270], ["PT1H2M3S", 3723], ["PT45S", 45], ["PT2M", 120], ["P0D", 0], ["", 0]])("%s → %d", (iso, sec) => {
    expect(parseIsoDuration(iso)).toBe(sec);
  });
});
