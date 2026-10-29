import type { DailyGoalProgress } from "@/lib/streak/daily-goal";

/** Linh vật đồng hành: chỉ lưu loài, tên, ngày nhận nuôi. Giai đoạn và tâm trạng luôn tính lại từ XP và tiến độ hôm nay, không lưu. */
export const PET_SPECIES = ["dragon", "cat", "dog", "panda", "owl"] as const;
export type PetSpecies = (typeof PET_SPECIES)[number];

export const PET_SPECIES_LABELS: Record<PetSpecies, string> = { dragon: "Rồng", cat: "Mèo", dog: "Cún", panda: "Gấu trúc", owl: "Cú" };

export interface Pet {
  species: PetSpecies;
  name: string;
  /** Ngày nhận nuôi, ISO. */
  adoptedAt: string;
}

export const PET_NAME_MAX = 16;

/** Tên hợp lệ: bỏ khoảng trắng thừa, tối đa `PET_NAME_MAX` ký tự; rỗng thì null. */
export function cleanPetName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = [...raw.replace(/\s+/g, " ").trim()].slice(0, PET_NAME_MAX).join("").trim();
  return name === "" ? null : name;
}

/** Đọc một khối bất kỳ (localStorage hoặc DB) thành Pet; sai dạng thì null. */
export function parsePet(raw: unknown): Pet | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = cleanPetName(r.name);
  if (!name || !(PET_SPECIES as readonly string[]).includes(r.species as string)) return null;
  const adoptedAt = typeof r.adoptedAt === "string" && !Number.isNaN(Date.parse(r.adoptedAt)) ? r.adoptedAt : new Date(0).toISOString();
  return { species: r.species as PetSpecies, name, adoptedAt };
}

/**
 * Ngưỡng tổng XP để lên giai đoạn 1 (con non), 2 (thiếu niên), 3 (trưởng thành).
 * Ước lượng: người học khoảng 15 phút/ngày được chừng 40–60 XP (ôn 2 XP/thẻ, mỗi câu luyện đúng 2 XP, nghe hết bài 20 XP, cộng thưởng nhiệm vụ),
 * nên giai đoạn 2 sau khoảng một tuần và giai đoạn 3 sau khoảng một tháng.
 */
export const PET_STAGE_XP = [0, 300, 1500] as const;
export type PetStage = 1 | 2 | 3;

export interface PetGrowth {
  stage: PetStage;
  /** XP đã có trong giai đoạn hiện tại. */
  progressXp: number;
  /** XP cần để đi hết giai đoạn hiện tại (0 khi đã trưởng thành). */
  nextXp: number;
  maxed: boolean;
}

export function petGrowth(totalXp: number): PetGrowth {
  const xp = Math.max(0, Math.floor(Number.isFinite(totalXp) ? totalXp : 0));
  const stage = (xp >= PET_STAGE_XP[2] ? 3 : xp >= PET_STAGE_XP[1] ? 2 : 1) as PetStage;
  const maxed = stage === 3;
  return { stage, progressXp: xp - PET_STAGE_XP[stage - 1], nextXp: maxed ? 0 : PET_STAGE_XP[stage] - PET_STAGE_XP[stage - 1], maxed };
}

/**
 * Có vừa tiến hóa không: `seen` là giai đoạn lần trước đã cho người dùng thấy (null = chưa từng ghi).
 * Trả giai đoạn mới nếu cao hơn `seen`; lần đầu (null) và khi không đổi hoặc tụt thì null, để không "tiến hóa" lúc vừa nhận nuôi.
 */
export function evolvedStage(seen: number | null, current: PetStage): PetStage | null {
  return seen !== null && current > seen ? current : null;
}

export type PetMood = "happy" | "hungry" | "sleepy";
/** Bỏ học từng này ngày liên tiếp thì pet "ngủ" (không phạt, không mất gì). */
export const PET_SLEEP_AFTER_DAYS = 3;

/**
 * Tâm trạng hôm nay: no/vui khi đạt mục tiêu ngày (hoặc đã học gì đó khi tắt mục tiêu); ngủ khi lâu chưa học; còn lại là đói.
 * `daysSinceStudy`: số ngày kể từ lần học gần nhất (0 = hôm nay), null = chưa từng học.
 */
export function petMood(goal: DailyGoalProgress, daysSinceStudy: number | null): PetMood {
  if (goal.done || (!goal.enabled && goal.items > 0)) return "happy";
  if (daysSinceStudy !== null && daysSinceStudy >= PET_SLEEP_AFTER_DAYS) return "sleepy";
  return "hungry";
}

export interface PetAccessory { id: string; label: string; streak: number }
/** Phụ kiện mở khóa theo chuỗi ngày dài nhất (chỉ để ngắm, không ảnh hưởng điểm). */
export const PET_ACCESSORIES: readonly PetAccessory[] = [
  { id: "scarf", label: "Khăn quàng", streak: 7 },
  { id: "hat", label: "Mũ thư sinh", streak: 30 },
  { id: "crown", label: "Vương miện", streak: 100 },
];

export const unlockedAccessories = (longestStreak: number): PetAccessory[] => PET_ACCESSORIES.filter((a) => longestStreak >= a.streak);

export interface StudyDaysInput {
  studiedToday: boolean;
  current: number;
  longest: number;
  week: { day: string; studied: boolean; isToday: boolean }[];
}

const DAY_MS = 86_400_000;
const dayNumber = (key: string): number => Date.parse(`${key}T00:00:00Z`) / DAY_MS;

/** Số ngày kể từ lần học gần nhất (0 = hôm nay) từ dữ liệu chuỗi ngày; null = chưa từng học. Không thấy ngày học nào trong tuần này thì coi là ít nhất 7 ngày. */
export function daysSinceStudy(s: StudyDaysInput): number | null {
  if (s.studiedToday) return 0;
  if (s.current > 0) return 1;
  const today = s.week.find((d) => d.isToday);
  const last = [...s.week].reverse().find((d) => d.studied && !d.isToday);
  if (today && last) return Math.max(1, Math.round(dayNumber(today.day) - dayNumber(last.day)));
  return s.longest > 0 ? 7 : null;
}
