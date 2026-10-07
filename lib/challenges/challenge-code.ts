import { randomInt } from "node:crypto";

// Bỏ các ký tự dễ nhầm (0/O, 1/I/L) vì mã có thể được đọc hoặc gõ lại.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CHALLENGE_CODE_LENGTH = 8;

export function generateChallengeCode(): string {
  return Array.from({ length: CHALLENGE_CODE_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

/** Chuẩn hóa mã người dùng nhập hoặc lấy từ đường dẫn; null nếu sai định dạng. */
export function normalizeChallengeCode(input: string): string | null {
  const code = input.trim().toUpperCase();
  return code.length === CHALLENGE_CODE_LENGTH && [...code].every((c) => ALPHABET.includes(c)) ? code : null;
}
