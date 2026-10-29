import type { PetStage } from "@/lib/pet/pet-logic";

/** Chiều cao đầu dùng chung cho mọi loài: tâm đầu ở `headY`, đầu cao ~28 mỗi phía, nên một bộ phụ kiện neo theo `headY` là đủ. */
export const petHeadY = (stage: PetStage) => (stage === 1 ? 62 : 52);

const RED = "#e5484d";
const RED_DARK = "#bd343a";
const INK = "#2b2b3a";
const GOLD = "#ffc800";
const GOLD_DARK = "#e0a800";

/** Phụ kiện mở khóa theo chuỗi ngày (chỉ để ngắm): khăn quàng ở cổ, mũ thư sinh hoặc vương miện trên đầu (vương miện thay mũ). */
export function PetAccessories({ ids, stage }: { ids: readonly string[]; stage: PetStage }) {
  const y = petHeadY(stage);
  const crown = ids.includes("crown");
  const hat = ids.includes("hat") && !crown;
  return (
    <g>
      {ids.includes("scarf") && (
        <g>
          <path d={`M30 ${y + 26}q30 16 60 0l-2 9q-28 12 -56 0z`} fill={RED} />
          <path d={`M78 ${y + 33}l6 18l8 -4l-5 -16z`} fill={RED_DARK} />
        </g>
      )}
      {hat && (
        <g>
          <path d={`M36 ${y - 22}h48l-4 -7h-40z`} fill={INK} />
          <rect x="42" y={y - 40} width="36" height="14" rx="3" fill={INK} />
          <rect x="42" y={y - 29} width="36" height="3" fill={GOLD} />
        </g>
      )}
      {crown && (
        <g>
          <path d={`M38 ${y - 24}l-3 -22l15 11l10 -17l10 17l15 -11l-3 22z`} fill={GOLD} />
          <rect x="38" y={y - 28} width="44" height="5" rx="2" fill={GOLD_DARK} />
          <circle cx="60" cy={y - 40} r="2.6" fill={RED} />
        </g>
      )}
    </g>
  );
}
