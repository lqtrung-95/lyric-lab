// Di chuyển nhân vật trong cảnh: các hàm thuần (dễ test). Toạ độ là % khung cảnh, điểm (x, y) là chỗ chân đứng (giữa-đáy) như các vật.
// Khung cảnh 4:3 nên 1% chiều cao ngắn hơn 1% chiều rộng; mọi khoảng cách và tốc độ tính theo "% chiều rộng" để đi ngang và đi dọc nhanh như nhau.

export interface Vec { x: number; y: number }
export type Dir = "left" | "right" | "up" | "down";

/** Chiều cao / chiều rộng của khung cảnh. */
export const ASPECT = 0.75;
/** Vùng đi được (sàn nhà), theo % khung. */
export const FLOOR = { minX: 4, maxX: 96, minY: 38, maxY: 97 };
/** Tốc độ đi, % chiều rộng mỗi giây (qua cả phòng khoảng 3 giây). */
export const WALK_SPEED = 32;
/** Lại gần đồ vật trong bán kính này (từ điểm đứng) thì tương tác được. */
export const INTERACT_RADIUS = 7;
/** Điểm xuất phát của nhân vật. */
export const START: Vec = { x: 50, y: 92 };

export const dist = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, (a.y - b.y) * ASPECT);

export function clampToFloor(p: Vec, f = FLOOR): Vec {
  return { x: Math.min(f.maxX, Math.max(f.minX, p.x)), y: Math.min(f.maxY, Math.max(f.minY, p.y)) };
}

/** Một bước đi thẳng tới `target`; `arrived` khi bước này tới nơi. */
export function stepToward(pos: Vec, target: Vec, speed: number, dt: number): { pos: Vec; arrived: boolean } {
  const d = dist(pos, target);
  const step = speed * dt;
  if (d <= step || d === 0) return { pos: target, arrived: true };
  const k = step / d;
  return { pos: { x: pos.x + (target.x - pos.x) * k, y: pos.y + ((target.y - pos.y) * k) }, arrived: false };
}

const KEY_DIR: Record<string, Dir> = {
  arrowleft: "left", a: "left", arrowright: "right", d: "right", arrowup: "up", w: "up", arrowdown: "down", s: "down",
};
/** Phím → hướng đi (mũi tên hoặc WASD); phím khác trả null. */
export const keyToDir = (key: string): Dir | null => KEY_DIR[key.toLowerCase()] ?? null;

/** Hướng đang giữ → vectơ đơn vị theo đơn vị chiều rộng (đi chéo không nhanh hơn); không giữ gì thì null. */
export function heldDirection(held: ReadonlySet<Dir>): Vec | null {
  const x = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
  const y = (held.has("down") ? 1 : 0) - (held.has("up") ? 1 : 0);
  if (x === 0 && y === 0) return null;
  const n = Math.hypot(x, y);
  return { x: x / n, y: y / n };
}

/** Đi theo hướng giữ phím trong `dt` giây (dy quy đổi từ đơn vị chiều rộng sang % chiều cao), giới hạn trong sàn. */
export function moveBy(pos: Vec, dir: Vec, speed: number, dt: number): Vec {
  return clampToFloor({ x: pos.x + dir.x * speed * dt, y: pos.y + (dir.y * speed * dt) / ASPECT });
}

export interface Interactable { id: string; at: Vec }

/** Vật gần nhất trong bán kính tương tác (tính từ điểm đứng); không có thì null. */
export function nearestInteractable(pos: Vec, items: readonly Interactable[], radius = INTERACT_RADIUS): string | null {
  let best: string | null = null;
  let bestD = radius;
  for (const it of items) {
    const d = dist(pos, it.at);
    if (d <= bestD) { best = it.id; bestD = d; }
  }
  return best;
}

/** Điểm nhân vật đứng để tương tác với một vật: `stand` nếu có, không thì ngay trước chân vật (trên sàn). */
export function standPoint(o: { x: number; y: number; stand?: Vec }): Vec {
  return o.stand ?? clampToFloor({ x: o.x, y: o.y + 4 });
}
