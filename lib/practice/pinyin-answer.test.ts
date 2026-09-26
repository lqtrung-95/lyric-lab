import { describe, expect, it } from "vitest";
import { checkPinyin, pinyinForms, pinyinHint } from "./pinyin-answer";

describe("pinyinForms", () => {
  it("dạng có dấu, số thanh (thanh nhẹ bỏ trống, ü → v) và không thanh", () => {
    expect(pinyinForms("lí kāi")).toEqual({ marked: "líkāi", numeric: "li2kai1", toneless: "likai" });
    expect(pinyinForms("nǚ ér")).toEqual({ marked: "nǚér", numeric: "nv3er2", toneless: "nuer" });
    expect(pinyinForms("bà ba")).toMatchObject({ numeric: "ba4ba" });
  });
});

describe("checkPinyin", () => {
  it("đúng hoàn toàn: có dấu hoặc số thanh, không phân biệt hoa thường/khoảng trắng", () => {
    for (const input of ["lí kāi", "LÍKĀI", "li2 kai1", "li2kai1", "  li2  kai1 "]) expect(checkPinyin(input, "lí kāi")).toBe("exact");
  });

  it("thanh nhẹ: gõ 5, gõ 0 hoặc bỏ trống đều đúng", () => {
    for (const input of ["ba4 ba", "ba4 ba5", "bà ba", "ba4ba0"]) expect(checkPinyin(input, "bà ba")).toBe("exact");
  });

  it("ü: chấp nhận ü, v và u:", () => {
    for (const input of ["nǚ ér", "nv3 er2", "nu:3 er2", "nü3er2"]) expect(checkPinyin(input, "nǚ ér")).toBe("exact");
  });

  it("đúng chữ cái nhưng không gõ thanh: no-tone; gõ sai thanh: wrong-tone", () => {
    expect(checkPinyin("li kai", "lí kāi")).toBe("no-tone");
    expect(checkPinyin("likai", "lí kāi")).toBe("no-tone");
    expect(checkPinyin("li3 kai1", "lí kāi")).toBe("wrong-tone");
    expect(checkPinyin("lǐ kāi", "lí kāi")).toBe("wrong-tone");
  });

  it("sai chữ cái, thiếu âm tiết, rỗng: wrong", () => {
    expect(checkPinyin("li2 kai2x", "lí kāi")).toBe("wrong");
    expect(checkPinyin("li2", "lí kāi")).toBe("wrong");
    expect(checkPinyin("", "lí kāi")).toBe("wrong");
    expect(checkPinyin("   ", "lí kāi")).toBe("wrong");
  });

  it("nhiều cách đọc hợp lệ: lấy kết quả tốt nhất", () => {
    expect(checkPinyin("ma", ["má", "ma"])).toBe("exact");
    expect(checkPinyin("má", ["má", "ma"])).toBe("exact");
    expect(checkPinyin("ma3", ["má", "ma"])).toBe("wrong-tone");
  });

  it("dấu nháy phân âm tiết (xī'ān) và dấu gạch được bỏ qua", () => {
    expect(checkPinyin("xi1an1", "xī'ān")).toBe("exact");
    expect(checkPinyin("xī-ān", "xī'ān")).toBe("exact");
  });
});

describe("pinyinHint", () => {
  it("ba cấp gợi ý tăng dần", () => {
    expect(pinyinHint("lí kāi", 1)).toBe("2 âm tiết");
    expect(pinyinHint("lí kāi", 2)).toBe("l… k…");
    expect(pinyinHint("lí kāi", 3)).toBe("li kai");
  });
});
