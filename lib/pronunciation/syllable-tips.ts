import { FINAL_GROUPS, INITIAL_GROUPS } from "./pinyin-chart-data";
import { splitSyllable } from "./pinyin-tone-marks";

const soundTips = new Map<string, string>();
for (const group of [...INITIAL_GROUPS, ...FINAL_GROUPS]) for (const s of group.sounds) soundTips.set(s.symbol, s.tip);

/**
 * Mẹo sửa cho một âm tiết đọc yếu, lấy từ bảng pinyin của ta (không do AI viết nên không bịa). Ưu tiên phụ âm đầu vì đó là chỗ người Việt hay sai nhất
 * (bật hơi, uốn lưỡi); không có thì thử vần; không có gì thì trả null. Azure không cho biết sai ở phụ âm hay vần hay thanh nên mẹo là gợi ý, không phải chẩn đoán.
 */
export function tipForSyllable(base: string): { symbol: string; tip: string } | null {
  if (!base) return null;
  const { initial, final } = splitSyllable(base);
  for (const symbol of [initial, final]) {
    const tip = symbol && soundTips.get(symbol);
    if (tip) return { symbol, tip };
  }
  return null;
}
