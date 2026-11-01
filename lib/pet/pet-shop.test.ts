import { describe, expect, it } from "vitest";
import { EMPTY_SHOP, SHOP_ITEMS, buyItem, outfitIds, parseShop, toggleEquip, xuBalance, xuEarned } from "./pet-shop";

describe("xu", () => {
  it("1 xu mỗi 10 XP, không âm, trừ phần đã tiêu", () => {
    expect(xuEarned(0)).toBe(0);
    expect(xuEarned(99)).toBe(9);
    expect(xuEarned(-5)).toBe(0);
    expect(xuBalance(300, { ...EMPTY_SHOP, spent: 12 })).toBe(18);
    expect(xuBalance(10, { ...EMPTY_SHOP, spent: 50 })).toBe(0);
  });
});

describe("mua và đeo", () => {
  it("mua đủ xu thì sở hữu, đeo luôn và trừ xu; không đủ hoặc đã có thì null", () => {
    const cap = SHOP_ITEMS.find((i) => i.id === "cap")!;
    expect(buyItem(EMPTY_SHOP, "cap", cap.price * 10 - 1)).toBeNull();
    const s = buyItem(EMPTY_SHOP, "cap", cap.price * 10)!;
    expect(s.owned).toEqual(["cap"]);
    expect(s.equipped.head).toBe("cap");
    expect(s.spent).toBe(cap.price);
    expect(buyItem(s, "cap", 9999)).toBeNull();
    expect(buyItem(s, "nope", 9999)).toBeNull();
  });
  it("món mới cùng chỗ thay món cũ; bấm lại thì cởi; chưa sở hữu thì không đeo được", () => {
    let s = buyItem(EMPTY_SHOP, "cap", 9999)!;
    s = buyItem(s, "halo", 9999)!;
    expect(s.equipped.head).toBe("halo");
    s = toggleEquip(s, "cap");
    expect(s.equipped.head).toBe("cap");
    s = toggleEquip(s, "cap");
    expect(s.equipped.head).toBeUndefined();
    expect(toggleEquip(s, "wings")).toBe(s);
  });
});

describe("parseShop", () => {
  it("bỏ món lạ, món đeo chưa sở hữu hoặc sai chỗ, số xu sai", () => {
    const s = parseShop({ owned: ["cap", "ghost", "cap", 5], equipped: { head: "cap", face: "cap", neck: "bowtie" }, spent: -3 });
    expect(s.owned).toEqual(["cap"]);
    expect(s.equipped).toEqual({ head: "cap" });
    expect(s.spent).toBe(0);
    expect(parseShop(null)).toBe(EMPTY_SHOP);
    expect(parseShop([1])).toBe(EMPTY_SHOP);
  });
});

describe("outfitIds", () => {
  it("món cửa hàng ở đầu thay mũ/vương miện, ở cổ thay khăn quàng", () => {
    const s = buyItem(buyItem(EMPTY_SHOP, "cap", 9999)!, "bowtie", 9999)!;
    expect(outfitIds(["scarf", "hat", "crown"], s)).toEqual(["cap", "bowtie"]);
    expect(outfitIds(["scarf", "hat"], EMPTY_SHOP)).toEqual(["scarf", "hat"]);
  });
});
