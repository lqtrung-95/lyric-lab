// Đọc Unihan_Readings.txt (Unicode License): dòng `U+6674<TAB>kVietnamese<TAB>tạnh`. Một chữ có thể có nhiều âm.
export function parseUnihanVietnamese(text: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const line of text.split("\n")) {
    const m = line.match(/^U\+([0-9A-F]+)\tkVietnamese\t(.+)$/);
    if (!m) continue;
    const readings = m[2].trim().split(/\s+/).filter(Boolean);
    if (readings.length) map.set(String.fromCodePoint(parseInt(m[1], 16)), readings);
  }
  return map;
}
