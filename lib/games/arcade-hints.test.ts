import { describe, expect, it } from "vitest";
import { parseHints } from "./arcade-hints";

describe("parseHints", () => {
  it("mặc định bật cả hai khi chưa có hoặc dữ liệu hỏng", () => {
    expect(parseHints("")).toEqual({ pinyin: true, meaning: true });
    expect(parseHints("{hỏng")).toEqual({ pinyin: true, meaning: true });
  });
  it("đọc lựa chọn đã lưu, bỏ qua giá trị sai kiểu", () => {
    expect(parseHints('{"pinyin":false,"meaning":true}')).toEqual({ pinyin: false, meaning: true });
    expect(parseHints('{"pinyin":"no","meaning":false}')).toEqual({ pinyin: true, meaning: false });
  });
});
