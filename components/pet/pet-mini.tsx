"use client";

import { useGameSummary } from "@/components/layout/use-game-summary";
import { useStreak } from "@/components/streak/use-streak";
import { computePetView } from "@/lib/pet/pet-view";
import { PetSprite } from "./pet-sprite";
import { usePet } from "./use-pet";
import { usePetMiniPref } from "./use-pet-mini-pref";

/**
 * Pet thu nhỏ ở các màn học (ôn thẻ, kết quả, bản đồ chặng): chỉ để ngắm, không có nút hay bóng thoại để không làm xao nhãng.
 * `cheer` = ăn mừng (mặt vui và nảy một lần khi hiện), dùng ở màn kết quả. Không hiện khi chưa nhận nuôi, đang tải, hoặc người dùng đã tắt.
 */
export function PetMini({ cheer = false, className = "size-12" }: { cheer?: boolean; className?: string }) {
  const { pet } = usePet();
  const game = useGameSummary();
  const streak = useStreak();
  const [visible] = usePetMiniPref();
  if (!visible || !pet || game === undefined || streak === undefined) return null;
  const view = computePetView(pet, game?.xp.total ?? 0, streak);
  return (
    <span aria-hidden="true" className={`inline-block shrink-0 ${className}`}>
      <PetSprite species={pet.species} stage={view.growth.stage} mood={cheer ? "happy" : view.mood} accessories={view.accessories} tapKey={cheer ? 1 : 0} className="size-full" />
    </span>
  );
}
