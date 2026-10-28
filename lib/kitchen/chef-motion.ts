// Chuyển động của đầu bếp trong quán (mặt phẳng x–z nhìn từ trên xuống): hàm thuần, không phụ thuộc cảnh 3D để test được.

export interface Vec2 { x: number; z: number }
export interface Circle extends Vec2 { r: number }

export const ROOM = { minX: -6.2, maxX: 6.2, minZ: -4.2, maxZ: 4.6 } as const;
export const CHEF_RADIUS = 0.45;
export const CHEF_SPEED = 4.4;
export const REACH = 1.9;

const len = (v: Vec2): number => Math.hypot(v.x, v.z);

/** Hướng đơn vị từ `from` tới `to`; null khi đã tới trong `arrive`. Dùng cho chạm-để-đi. */
export function directionTo(from: Vec2, to: Vec2, arrive = 0.12): Vec2 | null {
  const d = { x: to.x - from.x, z: to.z - from.z };
  const l = len(d);
  return l <= arrive ? null : { x: d.x / l, z: d.z / l };
}

/** Một bước đi: tiến theo `dir` (độ dài ≤ 1), bị giữ trong phòng và đẩy ra khỏi các vật cản hình tròn (bếp, bàn). */
export function stepChef(pos: Vec2, dir: Vec2, dt: number, obstacles: readonly Circle[]): Vec2 {
  const l = len(dir);
  const k = l > 1 ? 1 / l : 1;
  let p = { x: pos.x + dir.x * k * CHEF_SPEED * dt, z: pos.z + dir.z * k * CHEF_SPEED * dt };
  p = { x: Math.min(ROOM.maxX, Math.max(ROOM.minX, p.x)), z: Math.min(ROOM.maxZ, Math.max(ROOM.minZ, p.z)) };
  for (const o of obstacles) {
    const d = { x: p.x - o.x, z: p.z - o.z };
    const dist = len(d), min = o.r + CHEF_RADIUS;
    if (dist < min) {
      const n = dist < 1e-6 ? { x: 1, z: 0 } : { x: d.x / dist, z: d.z / dist };
      p = { x: o.x + n.x * min, z: o.z + n.z * min };
    }
  }
  return p;
}

/** Vật tương tác gần nhất trong tầm với (bếp, bàn khách); undefined nếu không có. */
export function nearestWithin<T extends Vec2>(pos: Vec2, items: readonly T[], reach = REACH): T | undefined {
  let best: T | undefined, bestD = reach;
  for (const it of items) {
    const d = Math.hypot(it.x - pos.x, it.z - pos.z);
    if (d <= bestD) { best = it; bestD = d; }
  }
  return best;
}
