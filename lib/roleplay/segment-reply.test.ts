import { describe, expect, it } from "vitest";
import { segmentReply } from "./segment-reply";

describe("segmentReply", () => {
  it("tách thành từ, ghép lại đúng câu gốc, dấu câu không phải từ Hán", () => {
    const text = "今天我学了数字和颜色！";
    const tokens = segmentReply(text);
    expect(tokens.map((t) => t.text).join("")).toBe(text);
    expect(tokens.length).toBeGreaterThan(3);
    expect(tokens.find((t) => t.text === "！")?.han).toBe(false);
    expect(tokens.filter((t) => t.han).every((t) => /\p{Script=Han}/u.test(t.text))).toBe(true);
  });
  it("câu rỗng hoặc không có chữ Hán không làm hỏng", () => {
    expect(segmentReply("")).toEqual([]);
    expect(segmentReply("hello").every((t) => !t.han)).toBe(true);
  });
});
