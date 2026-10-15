import { TONE_PRACTICE, type ToneId } from "./tone-data";

export interface ToneQuestion { han: string; pinyin: string; answer: ToneId }
const TONE_IDS: ToneId[] = [1, 2, 3, 4];

const shuffled = <T,>(items: T[], random: () => number): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Chọn `count` câu cho trò nghe đoán thanh: không lặp chữ, thanh được xen kẽ đều (mỗi vòng đủ 4 thanh theo thứ tự ngẫu nhiên). Tối đa bằng số chữ có sẵn. `random` truyền vào để test cố định được. */
export function buildToneQuiz(count = 8, random: () => number = Math.random): ToneQuestion[] {
  const pools = new Map(TONE_IDS.map((t) => [t, shuffled(TONE_PRACTICE[t], random)]));
  const out: ToneQuestion[] = [];
  while (out.length < count) {
    const before = out.length;
    for (const tone of shuffled(TONE_IDS, random)) {
      const item = pools.get(tone)!.pop();
      if (item && out.length < count) out.push({ ...item, answer: tone });
    }
    if (out.length === before) break;
  }
  return out;
}
