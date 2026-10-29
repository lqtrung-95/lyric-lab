"use client";

import { useEffect } from "react";
import { sfx } from "@/lib/games/arcade-sfx";
import { burstParticles, burstSound, type PetBurst } from "@/lib/pet/pet-burst";

const FX_CSS = `
.pet-particle { position: absolute; left: 50%; top: 45%; opacity: 0; pointer-events: none; line-height: 1 }
@media (prefers-reduced-motion: no-preference) {
  @keyframes pet-particle { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.4) } 15% { opacity: 1 } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.1) } }
  .pet-particle { animation: pet-particle 1.1s ease-out forwards; animation-delay: var(--delay) }
}`;

/**
 * Đợt hạt (tim, sao, vụn bánh…) bay ra từ pet kèm MỘT tiếng, mỗi lần `burst.key` đổi. Tiếng phát ở đây để mọi nơi chỉ cần đặt `burst`
 * (tiếng theo công tắc âm thanh chung, mặc định bật). Hạt chỉ chuyển động khi không bật giảm chuyển động; người đó vẫn nghe tiếng.
 * Chỉ trang trí (aria-hidden): lời nói và trạng thái luôn có chữ ở chỗ khác.
 */
export function PetBurstFx({ burst, species }: { burst: PetBurst | null; species: string }) {
  const key = burst?.key;
  const kind = burst?.kind;
  useEffect(() => {
    if (key === undefined || !kind) return;
    switch (burstSound(kind)) {
      case "chirp": sfx.petChirp(species); break;
      case "cheer": sfx.petCheer(); break;
      case "happy": sfx.petHappy(); break;
      case "sad": sfx.petSad(); break;
      case "crunch": sfx.petCrunch(); break;
      case "gift": sfx.petGift(); break;
      case "adopt": sfx.petAdopt(); break;
      case "evolve": sfx.petEvolve(); break;
      case "blip": sfx.pop(0); break;
    }
  }, [key, kind, species]);
  if (!burst) return null;
  return (
    <span aria-hidden="true" key={burst.key} className="pointer-events-none absolute inset-0 overflow-visible">
      <style>{FX_CSS}</style>
      {burstParticles(burst.kind).map((p, i) => (
        <span key={i} className="pet-particle" style={{ fontSize: `${p.sizeRem}rem`, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--delay" as string]: `${p.delayMs}ms` }}>{p.glyph}</span>
      ))}
    </span>
  );
}
