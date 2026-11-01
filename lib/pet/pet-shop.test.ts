import { describe, expect, it } from "vitest";
import { EMPTY_SHOP, SHOP_ITEMS, accessoryLabel, buyItem, claimWeeklyXu, openChest, openSeasons, outfitIds, parseShop, seasonOpen, toggleEquip, xuBalance, xuEarned } from "./pet-shop";

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

describe("mùa lễ", () => {
  it("Tết, Trung thu, Noel mở đúng khoảng ngày", () => {
    expect(seasonOpen("tet", new Date(2027, 0, 20))).toBe(true); // 17 ngày trước mùng 1
    expect(seasonOpen("tet", new Date(2027, 0, 1))).toBe(false);
    expect(seasonOpen("tet", new Date(2027, 1, 20))).toBe(true); // 14 ngày sau
    expect(seasonOpen("tet", new Date(2027, 1, 25))).toBe(false);
    expect(seasonOpen("trungthu", new Date(2027, 8, 10))).toBe(true);
    expect(seasonOpen("trungthu", new Date(2027, 7, 1))).toBe(false);
    expect(seasonOpen("noel", new Date(2026, 11, 14))).toBe(false);
    expect(seasonOpen("noel", new Date(2026, 11, 15))).toBe(true);
    expect(seasonOpen("noel", new Date(2027, 0, 2))).toBe(false);
    expect(openSeasons(new Date(2026, 11, 20))).toEqual(["noel"]);
  });
  it("món mùa chỉ mua được trong mùa; đã mua thì đeo quanh năm", () => {
    const winter = new Date(2026, 11, 20), summer = new Date(2027, 5, 1);
    expect(buyItem(EMPTY_SHOP, "santahat", 9999, summer)).toBeNull();
    const s = buyItem(EMPTY_SHOP, "santahat", 9999, winter)!;
    expect(s.owned).toEqual(["santahat"]);
    expect(toggleEquip(toggleEquip(s, "santahat"), "santahat").equipped.head).toBe("santahat");
  });
});

describe("xu thưởng", () => {
  it("rương mỗi ngày một lần, 2–8 xu, cộng vào số dư", () => {
    const a = openChest(EMPTY_SHOP, "2026-11-02", 0)!;
    expect(a.xu).toBe(2);
    expect(openChest(a.state, "2026-11-02", 0.5)).toBeNull();
    const b = openChest(a.state, "2026-11-03", 0.999)!;
    expect(b.xu).toBe(8);
    expect(xuBalance(0, b.state)).toBe(10);
    expect(openChest(EMPTY_SHOP, "x", Number.NaN)!.xu).toBe(2);
  });
  it("thưởng tuần 20 xu, mỗi tuần một lần", () => {
    const a = claimWeeklyXu(EMPTY_SHOP, "2026-11-02")!;
    expect(xuBalance(0, a)).toBe(20);
    expect(claimWeeklyXu(a, "2026-11-02")).toBeNull();
    expect(claimWeeklyXu(a, "")).toBeNull();
  });
  it("tên phụ kiện", () => {
    expect(accessoryLabel("cap")).toBe("Mũ lưỡi trai");
    expect(accessoryLabel("scarf")).toBe("Khăn quàng");
  });
});
