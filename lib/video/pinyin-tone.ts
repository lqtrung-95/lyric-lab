const MARKS: Record<string, number> = { "̄": 1, "́": 2, "̌": 3, "̀": 4 };

/** Thanh điệu (1–4) của một âm tiết pinyin có dấu; 0 = thanh nhẹ hoặc không có dấu. */
export function toneOfSyllable(syllable: string): number {
  for (const ch of syllable.normalize("NFD")) if (MARKS[ch]) return MARKS[ch];
  return 0;
}

/** Màu chữ pinyin theo thanh, để nhìn ra thanh điệu ngay mà không cần đọc dấu (sáng và tối đều đủ tương phản). */
export const TONE_TEXT_CLASS: Record<number, string> = {
  0: "text-on-surface-variant",
  1: "text-sky-700 dark:text-sky-300",
  2: "text-emerald-700 dark:text-emerald-300",
  3: "text-amber-700 dark:text-amber-300",
  4: "text-rose-700 dark:text-rose-300",
};
