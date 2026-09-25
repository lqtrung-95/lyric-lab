import type { SavedItem } from "@/lib/user-state/learner-state";

export interface SavedFilter {
  query: string;
  /** "all" hoặc cấp 1–7. */
  level: "all" | number;
  kind: "all" | "vocab" | "grammar";
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Lọc danh sách từ đã lưu theo từ khóa (chữ Hán, pinyin, Hán Việt, nghĩa; không phân biệt dấu), cấp HSK và loại. Mới lưu trước. */
export function filterSavedItems(items: SavedItem[], f: SavedFilter): SavedItem[] {
  const q = norm(f.query.trim());
  return items
    .filter((i) => f.kind === "all" || i.type === f.kind)
    .filter((i) => f.level === "all" || i.level === f.level)
    .filter((i) => !q || [i.term, i.reading, i.sinoViet, i.meaning].some((field) => field && norm(field).includes(q)))
    .sort((a, b) => b.savedAt - a.savedAt);
}
