import { normalizeNickname, validateNickname } from "@/lib/leaderboard/nickname";

/** Tên hiển thị trong phòng: dùng chung quy tắc ký tự với biệt danh bảng xếp hạng (3–20 ký tự), nhưng không cần duy nhất. Null nếu không hợp lệ. */
export function parseDisplayName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = normalizeNickname(input);
  return validateNickname(name) === null ? name : null;
}
