import { describe, expect, it } from "vitest";
import { ASPECT, clampToFloor, dist, FLOOR, heldDirection, INTERACT_RADIUS, keyToDir, moveBy, nearestInteractable, standPoint, stepToward, WALK_SPEED, type Dir } from "./player-movement";

describe("player-movement", () => {
  it("khoảng cách tính theo % chiều rộng: đi dọc 10% chiều cao chỉ bằng 7,5% chiều rộng", () => {
    expect(dist({ x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(10);
    expect(dist({ x: 0, y: 0 }, { x: 0, y: 10 })).toBeCloseTo(10 * ASPECT);
  });

  it("giới hạn trong sàn: không đi lên tường hay ra ngoài khung", () => {
    expect(clampToFloor({ x: -5, y: 10 })).toEqual({ x: FLOOR.minX, y: FLOOR.minY });
    expect(clampToFloor({ x: 120, y: 200 })).toEqual({ x: FLOOR.maxX, y: FLOOR.maxY });
    expect(clampToFloor({ x: 50, y: 60 })).toEqual({ x: 50, y: 60 });
  });

  it("stepToward: đi từng bước rồi tới đúng đích, không vượt quá", () => {
    const target = { x: 60, y: 90 };
    let r = stepToward({ x: 50, y: 90 }, target, WALK_SPEED, 0.1);
    expect(r.arrived).toBe(false);
    expect(r.pos.x).toBeCloseTo(50 + WALK_SPEED * 0.1);
    r = stepToward({ x: 59, y: 90 }, target, WALK_SPEED, 0.1);
    expect(r).toEqual({ pos: target, arrived: true });
    expect(stepToward(target, target, WALK_SPEED, 0.016).arrived).toBe(true);
  });

  it("phím: mũi tên và WASD đều nhận, phím khác bỏ qua; giữ hai phím đi chéo không nhanh hơn", () => {
    expect(keyToDir("ArrowLeft")).toBe("left");
    expect(keyToDir("W")).toBe("up");
    expect(keyToDir("e")).toBeNull();
    expect(heldDirection(new Set<Dir>())).toBeNull();
    expect(heldDirection(new Set<Dir>(["left", "right"]))).toBeNull();
    const diag = heldDirection(new Set<Dir>(["right", "down"]))!;
    expect(Math.hypot(diag.x, diag.y)).toBeCloseTo(1);
  });

  it("moveBy: đi theo hướng giữ phím và bị chặn ở mép sàn", () => {
    const p = moveBy({ x: 50, y: 90 }, { x: 1, y: 0 }, WALK_SPEED, 0.5);
    expect(p.x).toBeCloseTo(50 + WALK_SPEED * 0.5);
    expect(moveBy({ x: 95, y: 96 }, { x: 1, y: 1 }, WALK_SPEED, 1)).toEqual({ x: FLOOR.maxX, y: FLOOR.maxY });
  });

  it("nearestInteractable: chọn vật gần nhất trong bán kính, ngoài bán kính thì không có", () => {
    const items = [{ id: "a", at: { x: 20, y: 80 } }, { id: "b", at: { x: 26, y: 80 } }];
    expect(nearestInteractable({ x: 25, y: 80 }, items)).toBe("b");
    expect(nearestInteractable({ x: 21, y: 80 }, items)).toBe("a");
    expect(nearestInteractable({ x: 50, y: 80 }, items)).toBeNull();
    expect(nearestInteractable({ x: 20 + INTERACT_RADIUS + 1, y: 80 }, [items[0]])).toBeNull();
  });

  it("standPoint: dùng điểm đứng riêng nếu có, không thì ngay trước chân vật nhưng luôn trên sàn", () => {
    expect(standPoint({ x: 30, y: 27 })).toEqual({ x: 30, y: FLOOR.minY });
    expect(standPoint({ x: 20, y: 70 })).toEqual({ x: 20, y: 74 });
    expect(standPoint({ x: 50, y: 59, stand: { x: 50, y: 86 } })).toEqual({ x: 50, y: 86 });
  });
});
