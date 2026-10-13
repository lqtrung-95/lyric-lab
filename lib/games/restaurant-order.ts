import { shuffle, type Rng } from "@/lib/practice/random";
import { DISHES, dishById, type DishId } from "./restaurant-menu";

export interface OrderItem {
  dishId: DishId;
  qty: 1 | 2 | 3;
}

export interface Order {
  items: OrderItem[];
  zh: string;
  pinyin: string;
  vi: string;
}

/** Số khách mỗi ca; ba khách đầu gọi một món, các khách sau gọi hai món. */
export const CUSTOMERS_PER_SHIFT = 7;
const SINGLE_ORDERS = 3;

const ZH_NUM = { 1: "一", 2: "两", 3: "三" } as const;
const VI_NUM = { 1: "một", 2: "hai", 3: "ba" } as const;

function pinyinNumber(qty: OrderItem["qty"], measureZh: string): string {
  if (qty === 2) return "liǎng";
  if (qty === 3) return "sān";
  // 一 đọc yí trước thanh 4 (个 gè), yì trước các thanh còn lại.
  return measureZh === "个" ? "yí" : "yì";
}

/** Dựng câu gọi món (chữ Hán, pinyin, nghĩa tiếng Việt) từ danh sách món và số lượng. */
export function buildOrder(items: OrderItem[]): Order {
  const parts = items.map(({ dishId, qty }) => {
    const d = dishById(dishId);
    return { zh: `${ZH_NUM[qty]}${d.measure.zh}${d.zh}`, pinyin: `${pinyinNumber(qty, d.measure.zh)} ${d.measure.pinyin} ${d.pinyin}`, vi: `${VI_NUM[qty]} ${d.measure.vi} ${d.vi}` };
  });
  return {
    items,
    zh: `你好！我要${parts.map((p) => p.zh).join("和")}。`,
    pinyin: `Nǐ hǎo! Wǒ yào ${parts.map((p) => p.pinyin).join(" hé ")}.`,
    vi: `Xin chào! Cho tôi ${parts.map((p) => p.vi).join(" và ")}.`,
  };
}

const pickQty = (rng: Rng): OrderItem["qty"] => (Math.floor(rng() * 3) + 1) as OrderItem["qty"];

/** Một ca bán hàng: `CUSTOMERS_PER_SHIFT` đơn, đơn nào cũng khác đơn trước về món đầu tiên để không lặp liền nhau. */
export function buildShift(rng: Rng = Math.random): Order[] {
  const orders: Order[] = [];
  let pool: DishId[] = [];
  const take = (): DishId => {
    if (pool.length === 0) pool = shuffle(DISHES.map((d) => d.id), rng);
    return pool.shift()!;
  };
  for (let i = 0; i < CUSTOMERS_PER_SHIFT; i++) {
    const first = take();
    const items: OrderItem[] = [{ dishId: first, qty: pickQty(rng) }];
    if (i >= SINGLE_ORDERS) {
      let second = take();
      while (second === first) second = take();
      items.push({ dishId: second, qty: pickQty(rng) });
    }
    orders.push(buildOrder(items));
  }
  return orders;
}

/** Khay đúng khi mỗi món có đúng số lượng khách gọi (thứ tự món không quan trọng, món thừa là sai). */
export function isTrayCorrect(order: Order, tray: Partial<Record<DishId, number>>): boolean {
  const want = new Map(order.items.map((i) => [i.dishId, i.qty]));
  const have = Object.entries(tray).filter(([, n]) => (n ?? 0) > 0) as [DishId, number][];
  return have.length === want.size && have.every(([id, n]) => want.get(id) === n);
}
