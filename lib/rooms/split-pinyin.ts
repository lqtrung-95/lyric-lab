const strip = (s: string) => s.toLowerCase().replace(/[\s'’]/g, "");

/**
 * Tách dòng pinyin thành phần trước và sau cách đọc của từ ở ô trống. Pinyin dòng ghép theo từng từ ("jiùsuàn lù zài yuǎn …")
 * còn cách đọc của từ có thể có hoặc không có dấu cách, nên so khớp trên chuỗi âm tiết đã bỏ dấu cách. Null khi không tìm thấy
 * (cách đọc khác nhau do biến điệu hoặc chữ nhiều âm); nơi gọi khi đó không hiện pinyin dòng thay vì hiện sai.
 */
export function splitPinyinAroundTerm(linePinyin: string, termReading: string | null | undefined): { before: string; after: string } | null {
  const target = strip(termReading ?? "");
  if (!target) return null;
  const tokens = linePinyin.split(/\s+/).filter(Boolean);
  for (let start = 0; start < tokens.length; start++) {
    let joined = "";
    for (let end = start; end < tokens.length; end++) {
      joined += strip(tokens[end]);
      if (joined === target) return { before: tokens.slice(0, start).join(" "), after: tokens.slice(end + 1).join(" ") };
      if (joined.length >= target.length) break;
    }
  }
  return null;
}
