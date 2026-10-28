// Dữ liệu và luật của bản thử nghiệm quán ăn: ba bếp, ba món, khách gọi bằng tiếng Trung. Pinyin hiển thị lấy từ từ điển ở bản chính thức; bản thử dùng chuỗi cố định.

export type StationId = "steamer" | "soy" | "griddle";
export interface Station { id: StationId; han: string; pinyin: string; x: number; z: number; r: number; item: { han: string; pinyin: string; vi: string; price: number } }
export interface Order { stationId: StationId; zh: string; pinyin: string; vi: string }

export const STATIONS: Station[] = [
  { id: "steamer", han: "蒸笼", pinyin: "zhēnglóng", x: -4.4, z: -3.2, r: 0.9, item: { han: "包子", pinyin: "bāozi", vi: "bánh bao", price: 6 } },
  { id: "soy", han: "豆浆机", pinyin: "dòujiāngjī", x: -1.6, z: -3.2, r: 0.8, item: { han: "豆浆", pinyin: "dòujiāng", vi: "sữa đậu nành", price: 4 } },
  { id: "griddle", han: "铁板", pinyin: "tiěbǎn", x: 1.2, z: -3.2, r: 0.9, item: { han: "煎饼", pinyin: "jiānbing", vi: "bánh kếp", price: 8 } },
];
export const TABLE = { x: 3.6, z: 1.6, r: 1.1 };

export const ORDERS: Order[] = [
  { stationId: "steamer", zh: "你好！我要两个包子。", pinyin: "Nǐ hǎo! Wǒ yào liǎng ge bāozi.", vi: "Xin chào! Cho tôi hai cái bánh bao." },
  { stationId: "soy", zh: "请给我一杯豆浆。", pinyin: "Qǐng gěi wǒ yì bēi dòujiāng.", vi: "Làm ơn cho tôi một cốc sữa đậu nành." },
  { stationId: "griddle", zh: "我想吃一个煎饼。", pinyin: "Wǒ xiǎng chī yí ge jiānbing.", vi: "Tôi muốn ăn một cái bánh kếp." },
];

/** Đơn kế tiếp, khác đơn hiện tại để không lặp liền nhau. */
export function nextOrder(current: Order | null, rng: () => number): Order {
  const pool = current ? ORDERS.filter((o) => o !== current) : ORDERS;
  return pool[Math.floor(rng() * pool.length)];
}

/** Phục vụ: đúng món thì được tiền của món đó, sai món thì 0. */
export function serve(order: Order, carrying: StationId | null): { correct: boolean; coins: number } {
  if (carrying !== order.stationId) return { correct: false, coins: 0 };
  return { correct: true, coins: STATIONS.find((s) => s.id === carrying)!.item.price };
}
