import type { StreakData } from "@/lib/streak/load-streak";
import { dailyGoalProgress } from "@/lib/streak/daily-goal";
import { EMPTY_SHOP, outfitIds, type PetShopState } from "./pet-shop";
import { daysSinceStudy, petGrowth, petMood, unlockedAccessories, type Pet, type PetGrowth, type PetMood } from "./pet-logic";

export interface PetView { growth: PetGrowth; mood: PetMood; accessories: string[] }

/** Giai đoạn, tâm trạng và phụ kiện của pet từ tổng XP và chuỗi ngày. Chuỗi chưa tải xong (hoặc lỗi) thì coi pet đang đói và chưa mở phụ kiện. */
export function computePetView(pet: Pet, totalXp: number, streak: StreakData | null | undefined, shop: PetShopState = EMPTY_SHOP): PetView {
  const mood = streak ? petMood(dailyGoalProgress(streak.todayItems, streak.dailyGoal), daysSinceStudy(streak)) : "hungry";
  return { growth: petGrowth(totalXp, pet.baseXp), mood, accessories: outfitIds(unlockedAccessories(streak?.longest ?? 0).map((a) => a.id), shop) };
}
