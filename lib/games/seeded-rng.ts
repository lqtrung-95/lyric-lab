/** Băm chuỗi thành số 32 bit không âm, ổn định giữa các máy (FNV-1a). */
export function hashString(seed: string): number {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** Bộ sinh số giả ngẫu nhiên theo hạt giống (mulberry32): cùng hạt giống thì cùng dãy, để bạn bè chơi đúng cùng bộ câu. Trả số trong [0, 1). */
export function seededRng(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
/** Hạt giống ngắn dễ đưa vào link (6 ký tự, bỏ ký tự dễ nhầm). */
export const newSeed = (rng: () => number = Math.random): string => Array.from({ length: 6 }, () => ALPHABET[Math.floor(rng() * ALPHABET.length)]).join("");
