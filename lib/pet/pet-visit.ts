import { PET_ACCESSORIES, PET_SPECIES, cleanPetName, type PetSpecies, type PetStage } from "./pet-logic";

/**
 * Link mời bạn bè "đến thăm" pet: mang theo ảnh chụp pet (loài, tên, giai đoạn, phụ kiện, cấp, chuỗi ngày) ngay trong link, không lưu ở máy chủ.
 * Người nhận chỉ XEM và chơi cùng (không đổi gì của chủ pet). Mọi dữ liệu đọc từ link đều bị kiểm tra: loài/phụ kiện theo danh sách cho phép, tên cắt gọn.
 */
export interface PetVisit { species: PetSpecies; name: string; stage: PetStage; accessories: string[]; level: number; streak: number }

type Params = Pick<URLSearchParams, "get">;
const ACCESSORY_IDS = new Set(PET_ACCESSORIES.map((a) => a.id));
const int = (v: string | null, min: number, max: number): number | null => {
  const n = Number(v);
  return v !== null && v !== "" && Number.isInteger(n) && n >= min && n <= max ? n : null;
};

export function parseVisit(params: Params): PetVisit | null {
  const species = params.get("s");
  const name = cleanPetName(params.get("n"));
  const stage = int(params.get("g"), 1, 3);
  if (!name || stage === null || !(PET_SPECIES as readonly string[]).includes(species ?? "")) return null;
  const accessories = [...new Set((params.get("a") ?? "").split(",").filter((id) => ACCESSORY_IDS.has(id)))];
  return { species: species as PetSpecies, name, stage: stage as PetStage, accessories, level: int(params.get("l"), 1, 999) ?? 1, streak: int(params.get("k"), 0, 9999) ?? 0 };
}

export function buildVisitUrl(base: string, v: PetVisit): string {
  const url = new URL(base);
  url.search = "";
  url.searchParams.set("s", v.species);
  url.searchParams.set("n", v.name);
  url.searchParams.set("g", String(v.stage));
  if (v.accessories.length > 0) url.searchParams.set("a", v.accessories.join(","));
  url.searchParams.set("l", String(v.level));
  url.searchParams.set("k", String(v.streak));
  return url.toString();
}

/** Lời chào ngẫu nhiên-theo-chỉ-số của pet chủ nhà khi khách chạm vào. */
export const VISIT_GREETINGS = (name: string): string[] => [`Chào bạn! Mình là ${name}. Ghé chơi nhé!`, `Hihi, nhột quá!`, `Bạn học tiếng Trung chưa? Mình đang học đó!`, `Cảm ơn bạn đã ghé thăm ${name}!`, `Lần sau rủ thêm bạn nữa nha!`];

export const VISIT_GIFTS = ["🍪", "🌸", "⭐", "🍓"] as const;
