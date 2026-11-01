// Cửa hàng của linh vật: đổi "xu" lấy phụ kiện để diện cho pet. Xu KHÔNG phải XP: XP vẫn là tổng kiếm được và quyết định cấp, giai đoạn của pet, không bao giờ bị trừ.
// Xu kiếm được = 1 xu mỗi 10 XP đã có; số dư = xu kiếm được trừ xu đã tiêu. Vì số dư tính lại từ XP thật nên sửa dữ liệu cục bộ chỉ đổi được phần "đã tiêu" của chính mình
// (phụ kiện chỉ để ngắm, không ảnh hưởng điểm nên không cần chống gian lận ở máy chủ). Trạng thái chỉ lưu trên thiết bị này.

export type ShopSlot = "head" | "face" | "neck" | "back";

export type SeasonId = "tet" | "trungthu" | "noel";

/** `season`: món giới hạn, chỉ MUA được trong mùa (đã mua thì đeo quanh năm). */
export interface ShopItem { id: string; label: string; slot: ShopSlot; price: number; season?: SeasonId }

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
  { id: "tethat", label: "Khăn đóng Tết", slot: "head", price: 30, season: "tet" },
  { id: "tetcharm", label: "Bao lì xì", slot: "neck", price: 15, season: "tet" },
  { id: "moonears", label: "Tai thỏ ngọc", slot: "head", price: 25, season: "trungthu" },
  { id: "starlantern", label: "Đèn ông sao", slot: "back", price: 30, season: "trungthu" },
  { id: "santahat", label: "Mũ ông già Noel", slot: "head", price: 25, season: "noel" },
  { id: "noelscarf", label: "Khăn Noel", slot: "neck", price: 15, season: "noel" },
];

export const SEASON_LABELS: Record<SeasonId, string> = { tet: "Tết Nguyên Đán", trungthu: "Trung thu", noel: "Giáng sinh" };

// Mùa lễ: ngày chính của Tết và Trung thu (âm lịch) cho từng năm cần dùng; mở bán trước và sau ngày chính vài tuần. Giáng sinh cố định 15–31/12.
const TET_DATES = ["2027-02-06", "2028-01-26", "2029-02-13", "2030-02-03", "2031-01-23", "2032-02-11"];
const TRUNGTHU_DATES = ["2026-09-25", "2027-09-15", "2028-10-03", "2029-09-22", "2030-09-12", "2031-10-01", "2032-09-19"];
const SEASON_WINDOW: Record<"tet" | "trungthu", { before: number; after: number }> = { tet: { before: 21, after: 14 }, trungthu: { before: 14, after: 7 } };

const dayNum = (y: number, m: number, d: number): number => Date.UTC(y, m, d) / 86_400_000;
const localDay = (now: Date): number => dayNum(now.getFullYear(), now.getMonth(), now.getDate());
const isoDay = (iso: string): number => { const [y, m, d] = iso.split("-").map(Number); return dayNum(y, m - 1, d); };

/** Mùa này có đang mở bán không (theo ngày địa phương). */
export function seasonOpen(season: SeasonId, now: Date): boolean {
  const today = localDay(now);
  if (season === "noel") return now.getMonth() === 11 && now.getDate() >= 15;
  const w = SEASON_WINDOW[season];
  return (season === "tet" ? TET_DATES : TRUNGTHU_DATES).some((iso) => { const day = isoDay(iso); return today >= day - w.before && today <= day + w.after; });
}
export const openSeasons = (now: Date): SeasonId[] => (["tet", "trungthu", "noel"] as const).filter((s) => seasonOpen(s, now));

export const SHOP_IDS: ReadonlySet<string> = new Set(SHOP_ITEMS.map((i) => i.id));
export const shopItem = (id: string): ShopItem | undefined => SHOP_ITEMS.find((i) => i.id === id);

export interface PetShopState {
  owned: string[];
  /** Món đang đeo, mỗi chỗ một món. */
  equipped: Partial<Record<ShopSlot, string>>;
  /** Tổng xu đã tiêu. */
  spent: number;
  /** Xu thưởng ngoài XP (mục tiêu tuần, rương hằng ngày). */
  bonus: number;
  /** Ngày đã mở rương gần nhất (YYYY-MM-DD) và các tuần đã nhận xu thưởng mục tiêu tuần. */
  chestDay: string;
  weeksPaid: string[];
}

export const EMPTY_SHOP: PetShopState = { owned: [], equipped: {}, spent: 0, bonus: 0, chestDay: "", weeksPaid: [] };

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
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), 1_000_000) : 0);
  const weeksPaid = Array.isArray(r.weeksPaid) ? r.weeksPaid.filter((x): x is string => typeof x === "string").slice(-60) : [];
  return { owned, equipped, spent, bonus: num(r.bonus), chestDay: typeof r.chestDay === "string" ? r.chestDay : "", weeksPaid };
}

/** Xu kiếm được: 1 xu mỗi 10 XP. */
export const xuEarned = (totalXp: number): number => Math.max(0, Math.floor(totalXp / 10));
export const xuBalance = (totalXp: number, state: PetShopState): number => Math.max(0, xuEarned(totalXp) + state.bonus - state.spent);

/** Mua một món: null nếu đã sở hữu, không có trong danh mục, món mùa lễ ngoài mùa, hoặc không đủ xu. Mua xong đeo luôn. */
export function buyItem(state: PetShopState, id: string, totalXp: number, now: Date = new Date()): PetShopState | null {
  const item = shopItem(id);
  if (!item || state.owned.includes(id) || xuBalance(totalXp, state) < item.price) return null;
  if (item.season && !seasonOpen(item.season, now)) return null;
  return { ...state, owned: [...state.owned, id], equipped: { ...state.equipped, [item.slot]: id }, spent: state.spent + item.price };
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

export const CHEST_MIN = 2;
export const CHEST_MAX = 8;
export const WEEKLY_XU = 20;

/** Rương hằng ngày: mỗi ngày mở được một lần, nhận CHEST_MIN–CHEST_MAX xu (`roll` trong [0,1)). Đã mở hôm nay thì null. */
export function openChest(state: PetShopState, today: string, roll: number): { state: PetShopState; xu: number } | null {
  if (state.chestDay === today) return null;
  const r = Number.isFinite(roll) ? Math.min(0.999999, Math.max(0, roll)) : 0;
  const xu = CHEST_MIN + Math.floor(r * (CHEST_MAX - CHEST_MIN + 1));
  return { state: { ...state, chestDay: today, bonus: state.bonus + xu }, xu };
}

/** Thưởng xu khi nhận huy hiệu mục tiêu tuần: mỗi tuần một lần. Đã nhận thì null. */
export function claimWeeklyXu(state: PetShopState, week: string): PetShopState | null {
  if (!week || state.weeksPaid.includes(week)) return null;
  return { ...state, bonus: state.bonus + WEEKLY_XU, weeksPaid: [...state.weeksPaid, week] };
}

/** Tên hiển thị của một phụ kiện (món cửa hàng, phụ kiện theo chuỗi ngày, đồ theo bài học). */
export function accessoryLabel(id: string): string {
  const labels: Record<string, string> = { scarf: "Khăn quàng", hat: "Mũ thư sinh", crown: "Vương miện" };
  return shopItem(id)?.label ?? labels[id] ?? id;
}
