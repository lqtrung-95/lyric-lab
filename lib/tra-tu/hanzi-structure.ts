import type { EtymologyType } from "./parse-hanzi-dictionary";

/** Cách sắp xếp các thành phần theo ký tự mô tả cấu tạo (Unicode IDS), diễn giải bằng tiếng Việt. */
export const LAYOUT_LABEL: Record<string, string> = {
  "⿰": "trái – phải", "⿱": "trên – dưới", "⿲": "trái – giữa – phải", "⿳": "trên – giữa – dưới", "⿴": "bao kín xung quanh",
  "⿵": "bao từ trên", "⿶": "bao từ dưới", "⿷": "bao từ trái", "⿸": "bao từ trên-trái", "⿹": "bao từ trên-phải", "⿺": "bao từ dưới-trái", "⿻": "chồng lên nhau",
};

/** Tên "lục thư" (cách cấu tạo chữ) tiếng Việt cho kiểu nguồn gốc của Make Me a Hanzi. */
export const ETYMOLOGY_LABEL: Record<EtymologyType, { name: string; meaning: string }> = {
  ideographic: { name: "Hội ý", meaning: "ghép các thành phần để gợi ra ý nghĩa" },
  pictographic: { name: "Tượng hình", meaning: "vẽ lại hình dạng của sự vật" },
  pictophonetic: { name: "Hình thanh", meaning: "một phần chỉ nghĩa, một phần chỉ âm đọc" },
};

export interface HanziStructure { layout: string | null; layoutLabel: string | null; components: string[] }

/** Tách IDS thành kiểu sắp xếp ở cấp ngoài cùng và danh sách thành phần theo thứ tự (làm phẳng cấp lồng, bỏ ký tự "？" không nhận ra). */
export function parseDecomposition(ids: string | null): HanziStructure {
  if (!ids) return { layout: null, layoutLabel: null, components: [] };
  const chars = [...ids];
  const layout = LAYOUT_LABEL[chars[0]] ? chars[0] : null;
  return { layout, layoutLabel: layout ? LAYOUT_LABEL[layout] : null, components: chars.filter((c) => !LAYOUT_LABEL[c] && c !== "？") };
}
