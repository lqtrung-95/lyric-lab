import { describe, expect, it } from "vitest";
import { emptyStats, HOME_ITEMS, HOME_SLOTS, itemProgress, itemUnlocked, newlyUnlocked, parseHomeState, resolvePlacement, type HomeStats } from "./pet-home";

const stats = (o: Partial<HomeStats> = {}): HomeStats => ({ ...emptyStats(), ...o });
const byId = (id: string) => HOME_ITEMS.find((i) => i.id === id)!;

describe("danh mục đồ", () => {
  it("id không trùng; mọi loại đều có ít nhất 2 món có sẵn hoặc mở được để lấp các chỗ", () => {
    expect(new Set(HOME_ITEMS.map((i) => i.id)).size).toBe(HOME_ITEMS.length);
    for (const kind of ["wall", "floor", "small"] as const) expect(HOME_ITEMS.filter((i) => i.kind === kind).length).toBeGreaterThanOrEqual(5);
    // Người mới (chưa làm gì) vẫn thấy một ngôi nhà không trống hoàn toàn: mỗi loại có ít nhất 1 món có sẵn.
    for (const kind of ["wall", "floor", "small"] as const) expect(HOME_ITEMS.some((i) => i.kind === kind && !i.need), kind).toBe(true);
  });
});

describe("mở khóa", () => {
  it("đồ có sẵn luôn mở; đồ có điều kiện mở khi đủ ngưỡng", () => {
    expect(itemUnlocked(byId("bed"), stats())).toBe(true);
    expect(itemUnlocked(byId("lamp"), stats({ streakLongest: 6 }))).toBe(false);
    expect(itemUnlocked(byId("lamp"), stats({ streakLongest: 7 }))).toBe(true);
  });
  it("tiến độ bị kẹp ở mức cần; đồ có sẵn không có tiến độ", () => {
    expect(itemProgress(byId("lamp"), stats({ streakLongest: 3 }))).toEqual({ have: 3, need: 7 });
    expect(itemProgress(byId("lamp"), stats({ streakLongest: 99 }))).toEqual({ have: 7, need: 7 });
    expect(itemProgress(byId("bed"), stats())).toBeNull();
  });
  it("newlyUnlocked chỉ báo đồ mở khóa chưa thấy, không báo đồ có sẵn", () => {
    const s = stats({ streakLongest: 7 });
    expect(newlyUnlocked([], s).map((i) => i.id).sort()).toEqual(["lamp", "rug"]);
    expect(newlyUnlocked(["rug"], s).map((i) => i.id)).toEqual(["lamp"]);
    expect(newlyUnlocked([], stats())).toEqual([]);
  });
});

describe("resolvePlacement", () => {
  it("tự động: lấp mỗi chỗ bằng đồ mở khóa mới nhất cùng loại, không trùng", () => {
    const r = resolvePlacement({}, stats({ streakLongest: 7, level: 5, visited: 10 }));
    for (const slot of HOME_SLOTS.filter((s) => s.kind !== "wall")) expect(r[slot.id]).toBeTruthy();
    const ids = Object.values(r).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
    expect(r.shelfL).toBe("inkset");
    expect(r.shelfR).toBe("globe");
  });
  it("giữ lựa chọn hợp lệ của người dùng; chỗ để trống (null) thì trống", () => {
    const s = stats({ streakLongest: 7 });
    const r = resolvePlacement({ floorL: "bed", floorR: null, shelfL: "lamp" }, s);
    expect(r.floorL).toBe("bed");
    expect(r.floorR).toBeNull();
    expect(r.shelfL).toBe("lamp");
  });
  it("bỏ lựa chọn không hợp lệ: sai loại, chưa mở khóa hoặc trùng chỗ khác (rồi tự động lấp)", () => {
    const s = stats();
    const r = resolvePlacement({ wallL: "bed", floorL: "trophy", shelfL: "bowl", shelfR: "bowl" }, s);
    expect(r.wallL).toBe("window");
    expect(r.floorL).toBe("bed");
    expect(r.shelfL).toBe("bowl");
    expect(r.shelfR).toBeNull();
  });
});

describe("parseHomeState", () => {
  it("đọc đúng dạng, bỏ giá trị lạ", () => {
    const s = parseHomeState({ placed: { wallL: "window", floorL: null, wallR: "khong-co", shelfR: 5, extra: "x" }, seen: ["rug", "khong-co", 3] });
    expect(s.placed).toEqual({ wallL: "window", floorL: null });
    expect(s.seen).toEqual(["rug"]);
  });
  it("rác hoặc null thì rỗng", () => {
    expect(parseHomeState(null)).toEqual({ placed: {}, seen: [] });
    expect(parseHomeState("x")).toEqual({ placed: {}, seen: [] });
  });
});
