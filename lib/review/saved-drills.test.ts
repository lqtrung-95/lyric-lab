import { describe, expect, it } from "vitest";
import { buildSavedDrills, drillFor, usableCards, type DrillCard } from "./saved-drills";

const card = (term: string, pinyin: string | null, meaning: string, extra: Partial<DrillCard> = {}): DrillCard => ({ item_key: `vocab:${term}`, kind: "vocab", term, pinyin, meaning, ...extra });
const pool = [card("猫", "māo", "con mèo"), card("狗", "gǒu", "con chó"), card("鱼", "yú", "con cá"), card("鸟", "niǎo", "con chim"), card("马", "mǎ", "con ngựa"), card("牛", "niú", "con bò")];

describe("bài tập từ thẻ đã lưu", () => {
  it("chỉ dùng thẻ từ vựng có nghĩa", () => {
    expect(usableCards([card("猫", "māo", "con mèo"), card("把", null, "", {}), { ...card("比", "bǐ", "so sánh"), kind: "grammar" }])).toHaveLength(1);
  });
  it("mỗi câu có đủ 4 đáp án khác nhau, chứa đáp án đúng", () => {
    for (const kind of ["meaning", "term", "pinyin"] as const) {
      const d = drillFor(pool[0], kind, pool, () => 0.3)!;
      expect(d.options).toHaveLength(4);
      expect(new Set(d.options).size).toBe(4);
      expect(d.options).toContain(d.answer);
    }
    expect(drillFor(pool[0], "meaning", pool, () => 0.3)!.answer).toBe("con mèo");
    expect(drillFor(pool[0], "term", pool, () => 0.3)!.shown).toBe("con mèo");
  });
  it("thiếu dữ liệu thì không có câu: thẻ không pinyin, hoặc ít hơn 3 nhiễu", () => {
    expect(drillFor(card("猫", null, "con mèo"), "pinyin", pool, () => 0.3)).toBeNull();
    expect(drillFor(pool[0], "meaning", pool.slice(0, 3), () => 0.3)).toBeNull();
  });
  it("nghĩa trùng nhau không thành hai đáp án giống nhau", () => {
    const dup = [card("猫", "māo", "mèo"), card("貓", "māo", "mèo"), card("狗", "gǒu", "chó"), card("鱼", "yú", "cá"), card("鸟", "niǎo", "chim")];
    const d = drillFor(dup[0], "meaning", dup, () => 0.1)!;
    expect(new Set(d.options).size).toBe(4);
  });
  it("bộ bài: đủ số câu, mỗi thẻ một câu, ưu tiên thẻ hay quên; dưới 4 thẻ thì rỗng", () => {
    const withLapse = pool.map((c) => (c.term === "牛" ? { ...c, lapses: 3 } : c));
    const ds = buildSavedDrills(withLapse, 3, () => 0.5);
    expect(ds).toHaveLength(3);
    expect(new Set(ds.map((d) => d.cardKey)).size).toBe(3);
    expect(ds.map((d) => d.term)).toContain("牛");
    expect(buildSavedDrills(pool.slice(0, 3), 5)).toEqual([]);
  });
});
