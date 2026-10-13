import { describe, expect, it } from "vitest";
import { seededRng } from "@/lib/practice/random";
import { buildOrder } from "./restaurant-order";
import { CARRY_CAPACITY, clearTray, createGame, deliver, MAX_AT_ONCE, PATIENCE_SECONDS, pickUp, SHIFT_SIZE, tickGame } from "./restaurant-engine";
import { nearestTarget, stepByDirection, stepToward, START, TABLES, WORLD_H } from "./restaurant-world";

describe("tickGame", () => {
  it("khách đầu đến gần như ngay; không quá số khách cùng lúc; hết hàng đợi thì không đến nữa", () => {
    const g = createGame(seededRng(1));
    expect(tickGame(g, 1, seededRng(2))).toHaveLength(1);
    for (let i = 0; i < 20; i++) tickGame(g, 9, seededRng(i));
    expect(g.customers.length).toBeLessThanOrEqual(MAX_AT_ONCE);
    expect(g.customers.length + g.queue.length + g.left + g.served).toBe(SHIFT_SIZE);
  });
  it("khách hết kiên nhẫn thì bỏ đi và ca kết thúc khi không còn ai", () => {
    const g = createGame(seededRng(3));
    for (let i = 0; i < 200 && !g.finished; i++) tickGame(g, PATIENCE_SECONDS, seededRng(i));
    expect(g.finished).toBe(true);
    expect(g.left).toBe(SHIFT_SIZE);
    expect(g.message?.kind).toBe("warn");
  });
  it("hai khách không bao giờ ngồi cùng một bàn", () => {
    for (let s = 0; s < 30; s++) {
      const g = createGame(seededRng(s));
      for (let i = 0; i < 12; i++) tickGame(g, 5, seededRng(s * 100 + i));
      expect(new Set(g.customers.map((c) => c.table)).size).toBe(g.customers.length);
    }
  });
});

describe("deliver", () => {
  const setup = () => {
    const g = createGame(seededRng(1));
    g.queue = [];
    g.customers = [{ id: 1, table: 2, order: buildOrder([{ dishId: "baozi", qty: 2 }]), patience: 0.9 }];
    return g;
  };
  it("đúng món và số lượng: nhận 15 xu khi khách còn kiên nhẫn, dọn khay, hết ca", () => {
    const g = setup();
    pickUp(g, "baozi"); pickUp(g, "baozi");
    expect(deliver(g, 2)).toBe("served");
    expect(g.coins).toBe(15);
    expect(g.carried).toEqual([]);
    expect(g.finished).toBe(true);
  });
  it("khách đã chờ lâu (dưới một nửa) chỉ trả 10 xu", () => {
    const g = setup();
    g.customers[0].patience = 0.3;
    pickUp(g, "baozi"); pickUp(g, "baozi");
    deliver(g, 2);
    expect(g.coins).toBe(10);
  });
  it("sai món: giữ khay, khách bớt kiên nhẫn, không có xu", () => {
    const g = setup();
    pickUp(g, "baozi");
    expect(deliver(g, 2)).toBe("wrong");
    expect(g.carried).toEqual(["baozi"]);
    expect(g.customers[0].patience).toBeCloseTo(0.8);
    expect(g.coins).toBe(0);
  });
  it("bàn trống và khay trống được báo, không đổi gì", () => {
    const g = setup();
    expect(deliver(g, 0)).toBe("empty_table");
    expect(deliver(g, 2)).toBe("empty_tray");
  });
});

describe("khay", () => {
  it("tối đa 6 phần; đổ rác làm trống", () => {
    const g = createGame(seededRng(1));
    for (let i = 0; i < CARRY_CAPACITY; i++) expect(pickUp(g, "zhou")).toBe(true);
    expect(pickUp(g, "zhou")).toBe(false);
    clearTray(g);
    expect(g.carried).toEqual([]);
  });
});

describe("di chuyển", () => {
  it("đi theo hướng, nhanh bằng nhau theo mọi hướng và không ra ngoài khung", () => {
    const a = stepByDirection(START, 1, 0, 0.1);
    const b = stepByDirection(START, 1, 1, 0.1);
    expect(Math.hypot(a.x - START.x, a.y - START.y)).toBeCloseTo(Math.hypot(b.x - START.x, b.y - START.y));
    const edge = stepByDirection({ x: 96, y: 57 }, 1, 1, 5);
    expect(edge.x).toBeLessThanOrEqual(97);
    expect(edge.y).toBeLessThanOrEqual(58);
    expect(WORLD_H).toBeGreaterThan(58);
  });
  it("không đi xuyên bàn", () => {
    const t = TABLES[1];
    const p = stepByDirection({ x: t.x, y: t.y - 12 }, 0, 1, 1);
    expect(Math.hypot(p.x - t.x, p.y - t.y)).toBeGreaterThanOrEqual(9.4);
  });
  it("đi tới đích thì dừng đúng đích", () => {
    expect(stepToward({ x: 10, y: 30 }, { x: 11, y: 30 }, 5)).toEqual({ x: 11, y: 30 });
  });
  it("mục gần nhất trong tầm với", () => {
    expect(nearestTarget({ x: 8, y: 21 })).toEqual({ kind: "station", dishId: "baozi" });
    expect(nearestTarget({ x: 50, y: 28 })).toBeNull();
    expect(nearestTarget({ x: 17, y: 49 })).toEqual({ kind: "table", index: 0 });
  });
});
