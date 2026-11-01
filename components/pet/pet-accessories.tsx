import type { PetStage } from "@/lib/pet/pet-logic";

/** Chiều cao đầu dùng chung cho mọi loài: tâm đầu ở `headY`, đầu cao ~28 mỗi phía, nên một bộ phụ kiện neo theo `headY` là đủ. */
export const petHeadY = (stage: PetStage) => (stage === 1 ? 62 : 52);

const RED = "#e5484d";
const RED_DARK = "#bd343a";
const INK = "#2b2b3a";
const GOLD = "#ffc800";
const GOLD_DARK = "#e0a800";
const WHITE = "#ffffff";
const PINK = "#ff7fa3";
const PURPLE = "#8a63d2";
const BLUE = "#3f86c4";
const SKY = "#bfe3ff";

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
      {ids.includes("bandana") && (
        <g>
          <path d={`M32 ${y + 22}q28 14 56 0l-28 26z`} fill={BLUE} />
          <circle cx="50" cy={y + 30} r="1.8" fill={WHITE} /><circle cx="64" cy={y + 33} r="1.8" fill={WHITE} /><circle cx="57" cy={y + 40} r="1.8" fill={WHITE} />
        </g>
      )}
      {ids.includes("bell") && (
        <g>
          <path d={`M34 ${y + 24}q26 16 52 0`} stroke={RED} strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="60" cy={y + 36} r="6" fill={GOLD} /><path d={`M54.500 ${y + 37}h11`} stroke={GOLD_DARK} strokeWidth="1.800" />
          <circle cx="60" cy={y + 39} r="1.400" fill={GOLD_DARK} />
        </g>
      )}
      {ids.includes("bowtie") && (
        <g>
          <path d={`M60 ${y + 33}l-15 -9v18z`} fill={RED} /><path d={`M60 ${y + 33}l15 -9v18z`} fill={RED} />
          <path d={`M60 ${y + 33}l-15 -9v18z`} fill="none" stroke={RED_DARK} strokeWidth="1.500" strokeLinejoin="round" />
          <rect x="55.500" y={y + 28} width="9" height="10" rx="3" fill={RED_DARK} />
        </g>
      )}
      {ids.includes("glasses") && (
        <g fill={WHITE} fillOpacity="0.2" stroke={INK} strokeWidth="3">
          <circle cx="46" cy={y - 4} r="11" /><circle cx="74" cy={y - 4} r="11" />
          <path d={`M57 ${y - 5}q3 -3 6 0`} fill="none" strokeLinecap="round" />
          <path d={`M35 ${y - 6}l-5 -3M85 ${y - 6}l5 -3`} fill="none" strokeLinecap="round" />
        </g>
      )}
      {ids.includes("sunglasses") && (
        <g>
          <path d={`M34 ${y - 12}h24a2 2 0 0 1 2 2v4a10 10 0 0 1 -10 10h-4a12 12 0 0 1 -12 -12z`} fill={INK} />
          <path d={`M62 ${y - 12}h24l-2 4a12 12 0 0 1 -12 12h-4a10 10 0 0 1 -10 -10v-4a2 2 0 0 1 2 -2z`} fill={INK} />
          <path d={`M38 ${y - 9}l6 -0.500M68 ${y - 9}l6 -0.500`} stroke={WHITE} strokeWidth="2.400" strokeLinecap="round" opacity="0.7" />
          <path d={`M32 ${y - 12}l-3 -3M88 ${y - 12}l3 -3`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {ids.includes("heartglasses") && (
        <g fill={PINK} stroke={INK} strokeWidth="2.400" strokeLinejoin="round">
          <path d={`M46 ${y + 6}c-14 -8 -13 -20 -5 -20 3 0 5 2 5 4 0 -2 2 -4 5 -4 8 0 9 12 -5 20z`} />
          <path d={`M74 ${y + 6}c-14 -8 -13 -20 -5 -20 3 0 5 2 5 4 0 -2 2 -4 5 -4 8 0 9 12 -5 20z`} />
          <path d={`M54 ${y - 8}q6 -3 12 0`} fill="none" strokeLinecap="round" />
        </g>
      )}
      {ids.includes("cap") && (
        <g>
          <path d={`M36 ${y - 18}c0 -26 48 -26 48 0z`} fill={RED} />
          <path d={`M58 ${y - 19}h40a4 4 0 0 1 0 7h-40z`} fill={RED_DARK} />
          <circle cx="60" cy={y - 37} r="3" fill={RED_DARK} />
          <path d={`M60 ${y - 36}v16`} stroke={RED_DARK} strokeWidth="1.500" />
        </g>
      )}
      {ids.includes("partyhat") && (
        <g>
          <path d={`M60 ${y - 56}l22 32h-44z`} fill={PURPLE} />
          <circle cx="52" cy={y - 32} r="3" fill={GOLD} /><circle cx="66" cy={y - 36} r="3" fill={PINK} /><circle cx="60" cy={y - 28} r="2.400" fill={WHITE} />
          <circle cx="60" cy={y - 57} r="5" fill={GOLD} />
        </g>
      )}
      {ids.includes("flower") && (
        <g>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={86 + 6 * Math.cos((a * Math.PI) / 180)} cy={y - 18 + 6 * Math.sin((a * Math.PI) / 180)} r="5.500" fill={PINK} />)}
          <circle cx="86" cy={y - 18} r="4" fill={GOLD} />
        </g>
      )}
      {ids.includes("headphones") && (
        <g>
          <path d={`M33 ${y - 4}c0 -44 54 -44 54 0`} stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="27" y={y - 16} width="12" height="22" rx="6" fill={RED} stroke={INK} strokeWidth="2.500" />
          <rect x="81" y={y - 16} width="12" height="22" rx="6" fill={RED} stroke={INK} strokeWidth="2.500" />
        </g>
      )}
      {ids.includes("halo") && (
        <g>
          <ellipse cx="60" cy={y - 38} rx="20" ry="6" fill="none" stroke={GOLD_DARK} strokeWidth="7" opacity="0.4" />
          <ellipse cx="60" cy={y - 38} rx="20" ry="6" fill="none" stroke={GOLD} strokeWidth="4.500" />
        </g>
      )}
      {ids.includes("beret") && (
        <g>
          <path d={`M32 ${y - 20}c2 -22 46 -26 58 -6c2 4 -2 8 -8 8c-14 3 -34 3 -50 -2z`} fill={PURPLE} />
          <circle cx="62" cy={y - 33} r="3" fill={PURPLE} stroke="#6a45b0" strokeWidth="1.500" />
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

/** Món đeo ở LƯNG (áo choàng, cánh): vẽ TRƯỚC thân pet để nằm phía sau. */
export function PetBackItems({ ids, stage }: { ids: readonly string[]; stage: PetStage }) {
  const y = petHeadY(stage);
  return (
    <g>
      {ids.includes("cape") && (
        <g>
          <path d={`M34 ${y + 26}L14 ${y + 82}q46 16 92 0L86 ${y + 26}z`} fill={RED} />
          <path d={`M34 ${y + 26}L14 ${y + 82}q12 4 26 6z`} fill={RED_DARK} opacity="0.5" />
        </g>
      )}
      {ids.includes("wings") && (
        <g fill={WHITE} stroke="#d4dbe6" strokeWidth="2">
          <path d={`M36 ${y + 30}C8 ${y + 34} -2 ${y + 6} 4 ${y - 14}c16 4 24 12 36 22z`} />
          <path d={`M84 ${y + 30}c28 4 38 -24 32 -44c-16 4 -24 12 -36 22z`} />
          <path d={`M10 ${y - 4}q8 2 14 10M110 ${y - 4}q-8 2 -14 10`} fill="none" stroke={SKY} strokeWidth="2.500" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}
