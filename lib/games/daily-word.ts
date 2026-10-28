import { hashString, seededRng } from "@/lib/practice/seeded-rng";
import type { GameWord } from "./game-word";

const ZONE = "Asia/Ho_Chi_Minh";
const EPOCH = Date.UTC(2026, 9, 1); // ngày #1 của Hán tự mỗi ngày: 01/10/2026

/** Khóa ngày "YYYY-MM-DD" theo giờ Việt Nam: mọi người cùng thấy một từ trong cùng một ngày. */
export const dayKey = (now: Date): string => now.toLocaleDateString("sv-SE", { timeZone: ZONE });

/** Số thứ tự ngày (1 = 01/10/2026). */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - EPOCH) / 86_400_000) + 1;
}

/** Từ của ngày: chọn theo hạt giống là khóa ngày nên ổn định giữa các máy chủ miễn kho từ không đổi. */
export function pickDaily(words: readonly GameWord[], key: string): GameWord | null {
  return words.length === 0 ? null : words[Math.floor(seededRng(hashString(`daily:${key}`))() * words.length)];
}
