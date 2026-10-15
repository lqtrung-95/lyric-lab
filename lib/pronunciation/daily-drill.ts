import { READ_ALOUD_SENTENCES, type ReadAloudSentence } from "./read-aloud-sentences";
import { TONGUE_TWISTERS, type TongueTwister } from "./tongue-twisters";

export interface DailyDrill { sentence: ReadAloudSentence; twister: TongueTwister; toneRounds: number }

// Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32): cùng một ngày cho cùng một bài tập trên mọi thiết bị.
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

/** Bài tập 5 phút của một ngày (`day` dạng YYYY-MM-DD): 4 câu nghe đoán thanh, 1 câu đọc to, 1 câu 绕口令. Cùng ngày cho cùng bài. */
export function buildDailyDrill(day: string): DailyDrill {
  const random = seeded(hash(day));
  return {
    sentence: READ_ALOUD_SENTENCES[Math.floor(random() * READ_ALOUD_SENTENCES.length)],
    twister: TONGUE_TWISTERS[Math.floor(random() * TONGUE_TWISTERS.length)],
    toneRounds: 4,
  };
}
