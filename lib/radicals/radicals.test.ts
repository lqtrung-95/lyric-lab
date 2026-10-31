import { describe, expect, it } from "vitest";
import { ENTRIES, TOPICS, entriesOfTopic, searchRadicals } from "./radicals";
import { RADICALS } from "./radicals-core";
import { RICH } from "./radicals-rich";

describe("214 bộ thủ", () => {
  it("đủ 214 bộ, số thứ tự liên tục, chữ không trùng", () => {
    expect(RADICALS).toHaveLength(214);
    RADICALS.forEach((r, i) => expect(r.num).toBe(i + 1));
    expect(new Set(RADICALS.map((r) => r.char)).size).toBe(214);
  });
  it("mỗi bộ đủ tên, nghĩa, pinyin và số nét hợp lệ, số nét không giảm theo thứ tự", () => {
    let prev = 1;
    for (const r of RADICALS) {
      expect(r.name.length, r.char).toBeGreaterThan(0);
      expect(r.meaning.length, r.char).toBeGreaterThan(0);
      expect(r.pinyin, r.char).toMatch(/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+$/);
      expect(r.strokes, r.char).toBeGreaterThanOrEqual(prev);
      prev = r.strokes;
    }
  });
  it("có ít nhất 100 bộ nội dung đầy đủ, khóa đều là bộ có thật, mỗi bộ có chữ ví dụ", () => {
    const keys = Object.keys(RICH);
    expect(keys.length).toBeGreaterThanOrEqual(100);
    for (const k of keys) {
      expect(RADICALS.some((r) => r.char === k), k).toBe(true);
      expect(RICH[k].chars.length, k).toBeGreaterThanOrEqual(1);
      expect(RICH[k].mnemonic.length, k).toBeGreaterThan(10);
      expect(RICH[k].use.length, k).toBeGreaterThan(10);
    }
  });
  it("chữ ví dụ không trùng chính chữ bộ", () => {
    for (const [k, v] of Object.entries(RICH)) expect(v.chars, k).not.toContain(k);
  });
  it("mọi bộ thuộc đúng một chủ đề và chủ đề nào cũng có bộ", () => {
    expect(ENTRIES.every((e) => TOPICS.some((t) => t.id === e.topic))).toBe(true);
    for (const t of TOPICS) expect(entriesOfTopic(t.id).length, t.id).toBeGreaterThan(0);
    expect(TOPICS.reduce((n, t) => n + entriesOfTopic(t.id).length, 0)).toBe(214);
  });
});

describe("tìm bộ thủ", () => {
  it("theo chữ, biến thể, pinyin không dấu, tên Việt không dấu và số", () => {
    expect(searchRadicals("水").map((e) => e.num)).toContain(85);
    expect(searchRadicals("氵").map((e) => e.num)).toContain(85);
    expect(searchRadicals("shui").map((e) => e.num)).toContain(85);
    expect(searchRadicals("thuy").map((e) => e.num)).toContain(85);
    expect(searchRadicals("nuoc").map((e) => e.num)).toContain(85);
    expect(searchRadicals("9")[0].char).toBe("人");
  });
  it("rỗng trả hết", () => { expect(searchRadicals("  ")).toHaveLength(214); });
});
