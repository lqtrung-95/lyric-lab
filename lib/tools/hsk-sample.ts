import type { HskRow } from "./build-hsk-rows";

export const MIN_SAMPLE = 5;
export const MAX_SAMPLE = 20;
export const DEFAULT_SAMPLE = 12;

/** Giới hạn số từ lấy mẫu trong khoảng cho phép; không phải số thì dùng mặc định. */
export const clampSample = (n: unknown): number => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(MAX_SAMPLE, Math.max(MIN_SAMPLE, v)) : DEFAULT_SAMPLE;
};

const MAX_MEANING = 40;
// Ghi chú thô của CC-CEDICT không phải nghĩa dùng được: biến thể, tham chiếu "see", họ, ký hiệu `|` và `[pinyin]`.
const RAW_NOTE = /[|\[\]]|^(variant of|old variant|see |see also|abbr|surname|used in|classifier|CL:)/i;

/** Nghĩa sạch và ngắn đầu tiên của một từ (null nếu không có), để in lên tờ bài tập. */
export const cleanMeaning = (r: HskRow): string | null => r.meanings.find((m) => m.length <= MAX_MEANING && !RAW_NOTE.test(m.trim())) ?? null;

/** Từ hợp để làm bài tập chép chữ: chỉ chữ Hán (không chữ Latin, số, dấu), ngắn (≤ 4 chữ), có pinyin và một nghĩa sạch. */
const usable = (r: HskRow): boolean => /^\p{Script=Han}{1,4}$/u.test(r.word) && r.pinyin.trim() !== "" && cleanMeaning(r) !== null;

/** Lấy ngẫu nhiên `count` từ khác nhau của một cấp (Fisher–Yates; không sửa mảng gốc), chỉ trong số các từ hợp. */
export function sampleHskWords(rows: readonly HskRow[], count: number, rng: () => number = Math.random): HskRow[] {
  const pool = rows.filter(usable);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** Một dòng cho ô danh sách của tờ bài tập: "chữ Hán, nghĩa tiếng Anh sạch đầu tiên" (dấu phẩy và chấm phẩy trong nghĩa đổi thành " / " để không lẫn dấu phân cách). */
export const toWorksheetLine = (r: HskRow): string => `${r.word}, ${(cleanMeaning(r) ?? r.meanings[0]).replace(/\s*[,;，；]\s*/g, " / ").replace(/\s+/g, " ").trim()}`;
