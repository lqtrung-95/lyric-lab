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

/**
 * Như `wrapText` nhưng giữ nguyên số dòng và thu hẹp bề ngang để các dòng dài gần bằng nhau (không còn dòng cuối chỉ có một, hai chữ
 * lẻ loi). Tìm bề ngang nhỏ nhất vẫn cho đúng số dòng mà ngắt chữ tham lam ra.
 */
export function balancedWrapText(text: string, measure: (s: string) => number, maxWidth: number, unit: "char" | "word"): string[] {
  const greedy = wrapText(text, measure, maxWidth, unit);
  if (greedy.length < 2) return greedy;
  let lo = maxWidth / greedy.length;
  let hi = maxWidth;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (wrapText(text, measure, mid, unit).length <= greedy.length) hi = mid;
    else lo = mid;
  }
  return wrapText(text, measure, hi, unit);
}
