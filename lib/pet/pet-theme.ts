// Đồ "theo bài học": khi pet thu nhỏ hiện ở một chặng, nó tạm mặc đồ hợp chủ đề của chặng (đầu bếp cho ẩm thực, nón du lịch cho đi lại…). Miễn phí, chỉ hiện ở lúc học
// và không đổi đồ bạn đã mua; không lưu đâu cả.

import { SHOP_ITEMS } from "./pet-shop";

export type ThemeOutfitId = "chefhat" | "sunhat" | "stethoscope" | "necktie" | "gradcap";

const RULES: { id: ThemeOutfitId; re: RegExp; slot: "head" | "neck" }[] = [
  { id: "stethoscope", re: /sức khỏe|bệnh|bác sĩ|thuốc|cơ thể|y tế|nha khoa|khám|sốt|đau/i, slot: "neck" },
  { id: "chefhat", re: /ẩm thực|đồ ăn|món ăn|nhà hàng|quán|bếp|nấu|trà|cà phê|ăn |uống|thực phẩm|bữa/i, slot: "head" },
  { id: "sunhat", re: /du lịch|đi lại|giao thông|sân bay|nhà ga|tàu|xe |khách sạn|bãi biển|chuyến|hành lý|vé /i, slot: "head" },
  { id: "necktie", re: /công việc|văn phòng|công ty|đồng nghiệp|ngân hàng|làm việc|họp|nghề nghiệp|kinh doanh/i, slot: "neck" },
  { id: "gradcap", re: /trường|học tập|lớp|thư viện|giáo dục|sách|thi |bài tập|giáo viên/i, slot: "head" },
];

/** Các chỗ mà đồ theo bài học sẽ thay (kể cả phụ kiện mở theo chuỗi ngày). */
export const HEAD_IDS: ReadonlySet<string> = new Set(["hat", "crown", ...SHOP_ITEMS.filter((i) => i.slot === "head").map((i) => i.id)]);
export const NECK_IDS: ReadonlySet<string> = new Set(["scarf", ...SHOP_ITEMS.filter((i) => i.slot === "neck").map((i) => i.id)]);

export const THEME_OUTFIT_IDS: readonly ThemeOutfitId[] = RULES.map((r) => r.id);

/** Đồ hợp chủ đề từ tiêu đề/chủ đề của chặng; không khớp thì null. Khớp theo thứ tự ưu tiên của `RULES`. */
export function themeOutfit(...texts: (string | null | undefined)[]): ThemeOutfitId | null {
  const text = texts.filter(Boolean).join(" ");
  return RULES.find((r) => r.re.test(text))?.id ?? null;
}

/** Thêm đồ theo bài học vào danh sách phụ kiện: thay món đang đeo ở cùng chỗ (mũ thay mũ/vương miện/món đầu của cửa hàng; đồ cổ thay khăn/nơ…). */
export function withTheme(ids: readonly string[], theme: ThemeOutfitId | null, headIds: ReadonlySet<string>, neckIds: ReadonlySet<string>): string[] {
  if (!theme) return [...ids];
  const slot = RULES.find((r) => r.id === theme)!.slot;
  const drop = slot === "head" ? headIds : neckIds;
  return [...ids.filter((id) => !drop.has(id)), theme];
}

/** Phụ kiện hiển thị khi học một bài có chủ đề: đồ theo bài học thay món cùng chỗ. */
export const applyTheme = (ids: readonly string[], theme: ThemeOutfitId | null): string[] => withTheme(ids, theme, HEAD_IDS, NECK_IDS);
