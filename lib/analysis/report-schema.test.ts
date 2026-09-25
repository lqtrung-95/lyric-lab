import { describe, expect, it } from "vitest";
import { reportRequestSchema } from "./report-schema";

const ok = { videoId: "dQw4w9WgXcQ", promptVersion: "v1", itemId: "vocab:城市", reason: "wrong_meaning" };

describe("reportRequestSchema", () => {
  it("nhận yêu cầu hợp lệ", () => expect(reportRequestSchema.safeParse(ok).success).toBe(true));
  it.each([
    [{ ...ok, videoId: "bad" }],
    [{ ...ok, reason: "spam" }],
    [{ ...ok, itemId: "" }],
    [{ ...ok, itemId: "x".repeat(201) }],
    [{}],
  ])("từ chối %j", (input) => expect(reportRequestSchema.safeParse(input).success).toBe(false));
});
