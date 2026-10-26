import { HSK1_THEMES } from "@/lib/courses/hsk1-themes";
import themed from "@/lib/courses/hsk-themed-words.json";
import { HSK_THEME_TAXONOMY } from "@/lib/courses/hsk-theme-taxonomy";

export interface ThemeNeighbors { themeTitle: string; level: number; words: string[] }

const THEMED = themed as Record<string, Record<string, string[]>>;
const titleOf = (id: string) => HSK_THEME_TAXONOMY.find((t) => t.id === id)?.title ?? id;

/**
 * Từ cùng chủ đề (và cùng cấp HSK) với `term`, theo bảng chủ đề đã duyệt của lộ trình HSK (HSK 1 soạn tay, 2–6 AI phân loại rồi duyệt). Null nếu từ không có trong bảng nào.
 * Từ ghép nhiều chữ lên trước vì chúng giàu nghĩa hơn trợ từ/đại từ lẻ; không trả chính `term`.
 */
export function themeNeighbors(term: string, limit = 8): ThemeNeighbors | null {
  const found = (() => {
    const t1 = HSK1_THEMES.find((t) => t.words.includes(term));
    if (t1) return { themeTitle: t1.title, level: 1, words: t1.words };
    for (const [level, themes] of Object.entries(THEMED)) {
      for (const [id, words] of Object.entries(themes)) if (words.includes(term)) return { themeTitle: titleOf(id), level: Number(level), words };
    }
    return null;
  })();
  if (!found) return null;
  const words = found.words.filter((w) => w !== term).sort((a, b) => [...b].length - [...a].length).slice(0, limit);
  return words.length ? { ...found, words } : null;
}
