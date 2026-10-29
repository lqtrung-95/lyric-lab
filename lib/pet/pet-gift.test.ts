import { describe, expect, it } from "vitest";
import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { giftFromItem, parseGift, pickGiftItem } from "./pet-gift";

const item = (o: Partial<PreviewItem>): PreviewItem => ({ id: "x", type: "vocab", term: "笨拙", reading: "bènzhuō", level: 5, meaningInContext: "vụng về", occurrences: [], priority: 50, ...o });

describe("pickGiftItem", () => {
  it("chọn từ vựng ưu tiên cao nhất, bỏ ngữ pháp, cụm dài và mục thiếu nghĩa", () => {
    const picked = pickGiftItem([
      item({ id: "g", type: "grammar", priority: 99 }),
      item({ id: "long", term: "一二三四五六七", priority: 98 }),
      item({ id: "empty", meaningInContext: " ", priority: 97 }),
      item({ id: "a", priority: 10 }),
      item({ id: "b", term: "失去", priority: 60 }),
    ]);
    expect(picked?.id).toBe("b");
  });
  it("không có mục hợp lệ thì null", () => {
    expect(pickGiftItem([])).toBeNull();
    expect(pickGiftItem([item({ type: "grammar" })])).toBeNull();
  });
});

describe("giftFromItem", () => {
  it("làm sạch và cắt nghĩa dài, giữ pinyin từ mục", () => {
    const g = giftFromItem("vid", item({ meaningInContext: "a".repeat(80) }), "2026-10-29", (m) => m);
    expect([...g.meaning].length).toBe(40);
    expect(g.pinyin).toBe("bènzhuō");
    expect(g.videoId).toBe("vid");
  });
});

describe("parseGift", () => {
  it("đọc đúng dạng, sai dạng thì null", () => {
    expect(parseGift({ videoId: "v", term: "好", meaning: "tốt", day: "2026-10-29", pinyin: "hǎo" })?.pinyin).toBe("hǎo");
    expect(parseGift({ videoId: "v", term: "好", day: "d" })).toBeNull();
    expect(parseGift(null)).toBeNull();
    expect(parseGift({ videoId: "v", term: "好", meaning: "tốt", day: "d", pinyin: " " })?.pinyin).toBeNull();
  });
});
