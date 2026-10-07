import type { SongAnalysis } from "./analysis-types";

export interface LineEdit {
  /** `AnalyzedLine.index` của dòng cần sửa. */
  lineIndex: number;
  text: string;
  /** Token mới của dòng (đã tách từ): `text` để hiển thị, `simplified` để so khớp với từ vựng. */
  tokens: { text: string; simplified: string }[];
  pinyin: string;
  /** Bản dịch mới; undefined = giữ nguyên bản dịch cũ. */
  translation?: string;
}

/**
 * Áp một lần sửa lời (chữ Hán, pinyin, bản dịch) của MỘT dòng vào bản phân tích, giữ nguyên mốc thời gian. Các mục từ vựng/ngữ pháp liên kết
 * với dòng được tính lại: lần xuất hiện cũ ở dòng này bị bỏ; từ vựng nào có token khớp trong dòng mới thì được thêm lại; ngữ pháp không tính lại được
 * vị trí ký tự nên chỉ bị bỏ lần xuất hiện ở dòng này. Mục không còn lần xuất hiện nào thì bị xóa (thẻ người dùng đã lưu không phụ thuộc mục này).
 * Trả null nếu không có dòng đó. Không sửa đối tượng đầu vào.
 */
export function applyLineEdit(analysis: SongAnalysis, edit: LineEdit): SongAnalysis | null {
  const line = analysis.lines.find((l) => l.index === edit.lineIndex);
  if (!line) return null;

  const vocabIdByTerm = new Map(analysis.items.filter((i) => i.type === "vocab").map((i) => [i.term, i.id]));
  const newTokens = edit.tokens.map((t) => ({ text: t.text, itemId: vocabIdByTerm.get(t.simplified) }));
  const newTerms = new Set(edit.tokens.map((t) => t.simplified));

  const items = analysis.items
    .map((item) => {
      const others = item.occurrences.filter((o) => o.lineIndex !== edit.lineIndex);
      if (item.type === "vocab" && newTerms.has(item.term)) {
        const added = [...others, { lineIndex: edit.lineIndex, start: line.start }].sort((a, b) => a.lineIndex - b.lineIndex);
        return { ...item, occurrences: added };
      }
      return { ...item, occurrences: others };
    })
    .filter((item) => item.occurrences.length > 0);

  return {
    ...analysis,
    lines: analysis.lines.map((l) =>
      l.index === edit.lineIndex
        ? { ...l, text: edit.text, pinyin: edit.pinyin, tokens: newTokens, translation: edit.translation === undefined ? l.translation : edit.translation }
        : l,
    ),
    items,
  };
}
