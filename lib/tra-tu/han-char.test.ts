import { describe, expect, it } from "vitest";
import { isSingleHan } from "./han-char";

describe("isSingleHan", () => {
  it("chỉ nhận đúng một chữ Hán, từ chối đường dẫn, chuỗi dài và chữ Latin", () => {
    expect(isSingleHan("爱")).toBe(true);
    expect(isSingleHan("𠀀")).toBe(true);
    expect(isSingleHan("爱情")).toBe(false);
    expect(isSingleHan("../a")).toBe(false);
    expect(isSingleHan("a")).toBe(false);
    expect(isSingleHan("")).toBe(false);
  });
});
