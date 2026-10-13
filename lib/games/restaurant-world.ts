import { DISHES, type DishId } from "./restaurant-menu";

/** Thế giới của game Quán ăn: toạ độ 0–100 theo chiều ngang, 0–`WORLD_H` theo chiều dọc (tỉ lệ khung 100:62). */
export const WORLD_H = 62;
export interface Point { x: number; y: number }

export const PLAYER_SPEED = 30;
export const INTERACT_RANGE = 8;
const BOUNDS = { minX: 3, maxX: 97, minY: 19, maxY: 58 };
const TABLE_RADIUS = 7;
const PLAYER_RADIUS = 2.5;

/** Quầy món dọc mép trên: mỗi món một ô; người chơi đứng ngay dưới ô để lấy. */
export const STATIONS = DISHES.map((d, i) => ({ dishId: d.id, x: 8 + i * 12, y: 9, stand: { x: 8 + i * 12, y: 21 } }));
/** Bốn bàn thành một hàng; chỗ đứng phục vụ nằm dưới bàn. */
export const TABLES = [0, 1, 2, 3].map((i) => ({ index: i, x: 17 + i * 22, y: 38, stand: { x: 17 + i * 22, y: 49 } }));
export const BIN = { x: 6, y: 55, stand: { x: 13, y: 54 } };
export const START: Point = { x: 50, y: 28 };

export type Target = { kind: "station"; dishId: DishId } | { kind: "table"; index: number } | { kind: "bin" } | { kind: "floor"; x: number; y: number };

export function targetPoint(t: Target): Point {
  switch (t.kind) {
    case "station": return STATIONS.find((s) => s.dishId === t.dishId)!.stand;
    case "table": return TABLES[t.index].stand;
    case "bin": return BIN.stand;
    case "floor": return { x: t.x, y: t.y };
  }
}

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const inRange = (p: Point, t: Target) => distance(p, targetPoint(t)) <= (t.kind === "floor" ? 1 : INTERACT_RANGE);

/** Mục tương tác gần nhất trong tầm với (cho phím E); null nếu không có. */
export function nearestTarget(p: Point): Target | null {
  const all: Target[] = [...STATIONS.map((s): Target => ({ kind: "station", dishId: s.dishId })), ...TABLES.map((t): Target => ({ kind: "table", index: t.index })), { kind: "bin" }];
  let best: Target | null = null;
  let bestD = INTERACT_RANGE;
  for (const t of all) {
    const d = distance(p, targetPoint(t));
    if (d <= bestD) { best = t; bestD = d; }
  }
  return best;
}

/** Đẩy người chơi ra khỏi bàn (hình tròn) và giữ trong khung sàn. */
function resolve(p: Point): Point {
  let { x, y } = p;
  for (const t of TABLES) {
    const d = Math.hypot(x - t.x, y - t.y);
    const min = TABLE_RADIUS + PLAYER_RADIUS;
    if (d < min) {
      const k = d === 0 ? 0 : min / d;
      x = d === 0 ? t.x + min : t.x + (x - t.x) * k;
      y = d === 0 ? t.y : t.y + (y - t.y) * k;
    }
  }
  return { x: Math.min(BOUNDS.maxX, Math.max(BOUNDS.minX, x)), y: Math.min(BOUNDS.maxY, Math.max(BOUNDS.minY, y)) };
}

/** Đi theo hướng (dx, dy) (không cần chuẩn hoá) trong `dt` giây. */
export function stepByDirection(p: Point, dx: number, dy: number, dt: number): Point {
  const len = Math.hypot(dx, dy);
  if (len === 0) return p;
  return resolve({ x: p.x + (dx / len) * PLAYER_SPEED * dt, y: p.y + (dy / len) * PLAYER_SPEED * dt });
}

/** Đi thẳng về `goal`; không vượt quá đích. */
export function stepToward(p: Point, goal: Point, dt: number): Point {
  const d = distance(p, goal);
  if (d <= 0.01) return p;
  const step = Math.min(d, PLAYER_SPEED * dt);
  return resolve({ x: p.x + ((goal.x - p.x) / d) * step, y: p.y + ((goal.y - p.y) / d) * step });
}
