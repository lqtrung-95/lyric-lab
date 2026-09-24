import { describe, expect, it } from "vitest";
import { CaptionError } from "./caption-errors";
import { parseJson3CaptionEvents } from "./parse-json3-caption-events";

describe("parseJson3CaptionEvents", () => {
  it("đọc events có segs và bỏ event rỗng", () => {
    const body = JSON.stringify({
      events: [
        { tStartMs: 0, dDurationMs: 5000, segs: [{ utf8: "窗外的城市" }, { utf8: "慢慢睡了" }] },
        { tStartMs: 5000, dDurationMs: 100, segs: [{ utf8: "\n" }] },
        { tStartMs: 5000 },
        { tStartMs: 10000, dDurationMs: 5000, segs: [{ utf8: "你的笑比星光还亮" }] },
      ],
    });
    expect(parseJson3CaptionEvents(body)).toEqual([
      { text: "窗外的城市慢慢睡了", start: 0, end: 5 },
      { text: "你的笑比星光还亮", start: 10, end: 15 },
    ]);
  });

  it("JSON hỏng hoặc thiếu events → CaptionError parse", () => {
    expect(() => parseJson3CaptionEvents("<html>")).toThrow(CaptionError);
    expect(() => parseJson3CaptionEvents("{}")).toThrow(CaptionError);
  });
});
