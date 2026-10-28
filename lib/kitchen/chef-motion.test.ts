import { describe, expect, it } from "vitest";
import { CHEF_RADIUS, ROOM, directionTo, nearestWithin, stepChef } from "./chef-motion";

describe("chef motion", () => {
  it("đi theo hướng với tốc độ cố định, đi chéo không nhanh hơn", () => {
    const straight = stepChef({ x: 0, z: 0 }, { x: 1, z: 0 }, 0.1, []);
    const diagonal = stepChef({ x: 0, z: 0 }, { x: 1, z: 1 }, 0.1, []);
    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(straight.x, 5);
  });
  it("không đi ra ngoài phòng", () => {
    expect(stepChef({ x: ROOM.maxX, z: 0 }, { x: 1, z: 0 }, 1, []).x).toBe(ROOM.maxX);
    expect(stepChef({ x: 0, z: ROOM.minZ }, { x: 0, z: -1 }, 1, []).z).toBe(ROOM.minZ);
  });
  it("bị đẩy ra khỏi vật cản", () => {
    const o = { x: 2, z: 0, r: 1 };
    const p = stepChef({ x: 0.5, z: 0 }, { x: 1, z: 0 }, 1, [o]);
    expect(Math.hypot(p.x - o.x, p.z - o.z)).toBeGreaterThanOrEqual(o.r + CHEF_RADIUS - 1e-6);
  });
  it("hướng tới đích và dừng khi đã tới", () => {
    expect(directionTo({ x: 0, z: 0 }, { x: 3, z: 0 })).toEqual({ x: 1, z: 0 });
    expect(directionTo({ x: 0, z: 0 }, { x: 0.05, z: 0 })).toBeNull();
  });
  it("chọn vật gần nhất trong tầm với", () => {
    const items = [{ id: "a", x: 1, z: 0 }, { id: "b", x: 5, z: 0 }];
    expect(nearestWithin({ x: 0, z: 0 }, items)?.id).toBe("a");
    expect(nearestWithin({ x: 0, z: 0 }, [items[1]])).toBeUndefined();
  });
});
