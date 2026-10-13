/** Thực đơn quán ăn sáng của trò chơi "Quán ăn": mỗi món kèm lượng từ riêng để người chơi luyện số đếm và lượng từ. Dữ liệu viết tay (không qua AI). */
export type DishId = "baozi" | "mantou" | "jidan" | "doujiang" | "zhou" | "miantiao" | "youtiao" | "jiaozi";

export interface Measure {
  zh: string;
  pinyin: string;
  vi: string;
}

export interface Dish {
  id: DishId;
  zh: string;
  pinyin: string;
  vi: string;
  /** Hình gần đúng nhất trong bộ emoji (không có emoji riêng cho bánh bao, quẩy). */
  emoji: string;
  measure: Measure;
}

const GE: Measure = { zh: "个", pinyin: "ge", vi: "cái" };

export const DISHES: readonly Dish[] = [
  { id: "baozi", zh: "包子", pinyin: "bāozi", vi: "bánh bao", emoji: "🍙", measure: GE },
  { id: "mantou", zh: "馒头", pinyin: "mántou", vi: "màn thầu", emoji: "🍞", measure: GE },
  { id: "jidan", zh: "鸡蛋", pinyin: "jīdàn", vi: "trứng gà", emoji: "🥚", measure: { zh: "个", pinyin: "ge", vi: "quả" } },
  { id: "doujiang", zh: "豆浆", pinyin: "dòujiāng", vi: "sữa đậu nành", emoji: "🥛", measure: { zh: "杯", pinyin: "bēi", vi: "ly" } },
  { id: "zhou", zh: "粥", pinyin: "zhōu", vi: "cháo", emoji: "🥣", measure: { zh: "碗", pinyin: "wǎn", vi: "bát" } },
  { id: "miantiao", zh: "面条", pinyin: "miàntiáo", vi: "mì", emoji: "🍜", measure: { zh: "碗", pinyin: "wǎn", vi: "bát" } },
  { id: "youtiao", zh: "油条", pinyin: "yóutiáo", vi: "quẩy", emoji: "🥖", measure: { zh: "根", pinyin: "gēn", vi: "cái" } },
  { id: "jiaozi", zh: "饺子", pinyin: "jiǎozi", vi: "sủi cảo", emoji: "🥟", measure: { zh: "盘", pinyin: "pán", vi: "đĩa" } },
];

export const dishById = (id: DishId): Dish => DISHES.find((d) => d.id === id)!;
