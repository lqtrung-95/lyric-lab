"use client";

import { useMemo } from "react";
import { PetBurstFx } from "@/components/pet/pet-burst-fx";
import { PetSprite } from "@/components/pet/pet-sprite";
import { usePetMiniPref } from "@/components/pet/use-pet-mini-pref";
import { usePetView } from "@/components/pet/use-pet-view";
import type { PetBurst, PetBurstKind } from "@/lib/pet/pet-burst";
import type { PetMood } from "@/lib/pet/pet-logic";

/** Sự kiện trong game để pet phản ứng: `key` tăng mỗi lần để phát lại hoạt ảnh. */
export interface GamePetEvent { key: number; kind: "hit" | "miss" | "combo" }
const BURST: Record<GamePetEvent["kind"], PetBurstKind> = { hit: "tap", miss: "try", combo: "cheer" };

/**
 * Pet cổ vũ cạnh khung chơi: nảy và bắn hạt khi đúng (nhiều hơn khi combo), lo lắng khi sai. Hạt im lặng (game có tiếng riêng).
 * Chỉ trang trí (aria-hidden); tôn trọng công tắc "pet thu nhỏ" và giảm chuyển động. Không hiện khi chưa nhận nuôi hoặc đang tải.
 * `mood` ép tâm trạng (ví dụ pet buồn khi thua).
 */
export function GamePet({ event, mood, className = "size-14" }: { event?: GamePetEvent | null; mood?: PetMood; className?: string }) {
  const data = usePetView();
  const [visible] = usePetMiniPref();
  const burst = useMemo<PetBurst | null>(() => (event ? { key: event.key, kind: BURST[event.kind] } : null), [event]);
  if (!visible || !data) return null;
  const { pet, view } = data;
  const shown: PetMood = mood ?? (event?.kind === "miss" ? "hungry" : event ? "happy" : view.mood);
  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 ${className}`}>
      <PetSprite species={pet.species} stage={view.growth.stage} mood={shown} accessories={view.accessories} tapKey={event?.key ?? 0} className="size-full" />
      <PetBurstFx burst={burst} species={pet.species} silent />
    </span>
  );
}
