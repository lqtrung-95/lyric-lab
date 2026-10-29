import type { PetMood, PetSpecies, PetStage } from "@/lib/pet/pet-logic";
import { Cat } from "./pet-art-cat";
import { Dog } from "./pet-art-dog";
import { Dragon } from "./pet-art-dragon";
import { Owl } from "./pet-art-owl";
import { Panda } from "./pet-art-panda";
import { PetAccessories } from "./pet-accessories";

/** Loài đã có hình. Hình phẳng kiểu hoạt hình: không viền, màu tươi, mắt to có chấm sáng. */
export const PET_SPECIES_READY: readonly PetSpecies[] = ["dragon", "panda", "cat", "dog", "owl"];

/**
 * Hoạt ảnh của linh vật (CSS thuần). Nằm trong `prefers-reduced-motion: no-preference`: người chọn giảm chuyển động thấy hình tĩnh.
 * Vui: nảy lên; đói: lắc nhẹ, chớp mắt; ngủ: phập phồng thở, chữ z bay lên. Đuôi rồng vẫy, cành tre đung đưa.
 */
const PET_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes pet-hop { 0%,100% { transform: translateY(0) scale(1,1) } 45% { transform: translateY(-7px) scale(.97,1.04) } 60% { transform: translateY(0) scale(1.04,.96) } }
  @keyframes pet-wiggle { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-3deg) } 75% { transform: rotate(3deg) } }
  @keyframes pet-breathe { 0%,100% { transform: scale(1,1) } 50% { transform: scale(1.03,.97) } }
  @keyframes pet-blink { 0%,90%,100% { transform: scaleY(1) } 95% { transform: scaleY(.1) } }
  @keyframes pet-zzz { 0% { opacity: 0; transform: translate(0,5px) } 30% { opacity: 1 } 100% { opacity: 0; transform: translate(4px,-14px) } }
  @keyframes pet-tail { from { transform: rotate(-7deg) } to { transform: rotate(9deg) } }
  @keyframes pet-boing { 0% { transform: translateY(0) scale(1,1) } 30% { transform: translateY(-12px) scale(.94,1.08) } 55% { transform: translateY(0) scale(1.08,.92) } 75% { transform: translateY(-4px) scale(.99,1.02) } 100% { transform: translateY(0) scale(1,1) } }
  @keyframes pet-sway { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
  .pet-body { transform-box: fill-box; transform-origin: 50% 100% }
  .pet-body-happy { animation: pet-hop 1.1s ease-in-out infinite }
  .pet-body-hungry { animation: pet-wiggle 1.6s ease-in-out infinite }
  .pet-body-sleepy { animation: pet-breathe 3.6s ease-in-out infinite }
  .pet-eye { transform-box: fill-box; transform-origin: center; animation: pet-blink 4.2s ease-in-out infinite }
  .pet-z { animation: pet-zzz 2.8s ease-out infinite }
  .pet-z2 { animation-delay: 1.2s }
  .pet-tail { transform-box: fill-box; transform-origin: 0% 30%; animation: pet-tail 1.3s ease-in-out infinite alternate }
  .pet-tap { transform-box: fill-box; transform-origin: 50% 100%; animation: pet-boing .5s ease-out }
  .pet-bamboo { transform-box: fill-box; transform-origin: 50% 100%; animation: pet-sway 2.6s ease-in-out infinite alternate }
}`;

/** Màu nền tròn của từng loài (pastel phẳng); cũng giúp phần đen/xanh đậm không chìm vào giao diện tối. */
const TINT: Record<PetSpecies, string> = { dragon: "#dff6e6", panda: "#dcecff", cat: "#ffe9d6", dog: "#f3e6d4", owl: "#e8e1ff" };

/** Hình linh vật. Chỉ trang trí (aria-hidden): thông tin tên, giai đoạn, tâm trạng luôn có chữ bên cạnh. */
export function PetSprite({ species, stage, mood, accessories = [], tapKey = 0, className = "size-28" }: { species: PetSpecies; stage: PetStage; mood: PetMood; accessories?: readonly string[]; /** Tăng mỗi lần chạm để phát lại hoạt ảnh nảy. */ tapKey?: number; className?: string }) {
  return (
    <>
      <style>{PET_CSS}</style>
      <svg viewBox="0 0 120 120" aria-hidden="true" className={`${className} overflow-visible`}>
        <circle cx="60" cy="64" r="56" fill={TINT[species]} />
        <ellipse cx="60" cy="112" rx="34" ry="5" fill="#3a2b2b" opacity="0.14" />
        <g key={tapKey} className={tapKey > 0 ? "pet-tap" : undefined}>
        <g className={`pet-body pet-body-${mood}`}>
          {species === "dragon" && <Dragon stage={stage} mood={mood} />}
          {species === "panda" && <Panda stage={stage} mood={mood} />}
          {species === "cat" && <Cat stage={stage} mood={mood} />}
          {species === "dog" && <Dog stage={stage} mood={mood} />}
          {species === "owl" && <Owl stage={stage} mood={mood} />}
          <PetAccessories ids={accessories} stage={stage} />
        </g>
        </g>
      </svg>
    </>
  );
}
