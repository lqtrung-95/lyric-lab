/**
 * Ngắt chữ thành các dòng vừa chiều rộng `maxWidth`. `measure` đo độ rộng của một đoạn chữ (canvas `measureText`). `unit` là cách tách:
 * "char" cho chữ Hán (không có dấu cách), "word" cho pinyin và tiếng Việt. Một từ dài hơn cả dòng vẫn được giữ trên một dòng riêng.
 */
export function wrapText(text: string, measure: (s: string) => number, maxWidth: number, unit: "char" | "word"): string[] {
  const parts = unit === "char" ? [...text] : text.split(/\s+/).filter(Boolean);
  const join = unit === "char" ? "" : " ";
  const lines: string[] = [];
  let current = "";
  for (const part of parts) {
    const next = current ? `${current}${join}${part}` : part;
    if (current && measure(next) > maxWidth) { lines.push(current); current = part; }
    else current = next;
  }
  if (current) lines.push(current);
  return lines;
}
