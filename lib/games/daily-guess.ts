import { parseSyllable, type Syl } from "./pinyin-parts";

export const DAILY_TRIES = 6;

/**
 * Đọc lượt đoán: hai âm tiết cách nhau khoảng trắng ("peng you" hoặc "peng2 you3"), số thanh 1–5 có thể bỏ (thanh = 0, chưa biết) để dò phụ âm và vần trước; viết liền thì bắt buộc có số thanh ("peng2you3").
 * Trả null nếu sai dạng; `norm` là dạng chuẩn để so trùng và lưu.
 */
export function parseGuess(text: string): { syls: Syl[]; norm: string } | null {
  const spaced = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const compact = spaced.join("");
  const tokens = spaced.length === 2 ? spaced : compact.match(/[a-zü:]+[1-5]/g);
  if (!tokens || tokens.length !== 2 || (spaced.length !== 2 && tokens.join("") !== compact)) return null;
  const syls = tokens.map((t) => parseSyllable(t, 0));
  return syls.every((s): s is Syl => s !== null) ? { syls, norm: tokens.join(" ") } : null;
}

/** Điểm XP của một ván thắng: càng ít lượt càng cao (tối đa 150, đúng trần của máy chủ). */
export const dailyPoints = (tries: number): number => Math.min(150, Math.max(30, 160 - 25 * (tries - 1)));
