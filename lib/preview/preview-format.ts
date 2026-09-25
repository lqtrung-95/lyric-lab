import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";

/** 65 → "1:05". */
export function formatTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Nhãn cấp: HSK 3.0 có 1–6 và nhóm 7–9 gộp (lưu là 7); từ ngoài danh sách HSK là null. */
export function levelLabel(level: number | null): string {
  if (level === null) return "Ngoài HSK";
  return level >= 7 ? "HSK 7–9" : `HSK ${level}`;
}

/** Khoảng cấp của các mục, ví dụ "HSK 3–5"; rỗng nếu không mục nào có cấp. */
export function levelRangeLabel(items: Pick<PreviewItem, "level">[]): string {
  const levels = items.map((i) => i.level).filter((l): l is number => l !== null);
  if (levels.length === 0) return "";
  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  return lo === hi ? levelLabel(lo) : `HSK ${lo}–${hi >= 7 ? "7–9" : hi}`;
}

export function lineForItem(item: Pick<PreviewItem, "occurrences">, lines: AnalyzedLine[]): AnalyzedLine | null {
  const index = item.occurrences[0]?.lineIndex;
  return lines.find((l) => l.index === index) ?? null;
}

/** Dạng chữ Hán đúng như trong lời (có thể là phồn thể); mục ngữ pháp và từ không tìm thấy dùng nguyên `term`. */
export function displayTermForm(item: Pick<PreviewItem, "id" | "type" | "term">, lines: AnalyzedLine[]): string {
  if (item.type !== "vocab") return item.term;
  for (const line of lines) {
    const token = line.tokens.find((t) => t.itemId === item.id);
    if (token) return token.text;
  }
  return item.term;
}

/** Đoạn phát thử: từ đầu câu (lùi 0,3 giây) tới hết câu (thêm 0,3 giây), tối đa 8 giây (PV-07). */
export function snippetRange(line: Pick<AnalyzedLine, "start" | "end">): { start: number; end: number } {
  const start = Math.max(0, line.start - 0.3);
  return { start, end: Math.min(line.end + 0.3, start + 8) };
}
