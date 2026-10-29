import { describe, expect, it } from "vitest";
import { RADICAL_NAMES } from "./radical-names";

describe("bảng tên bộ thủ", () => {
  it("khóa là đúng một ký tự và pinyin có dấu thanh, nghĩa không rỗng", () => {
    for (const [k, v] of Object.entries(RADICAL_NAMES)) {
      expect([...k], k).toHaveLength(1);
      expect(v.pinyin, k).toMatch(/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+$/);
      expect(v.meaning.length, k).toBeGreaterThan(2);
    }
  });
});
