import { shuffle, type Rng } from "./random";

export interface PoolCard {
  item_key: string;
  state: number;
  due: string;
  last_review: string | null;
  created_at: string;
}

/**
 * Chọn thẻ cho một lượt chơi. Thẻ đã đến hạn lên trước (cũ nhất trước) vì chơi đúng các thẻ này mới tính vào lịch ôn;
 * thiếu thì bù bằng thẻ đã học lâu chưa ôn nhất, cuối cùng là thẻ mới. Trả về theo thứ tự ngẫu nhiên để lượt chơi không đoán được.
 */
export function pickPracticeCards<T extends PoolCard>(cards: T[], count: number, now: Date, rng?: Rng): T[] {
  const t = now.getTime();
  const due = cards.filter((c) => c.state !== 0 && Date.parse(c.due) <= t).sort((a, b) => Date.parse(a.due) - Date.parse(b.due));
  const later = cards
    .filter((c) => c.state !== 0 && Date.parse(c.due) > t)
    .sort((a, b) => Date.parse(a.last_review ?? a.created_at) - Date.parse(b.last_review ?? b.created_at));
  const fresh = cards.filter((c) => c.state === 0).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  return shuffle([...due, ...later, ...fresh].slice(0, count), rng);
}
