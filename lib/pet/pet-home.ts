// "Nhà" của linh vật: căn phòng nhỏ có sáu chỗ đặt đồ (2 tường, 2 sàn, 2 trên kệ). Đồ mở khóa bằng những thứ người học ĐÃ làm (chuỗi ngày, cấp, giai đoạn
// của pet, số ngày bên nhau, hộ chiếu và hành trình Khám phá), chỉ để ngắm, không ảnh hưởng điểm, không mua bằng tiền. Chỉ lưu CÁCH SẮP XẾP; việc đã mở khóa
// luôn tính lại từ số liệu hiện có nên không có "mất đồ" hay gian lận bằng sửa dữ liệu cục bộ.

export type HomeItemKind = "wall" | "floor" | "small";

/** Số liệu quyết định đồ nào đã mở khóa. */
export interface HomeStats {
  streakLongest: number;
  level: number;
  /** Giai đoạn của pet (1–3). */
  stage: number;
  daysTogether: number;
  /** Số cảnh Khám phá đã ghé / đạt Thổ địa. */
  visited: number;
  goldStamps: number;
  journeys: number;
  /** Số tuần đã nhận huy hiệu mục tiêu tuần. */
  weeksDone: number;
}
export type HomeStatKey = keyof HomeStats;

export interface HomeItem {
  id: string;
  label: string;
  kind: HomeItemKind;
  /** null = có sẵn từ đầu. */
  need: { stat: HomeStatKey; at: number } | null;
  /** Cách mở khóa, đọc cho người dùng ("Chuỗi ngày 7 ngày"). */
  how: string;
}

export const HOME_ITEMS: readonly HomeItem[] = [
  { id: "window", label: "Cửa sổ trăng sao", kind: "wall", need: null, how: "Có sẵn" },
  { id: "fuposter", label: "Tranh chữ Phúc", kind: "wall", need: { stat: "journeys", at: 1 }, how: "Hoàn thành 1 hành trình ở Khám phá" },
  { id: "shelf", label: "Kệ sách", kind: "wall", need: { stat: "stage", at: 2 }, how: "Pet lên giai đoạn thiếu niên" },
  { id: "medalframe", label: "Khung huy chương", kind: "wall", need: { stat: "goldStamps", at: 1 }, how: "Đạt 1 dấu Thổ địa ở hộ chiếu" },
  { id: "lanternwall", label: "Đèn lồng treo", kind: "wall", need: { stat: "streakLongest", at: 30 }, how: "Chuỗi ngày dài nhất đạt 30 ngày" },
  { id: "scroll", label: "Tranh thư pháp", kind: "wall", need: { stat: "weeksDone", at: 1 }, how: "Nhận 1 huy hiệu mục tiêu tuần" },
  { id: "bed", label: "Ổ ngủ", kind: "floor", need: null, how: "Có sẵn" },
  { id: "rug", label: "Thảm tròn", kind: "floor", need: { stat: "streakLongest", at: 3 }, how: "Chuỗi ngày dài nhất đạt 3 ngày" },
  { id: "plant", label: "Chậu cây", kind: "floor", need: { stat: "level", at: 3 }, how: "Đạt cấp 3" },
  { id: "toybox", label: "Hộp đồ chơi", kind: "floor", need: { stat: "daysTogether", at: 7 }, how: "Bên nhau 7 ngày" },
  { id: "kumquat", label: "Cây quất nhỏ", kind: "floor", need: { stat: "journeys", at: 2 }, how: "Hoàn thành 2 hành trình ở Khám phá" },
  { id: "telescope", label: "Kính thiên văn", kind: "floor", need: { stat: "visited", at: 20 }, how: "Ghé 20 cảnh ở Khám phá" },
  { id: "trophy", label: "Cúp lớn", kind: "floor", need: { stat: "level", at: 10 }, how: "Đạt cấp 10" },
  { id: "bonsai", label: "Chậu bonsai", kind: "floor", need: { stat: "weeksDone", at: 4 }, how: "Nhận 4 huy hiệu mục tiêu tuần" },
  { id: "bowl", label: "Bát ăn", kind: "small", need: null, how: "Có sẵn" },
  { id: "ball", label: "Quả bóng", kind: "small", need: { stat: "daysTogether", at: 3 }, how: "Bên nhau 3 ngày" },
  { id: "lamp", label: "Đèn bàn", kind: "small", need: { stat: "streakLongest", at: 7 }, how: "Chuỗi ngày dài nhất đạt 7 ngày" },
  { id: "clock", label: "Đồng hồ nhỏ", kind: "small", need: { stat: "level", at: 5 }, how: "Đạt cấp 5" },
  { id: "globe", label: "Quả địa cầu", kind: "small", need: { stat: "visited", at: 5 }, how: "Ghé 5 cảnh ở Khám phá" },
  { id: "teapot", label: "Ấm trà nhỏ", kind: "small", need: { stat: "weeksDone", at: 2 }, how: "Nhận 2 huy hiệu mục tiêu tuần" },
  { id: "inkset", label: "Bộ bút nghiên", kind: "small", need: { stat: "visited", at: 10 }, how: "Ghé 10 cảnh ở Khám phá" },
];

export const HOME_SLOTS = [
  { id: "wallL", kind: "wall", label: "Tường trái" },
  { id: "wallR", kind: "wall", label: "Tường phải" },
  { id: "floorL", kind: "floor", label: "Sàn trái" },
  { id: "floorR", kind: "floor", label: "Sàn phải" },
  { id: "shelfL", kind: "small", label: "Kệ trái" },
  { id: "shelfR", kind: "small", label: "Kệ phải" },
] as const satisfies readonly { id: string; kind: HomeItemKind; label: string }[];
export type HomeSlotId = (typeof HOME_SLOTS)[number]["id"];

export const emptyStats = (): HomeStats => ({ streakLongest: 0, level: 1, stage: 1, daysTogether: 0, visited: 0, goldStamps: 0, journeys: 0, weeksDone: 0 });

export function itemUnlocked(item: HomeItem, stats: HomeStats): boolean {
  return !item.need || stats[item.need.stat] >= item.need.at;
}

/** Đã có / cần (để hiện "3/7") cho đồ chưa mở khóa; null với đồ có sẵn. */
export function itemProgress(item: HomeItem, stats: HomeStats): { have: number; need: number } | null {
  return item.need ? { have: Math.min(stats[item.need.stat], item.need.at), need: item.need.at } : null;
}

/** Cách sắp xếp đã lưu: thiếu khóa = tự động chọn, `null` = để trống, id = đồ người dùng chọn. */
export type Placement = Partial<Record<HomeSlotId, string | null>>;

const itemById = new Map(HOME_ITEMS.map((i) => [i.id, i]));

/**
 * Đồ thật sự hiện ở từng chỗ. Chỗ người dùng chọn thì giữ nếu vẫn hợp lệ (đúng loại, đã mở khóa, không trùng chỗ khác); chỗ để tự động thì lấy đồ MỚI MỞ KHÓA
 * gần nhất cùng loại chưa dùng (đồ mở sau trong danh mục thường "xịn" hơn), nên có đồ mới là thấy ngay.
 */
export function resolvePlacement(placed: Placement, stats: HomeStats): Record<HomeSlotId, string | null> {
  const used = new Set<string>();
  const out = {} as Record<HomeSlotId, string | null>;
  for (const slot of HOME_SLOTS) {
    const want = placed[slot.id];
    const item = typeof want === "string" ? itemById.get(want) : undefined;
    if (item && item.kind === slot.kind && itemUnlocked(item, stats) && !used.has(item.id)) { out[slot.id] = item.id; used.add(item.id); }
    else out[slot.id] = want === null ? null : "";
  }
  for (const slot of HOME_SLOTS) {
    if (out[slot.id] !== "") continue;
    const pick = [...HOME_ITEMS].reverse().find((i) => i.kind === slot.kind && itemUnlocked(i, stats) && !used.has(i.id));
    out[slot.id] = pick?.id ?? null;
    if (pick) used.add(pick.id);
  }
  return out;
}

/** Đồ đã mở khóa mà người dùng chưa từng "thấy" (để chúc mừng một lần). Đồ có sẵn không tính. */
export function newlyUnlocked(seen: readonly string[], stats: HomeStats): HomeItem[] {
  const s = new Set(seen);
  return HOME_ITEMS.filter((i) => i.need && itemUnlocked(i, stats) && !s.has(i.id));
}

export interface HomeState { placed: Placement; seen: string[] }
export const emptyHomeState: HomeState = { placed: {}, seen: [] };

/** Đọc trạng thái lưu cục bộ; sai dạng thì rỗng (kể cả khóa/đồ lạ). */
export function parseHomeState(raw: unknown): HomeState {
  if (!raw || typeof raw !== "object") return emptyHomeState;
  const r = raw as { placed?: unknown; seen?: unknown };
  const placed: Placement = {};
  if (r.placed && typeof r.placed === "object") {
    for (const slot of HOME_SLOTS) {
      const v = (r.placed as Record<string, unknown>)[slot.id];
      if (v === null) placed[slot.id] = null;
      else if (typeof v === "string" && itemById.has(v)) placed[slot.id] = v;
    }
  }
  const seen = Array.isArray(r.seen) ? r.seen.filter((x): x is string => typeof x === "string" && itemById.has(x)) : [];
  return { placed, seen };
}
