// Cửa hàng của linh vật: đổi "xu" lấy phụ kiện để diện cho pet. Xu KHÔNG phải XP: XP vẫn là tổng kiếm được và quyết định cấp, giai đoạn của pet, không bao giờ bị trừ.
// Xu kiếm được = 1 xu mỗi 10 XP đã có; số dư = xu kiếm được trừ xu đã tiêu. Vì số dư tính lại từ XP thật nên sửa dữ liệu cục bộ chỉ đổi được phần "đã tiêu" của chính mình
// (phụ kiện chỉ để ngắm, không ảnh hưởng điểm nên không cần chống gian lận ở máy chủ). Trạng thái chỉ lưu trên thiết bị này.

export type ShopSlot = "head" | "face" | "neck" | "back";

export interface ShopItem { id: string; label: string; slot: ShopSlot; price: number }

export const SHOP_SLOTS: { id: ShopSlot; label: string }[] = [
  { id: "head", label: "Đầu" },
  { id: "face", label: "Mắt" },
  { id: "neck", label: "Cổ" },
  { id: "back", label: "Lưng" },
];

export const SHOP_ITEMS: readonly ShopItem[] = [
  { id: "cap", label: "Mũ lưỡi trai", slot: "head", price: 20 },
  { id: "partyhat", label: "Nón sinh nhật", slot: "head", price: 15 },
  { id: "flower", label: "Hoa cài tai", slot: "head", price: 12 },
  { id: "headphones", label: "Tai nghe", slot: "head", price: 30 },
  { id: "halo", label: "Vòng hào quang", slot: "head", price: 40 },
  { id: "beret", label: "Mũ nồi họa sĩ", slot: "head", price: 25 },
  { id: "glasses", label: "Kính tròn", slot: "face", price: 15 },
  { id: "sunglasses", label: "Kính râm", slot: "face", price: 25 },
  { id: "heartglasses", label: "Kính trái tim", slot: "face", price: 30 },
  { id: "bowtie", label: "Nơ cổ", slot: "neck", price: 12 },
  { id: "bell", label: "Vòng chuông", slot: "neck", price: 10 },
  { id: "bandana", label: "Khăn bandana", slot: "neck", price: 18 },
  { id: "cape", label: "Áo choàng", slot: "back", price: 40 },
  { id: "wings", label: "Đôi cánh", slot: "back", price: 60 },
];

export const SHOP_IDS: ReadonlySet<string> = new Set(SHOP_ITEMS.map((i) => i.id));
export const shopItem = (id: string): ShopItem | undefined => SHOP_ITEMS.find((i) => i.id === id);

export interface PetShopState {
  owned: string[];
  /** Món đang đeo, mỗi chỗ một món. */
  equipped: Partial<Record<ShopSlot, string>>;
  /** Tổng xu đã tiêu. */
  spent: number;
}

export const EMPTY_SHOP: PetShopState = { owned: [], equipped: {}, spent: 0 };

/** Đọc trạng thái lưu: bỏ món không có trong danh mục, món đeo mà chưa sở hữu hoặc sai chỗ; dữ liệu sai dạng thì rỗng. */
export function parseShop(raw: unknown): PetShopState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return EMPTY_SHOP;
  const r = raw as Record<string, unknown>;
  const owned = Array.isArray(r.owned) ? [...new Set(r.owned.filter((x): x is string => typeof x === "string" && SHOP_IDS.has(x)))] : [];
  const equipped: PetShopState["equipped"] = {};
  if (r.equipped && typeof r.equipped === "object" && !Array.isArray(r.equipped)) {
    for (const slot of SHOP_SLOTS) {
      const id = (r.equipped as Record<string, unknown>)[slot.id];
      const item = typeof id === "string" ? shopItem(id) : undefined;
      if (item && item.slot === slot.id && owned.includes(item.id)) equipped[slot.id] = item.id;
    }
  }
  const spent = typeof r.spent === "number" && Number.isFinite(r.spent) && r.spent >= 0 ? Math.floor(r.spent) : 0;
  return { owned, equipped, spent };
}

/** Xu kiếm được: 1 xu mỗi 10 XP. */
export const xuEarned = (totalXp: number): number => Math.max(0, Math.floor(totalXp / 10));
export const xuBalance = (totalXp: number, state: PetShopState): number => Math.max(0, xuEarned(totalXp) - state.spent);

/** Mua một món: null nếu đã sở hữu, không có trong danh mục hoặc không đủ xu. Mua xong đeo luôn. */
export function buyItem(state: PetShopState, id: string, totalXp: number): PetShopState | null {
  const item = shopItem(id);
  if (!item || state.owned.includes(id) || xuBalance(totalXp, state) < item.price) return null;
  return { owned: [...state.owned, id], equipped: { ...state.equipped, [item.slot]: id }, spent: state.spent + item.price };
}

/** Đeo món đã sở hữu (thay món cùng chỗ); đang đeo thì cởi ra. Chưa sở hữu thì giữ nguyên. */
export function toggleEquip(state: PetShopState, id: string): PetShopState {
  const item = shopItem(id);
  if (!item || !state.owned.includes(id)) return state;
  const equipped = { ...state.equipped };
  if (equipped[item.slot] === id) delete equipped[item.slot];
  else equipped[item.slot] = id;
  return { ...state, equipped };
}

/**
 * Danh sách phụ kiện hiển thị: phụ kiện mở theo chuỗi ngày cộng món cửa hàng đang đeo. Món cửa hàng ở chỗ đầu thay mũ/vương miện, ở chỗ cổ thay khăn quàng (không chồng hai thứ lên nhau).
 */
export function outfitIds(streakIds: readonly string[], state: PetShopState): string[] {
  const out = streakIds.filter((id) => !(state.equipped.head && (id === "hat" || id === "crown")) && !(state.equipped.neck && id === "scarf"));
  return [...out, ...Object.values(state.equipped).filter((id): id is string => typeof id === "string")];
}
