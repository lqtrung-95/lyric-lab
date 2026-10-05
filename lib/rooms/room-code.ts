import { randomInt } from "node:crypto";

/** Mã phòng 6 chữ số từ 100000 đến 999999 (không bắt đầu bằng 0 để dán/đọc không bị mất số 0). */
export const generateRoomCode = (random: (min: number, max: number) => number = randomInt): string => String(random(100000, 1000000));

/**
 * Chuẩn hóa mã người dùng nhập hoặc dán: bỏ dấu cách/gạch ngang ("842 915"), hoặc rút mã từ link mời (".../room/842915").
 * Trả null nếu không phải mã hợp lệ.
 */
export function normalizeRoomCode(input: string): string | null {
  const text = input.trim();
  const fromLink = /\/room\/(\d{6})(?:[/?#]|$)/.exec(text);
  const digits = fromLink ? fromLink[1] : text.replace(/[\s-]/g, "");
  return /^[1-9]\d{5}$/.test(digits) ? digits : null;
}

/** Link mời vào phòng. */
export const buildRoomLink = (origin: string, code: string): string => `${origin.replace(/\/$/, "")}/room/${code}`;
