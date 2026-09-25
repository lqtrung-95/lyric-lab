/**
 * Âm Hán Việt của một từ = ghép âm đầu tiên của từng chữ ("城市" → "thành thị").
 * **Truyền dạng phồn thể của từ** (`DictWordRow.traditional`): Unihan gán âm cho chữ phồn thể, chữ giản thể
 * thường thiếu hoặc ra âm Nôm (忆 → "hắt", trong khi 憶 → "ức").
 * Chỉ trả về khi mọi chữ Hán đều có trong bảng; thiếu chữ nào thì trả null (không đoán).
 * Chữ có nhiều âm lấy âm đầu tiên trong Unihan; Unihan lẫn cả âm Nôm nên có ca sai (袋 → "đãy" thay vì "đại").
 */
export function sinoVietForWord(word: string, readings: ReadonlyMap<string, string[]>): string | null {
  const parts: string[] = [];
  for (const ch of word) {
    if (!/\p{Script=Han}/u.test(ch)) return null;
    const r = readings.get(ch)?.[0];
    if (!r) return null;
    parts.push(r);
  }
  return parts.length ? parts.join(" ") : null;
}
