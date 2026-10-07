import { containsBlockedWord } from "./blocked-words";

export const NICKNAME_MIN = 3;
export const NICKNAME_MAX = 20;

export type NicknameError = "too_short" | "too_long" | "invalid_chars" | "only_digits" | "inappropriate";

// Chữ (mọi ngôn ngữ, gồm tiếng Việt có dấu), số, dấu cách, chấm, gạch dưới và gạch ngang. Không dùng email hay ký tự đặc biệt.
const ALLOWED = /^[\p{L}\p{N} ._-]+$/u;

/** Chuẩn hóa biệt danh: gọn khoảng trắng hai đầu và giữa (không có nhiều dấu cách liền nhau). */
export const normalizeNickname = (input: string) => input.normalize("NFC").replace(/\s+/g, " ").trim();

/** Kiểm tra biệt danh; trả lỗi đầu tiên hoặc null nếu hợp lệ. Tên trùng người khác do cơ sở dữ liệu kiểm tra (duy nhất, không phân biệt hoa thường). */
export function validateNickname(nickname: string): NicknameError | null {
  const n = normalizeNickname(nickname);
  const length = [...n].length;
  if (length < NICKNAME_MIN) return "too_short";
  if (length > NICKNAME_MAX) return "too_long";
  if (!ALLOWED.test(n)) return "invalid_chars";
  if (/^\d+$/.test(n)) return "only_digits"; // tên toàn số dễ nhầm với thứ hạng
  if (containsBlockedWord(n)) return "inappropriate";
  return null;
}

export const NICKNAME_MESSAGES: Record<NicknameError | "taken", string> = {
  too_short: `Biệt danh cần ít nhất ${NICKNAME_MIN} ký tự.`,
  too_long: `Biệt danh tối đa ${NICKNAME_MAX} ký tự.`,
  invalid_chars: "Chỉ dùng chữ, số, dấu cách, chấm, gạch dưới và gạch ngang.",
  only_digits: "Biệt danh không nên chỉ gồm số.",
  inappropriate: "Biệt danh này chưa phù hợp. Hãy chọn tên khác.",
  taken: "Biệt danh này đã có người dùng. Hãy chọn tên khác.",
};
