import { COOP_ITEMS } from "./coop-items";
import { allComposedMessages } from "./coop-messages";
import { COOP_PLACES } from "./coop-places";
import { COOP_PHRASES } from "./coop-state";

/** Mọi chuỗi tiếng Trung của chế độ phá án cùng bạn cần pinyin: câu ghép từ mẫu, câu nói nhanh, tên nơi chốn và đồ vật (dùng cho nhãn ô chọn). */
export function coopPinyinKeys(): string[] {
  return [...new Set([...allComposedMessages().map((m) => m.zh), ...COOP_PHRASES.map((p) => p.zh), ...Object.values(COOP_PLACES).map((p) => p.zh), ...COOP_ITEMS.map((i) => i.zh)])];
}
