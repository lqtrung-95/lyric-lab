import { parseSyllable, type Syl } from "./pinyin-parts";

export const DAILY_TRIES = 6;

/** Đọc lượt đoán "peng2 you3" (hoặc "peng2you3"): đúng hai âm tiết, mỗi âm tiết có số thanh 1–5. Trả null nếu sai dạng; `norm` là dạng chuẩn để so trùng và lưu. */
export function parseGuess(text: string): { syls: Syl[]; norm: string } | null {
  const compact = text.toLowerCase().replace(/\s+/g, "");
  const tokens = compact.match(/[a-zü:]+[1-5]/g);
  if (!tokens || tokens.length !== 2 || tokens.join("") !== compact) return null;
  const syls = tokens.map((t) => parseSyllable(t, null));
  return syls.every((s): s is Syl => s !== null) ? { syls, norm: tokens.join(" ") } : null;
}

/** Điểm XP của một ván thắng: càng ít lượt càng cao (tối đa 150, đúng trần của máy chủ). */
export const dailyPoints = (tries: number): number => Math.min(150, Math.max(30, 160 - 25 * (tries - 1)));
