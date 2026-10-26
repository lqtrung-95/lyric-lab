export interface TextSegment { text: string; hit: boolean }

/** Tách câu thành các đoạn để tô đậm mọi lần xuất hiện của từ (kể cả dạng phồn thể); ưu tiên dạng dài khi các dạng chứa nhau. */
export function splitByTerms(text: string, terms: string[]): TextSegment[] {
  const forms = [...new Set(terms.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (forms.length === 0) return [{ text, hit: false }];
  const re = new RegExp(`(${forms.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return text.split(re).filter(Boolean).map((part) => ({ text: part, hit: forms.includes(part) }));
}
