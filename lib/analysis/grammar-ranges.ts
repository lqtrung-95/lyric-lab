const HAN_RUN = /\p{Script=Han}+/gu;

/**
 * Vị trí ký tự [từ, đến) của các cụm chữ Hán trong công thức ngữ pháp, khớp theo thứ tự trong dòng (bản giản thể).
 * Bỏ qua ký hiệu A, B, V, O, dấu +. Không khớp đủ mọi cụm → mảng rỗng. Vị trí dùng chung cho bản gốc vì
 * chuyển giản thể giữ nguyên độ dài dòng.
 */
export function grammarCharRanges(pattern: string, simplifiedLine: string): [number, number][] {
  const runs = pattern.match(HAN_RUN);
  if (!runs) return [];
  const ranges: [number, number][] = [];
  let from = 0;
  for (const run of runs) {
    const at = simplifiedLine.indexOf(run, from);
    if (at < 0) return [];
    ranges.push([at, at + run.length]);
    from = at + run.length;
  }
  return ranges;
}
