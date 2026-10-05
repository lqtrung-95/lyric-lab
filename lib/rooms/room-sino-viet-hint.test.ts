import { describe, expect, it } from "vitest";
import { hanCharsForHint, sinoVietLineHint } from "./room-sino-viet-hint";

const readings = new Map<string, string[]>([["我", ["ngã"]], ["也", ["dã"]], ["不", ["bất"]], ["怕", ["phạ"]]]);
const identity = (s: string) => s;

describe("sinoVietLineHint", () => {
  it("ghép âm từng chữ, ô trống thành […], viết hoa chữ đầu, bỏ dấu câu", () => {
    expect(sinoVietLineHint("", "我也不怕，", readings, identity)).toBe("[…] ngã dã bất phạ");
    expect(sinoVietLineHint("我", "也不怕", readings, identity)).toBe("Ngã […] dã bất phạ");
  });
  it("thiếu âm của một chữ thì không đoán (null)", () => {
    expect(sinoVietLineHint("我远", "不怕", readings, identity)).toBeNull();
  });
  it("chuyển sang phồn thể trước khi tra", () => {
    const toTrad = (s: string) => s.replace("怕", "怕").replace("我", "我");
    expect(sinoVietLineHint("我", "怕", readings, toTrad)).toBe("Ngã […] phạ");
  });
});

describe("hanCharsForHint", () => {
  it("gom các chữ Hán khác nhau (sau khi chuyển phồn thể), bỏ ký tự khác", () => {
    expect(hanCharsForHint(["我也，", "也a不"], identity).sort()).toEqual(["不", "也", "我"].sort());
  });
});
