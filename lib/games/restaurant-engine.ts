import type { Rng } from "@/lib/practice/random";
import type { DishId } from "./restaurant-menu";
import { buildShift, CUSTOMERS_PER_SHIFT, isTrayCorrect, type Order } from "./restaurant-order";
import { START, TABLES, type Point } from "./restaurant-world";

export const CARRY_CAPACITY = 6;
export const MAX_AT_ONCE = 3;
/** Khách chờ bao lâu thì bỏ đi: rộng rãi vì người học cần thời gian nghe và tìm món. */
export const PATIENCE_SECONDS = 80;
const SPAWN_GAP_SECONDS = 9;
const WRONG_PENALTY = 0.1;

export interface Customer {
  id: number;
  table: number;
  order: Order;
  /** 1 = vừa đến, 0 = bỏ đi. */
  patience: number;
}

export interface GameMessage {
  id: number;
  kind: "ok" | "warn" | "info";
  text: string;
}

/** Trạng thái một ca chơi. Các hàm bên dưới sửa trực tiếp đối tượng này (vòng lặp 60 khung hình/giây không tạo bản sao mỗi khung). */
export interface GameState {
  player: Point;
  carried: DishId[];
  customers: Customer[];
  queue: Order[];
  spawnTimer: number;
  nextId: number;
  coins: number;
  served: number;
  left: number;
  finished: boolean;
  message: GameMessage | null;
}

export function createGame(rng: Rng = Math.random): GameState {
  return { player: { ...START }, carried: [], customers: [], queue: buildShift(rng), spawnTimer: 0.5, nextId: 1, coins: 0, served: 0, left: 0, finished: false, message: null };
}

function say(g: GameState, kind: GameMessage["kind"], text: string) {
  g.message = { id: (g.message?.id ?? 0) + 1, kind, text };
}

export const trayCounts = (carried: DishId[]): Partial<Record<DishId, number>> => {
  const out: Partial<Record<DishId, number>> = {};
  for (const d of carried) out[d] = (out[d] ?? 0) + 1;
  return out;
};

/** Một nhịp thời gian: khách mất kiên nhẫn, khách mới đến. Trả về khách vừa đến (để đọc lời gọi món). */
export function tickGame(g: GameState, dt: number, rng: Rng = Math.random): Customer[] {
  if (g.finished) return [];
  for (const c of g.customers) c.patience -= dt / PATIENCE_SECONDS;
  const gone = g.customers.filter((c) => c.patience <= 0);
  if (gone.length > 0) {
    g.customers = g.customers.filter((c) => c.patience > 0);
    g.left += gone.length;
    say(g, "warn", `Bàn ${gone[0].table + 1} chờ lâu quá nên khách bỏ đi.`);
  }
  const arrived: Customer[] = [];
  g.spawnTimer -= dt;
  if (g.queue.length > 0 && g.customers.length < MAX_AT_ONCE && g.spawnTimer <= 0) {
    const free = TABLES.map((t) => t.index).filter((i) => !g.customers.some((c) => c.table === i));
    const table = free[Math.floor(rng() * free.length)];
    const customer: Customer = { id: g.nextId++, table, order: g.queue.shift()!, patience: 1 };
    g.customers.push(customer);
    arrived.push(customer);
    g.spawnTimer = SPAWN_GAP_SECONDS;
  }
  if (g.queue.length === 0 && g.customers.length === 0) g.finished = true;
  return arrived;
}

export function pickUp(g: GameState, dishId: DishId): boolean {
  if (g.carried.length >= CARRY_CAPACITY) {
    say(g, "warn", "Khay đầy rồi (tối đa 6 phần). Mang ra bàn hoặc đổ vào thùng rác.");
    return false;
  }
  g.carried.push(dishId);
  return true;
}

export function clearTray(g: GameState) {
  if (g.carried.length === 0) return;
  g.carried = [];
  say(g, "info", "Đã đổ khay vào thùng rác.");
}

/** Đưa khay cho khách ở bàn `table`. Đúng món và số lượng: nhận 10 xu (thêm 5 nếu khách còn kiên nhẫn trên một nửa). Sai: giữ nguyên khay, khách bớt kiên nhẫn. */
export function deliver(g: GameState, table: number): "served" | "wrong" | "empty_table" | "empty_tray" {
  const customer = g.customers.find((c) => c.table === table);
  if (!customer) { say(g, "info", `Bàn ${table + 1} chưa có khách.`); return "empty_table"; }
  if (g.carried.length === 0) { say(g, "info", "Khay đang trống: lấy món ở quầy phía trên trước nhé."); return "empty_tray"; }
  if (isTrayCorrect(customer.order, trayCounts(g.carried))) {
    const earned = 10 + (customer.patience >= 0.5 ? 5 : 0);
    g.coins += earned;
    g.served++;
    g.customers = g.customers.filter((c) => c !== customer);
    g.carried = [];
    say(g, "ok", `Đúng rồi! +¥${earned}. ${customer.order.vi}`);
    if (g.queue.length === 0 && g.customers.length === 0) g.finished = true;
    return "served";
  }
  customer.patience = Math.max(0.05, customer.patience - WRONG_PENALTY);
  say(g, "warn", "Chưa đúng món hoặc số lượng. Nghe lại lời khách gọi rồi chỉnh khay nhé.");
  return "wrong";
}

export const SHIFT_SIZE = CUSTOMERS_PER_SHIFT;
