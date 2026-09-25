import { describe, expect, it } from "vitest";
import type { SavedItem } from "@/lib/user-state/learner-state";
import { filterSavedItems } from "./filter-saved-items";

const item = (over: Partial<SavedItem>): SavedItem => ({
  key: "vocab:x", videoId: "aaaaaaaaaaa", type: "vocab", term: "城市", lineIndex: 0, start: 0, savedAt: 1,
  reading: "chéngshì", sinoViet: "thành thị", level: 3, meaning: "thành phố", ...over,
});
const items = [
  item({ key: "vocab:城市", savedAt: 1 }),
  item({ key: "vocab:离开", term: "离开", reading: "líkāi", sinoViet: "ly khai", meaning: "rời đi", level: 2, savedAt: 3 }),
  item({ key: "grammar:把", type: "grammar", term: "把", reading: "bǎ", sinoViet: undefined, meaning: "cấu trúc 把", level: 4, savedAt: 2 }),
];
const all = { query: "", level: "all", kind: "all" } as const;

describe("filterSavedItems", () => {
  it("không lọc: mới lưu trước", () => {
    expect(filterSavedItems(items, all).map((i) => i.key)).toEqual(["vocab:离开", "grammar:把", "vocab:城市"]);
  });

  it("tìm không phân biệt dấu ở pinyin, Hán Việt và nghĩa", () => {
    expect(filterSavedItems(items, { ...all, query: "chengshi" }).map((i) => i.term)).toEqual(["城市"]);
    expect(filterSavedItems(items, { ...all, query: "thanh pho" }).map((i) => i.term)).toEqual(["城市"]);
    expect(filterSavedItems(items, { ...all, query: "LY KHAI" }).map((i) => i.term)).toEqual(["离开"]);
    expect(filterSavedItems(items, { ...all, query: "离" }).map((i) => i.term)).toEqual(["离开"]);
  });

  it("lọc theo cấp và loại, kết hợp được", () => {
    expect(filterSavedItems(items, { ...all, level: 4 }).map((i) => i.term)).toEqual(["把"]);
    expect(filterSavedItems(items, { ...all, kind: "vocab" })).toHaveLength(2);
    expect(filterSavedItems(items, { query: "thanh", level: 2, kind: "vocab" })).toEqual([]);
  });
});
