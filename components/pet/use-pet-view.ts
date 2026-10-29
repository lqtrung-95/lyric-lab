"use client";

import { useGameSummary } from "@/components/layout/use-game-summary";
import { useStreak } from "@/components/streak/use-streak";
import type { Pet } from "@/lib/pet/pet-logic";
import { computePetView, type PetView } from "@/lib/pet/pet-view";
import { usePet } from "./use-pet";

/** Pet cùng giai đoạn/tâm trạng/phụ kiện của nó. undefined = đang tải, null = chưa nhận nuôi. Dùng cho các màn ngoài thẻ pet (game, kết quả). */
export function usePetView(): { pet: Pet; view: PetView } | null | undefined {
  const { pet } = usePet();
  const game = useGameSummary();
  const streak = useStreak();
  if (pet === undefined || game === undefined || streak === undefined) return undefined;
  if (pet === null) return null;
  return { pet, view: computePetView(pet, game?.xp.total ?? 0, streak) };
}
