import { describe, expect, it } from "vitest";
import { foldVietnamese } from "./fold-vietnamese";

describe("foldVietnamese", () => {
  it("bỏ dấu, đ → d, chữ thường, gộp khoảng trắng", () => {
    expect(foldVietnamese("  Đại   Thành ")).toBe("dai thanh");
    expect(foldVietnamese("yêu thương")).toBe("yeu thuong");
  });
});
