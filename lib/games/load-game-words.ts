import "server-only";
import themed from "@/lib/courses/hsk-themed-words.json";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import type { GameWord } from "./game-word";

const TWO_HAN = /^\p{Script=Han}{2}$/u;
const MAX_LEVEL = 4;

/** Từ hai chữ HSK 2–4 (bỏ nhóm ngữ pháp), sắp theo chữ để thứ tự ổn định giữa các máy chủ: "từ trong ngày" của mọi người phải trùng nhau. */
function candidates(): string[] {
  const set = new Set<string>();
  for (const [level, themes] of Object.entries(themed as Record<string, Record<string, string[]>>)) {
    if (Number(level) > MAX_LEVEL) continue;
    for (const [theme, words] of Object.entries(themes)) if (theme !== "grammar") for (const w of words) if (TWO_HAN.test(w)) set.add(w);
  }
  return [...set].sort();
}

let cache: Promise<GameWord[]> | null = null;

async function build(): Promise<GameWord[]> {
  const words = candidates();
  const pinyin = await annotatePinyin(words);
  return words.flatMap((han) => {
    const p = pinyin[han]?.trim();
    return p && p.split(/\s+/).length === 2 ? [{ han, pinyin: p }] : [];
  });
}

/**
 * Kho từ chung cho các game không phụ thuộc thẻ đã lưu (Hán tự mỗi ngày, Đấu 1–1, và dự phòng khi người chơi có ít thẻ): từ hai âm tiết, pinyin lấy từ từ điển (quy tắc 2).
 * Nhớ trong bộ nhớ máy chủ; kết quả rỗng (tra từ điển lỗi) không được nhớ để lần sau thử lại.
 */
export async function loadGameWords(): Promise<GameWord[]> {
  cache ??= build().then((w) => { if (w.length === 0) cache = null; return w; }, (e) => { cache = null; throw e; });
  return cache;
}
