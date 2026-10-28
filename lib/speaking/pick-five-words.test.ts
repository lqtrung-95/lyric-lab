import { describe, expect, it } from "vitest";
import { seededRng } from "@/lib/practice/random";
import { pickFiveWords } from "./pick-five-words";

const NOW = new Date("2026-10-28T00:00:00Z");
const card = (term: string, over: Record<string, unknown> = {}) => ({ item_key: term, kind: "vocab", term, state: 2, due: "2026-10-01T00:00:00Z", last_review: null, created_at: "2026-09-01T00:00:00Z", ...over });

describe("pickFiveWords", () => {
  it("chỉ lấy từ vựng 2–4 chữ Hán, tối đa 5", () => {
    const cards = [card("咖啡"), card("茶"), card("一二三四五"), card("abc"), card("语法", { kind: "grammar" }), ...["牛奶", "面包", "米饭", "苹果", "香蕉", "西瓜"].map((t) => card(t))];
    const picked = pickFiveWords(cards, NOW, seededRng(3));
    expect(picked).toHaveLength(5);
    expect(picked.every((c) => ["咖啡", "牛奶", "面包", "米饭", "苹果", "香蕉", "西瓜"].includes(c.term))).toBe(true);
  });
  it("ít hơn 5 từ hợp lệ thì trả đúng số đó", () => {
    expect(pickFiveWords([card("咖啡"), card("茶")], NOW)).toHaveLength(1);
  });
});
