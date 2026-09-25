import { describe, expect, it } from "vitest";
import { toSimplifiedChinese } from "./to-simplified-chinese";

describe("toSimplifiedChinese", () => {
  it("chuyển phồn thể sang giản thể", () => {
    expect(toSimplifiedChinese("我從來沒想過會離開")).toBe("我从来没想过会离开");
  });
  it("giữ nguyên giản thể, chữ Latin và số", () => {
    expect(toSimplifiedChinese("窗外的城市 abc 123")).toBe("窗外的城市 abc 123");
  });
});
