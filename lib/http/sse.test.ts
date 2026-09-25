import { describe, expect, it } from "vitest";
import { encodeSseEvent } from "./sse";

describe("encodeSseEvent", () => {
  it("định dạng event + data JSON một dòng + dòng trống", () => {
    expect(encodeSseEvent("step", { step: "lyrics" })).toBe('event: step\ndata: {"step":"lyrics"}\n\n');
  });
  it("xuống dòng trong dữ liệu được thoát trong JSON, không phá khung SSE", () => {
    const out = encodeSseEvent("error", { message: "a\nb" });
    expect(out.split("\n\n")).toHaveLength(2);
    expect(out).toContain('"a\\nb"');
  });
});
