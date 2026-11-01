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
      {ids.includes("tetcharm") && (
        <g>
          <path d={`M42 ${y + 24}q18 14 36 0`} stroke={GOLD} strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="51" y={y + 33} width="18" height="23" rx="3" fill={RED} stroke={RED_DARK} strokeWidth="1.500" />
          <path d={`M51 ${y + 39}q9 7 18 0`} fill="none" stroke={RED_DARK} strokeWidth="1.500" />
          <circle cx="60" cy={y + 46} r="4.500" fill={GOLD} /><path d={`M57.500 ${y + 46}h5`} stroke={GOLD_DARK} strokeWidth="1.500" />
        </g>
      )}
      {ids.includes("noelscarf") && (
        <g>
          <path d={`M30 ${y + 26}q30 16 60 0l-2 9q-28 12 -56 0z`} fill={RED} />
          <path d={`M42 ${y + 31}l3 8M54 ${y + 34}l3 8M66 ${y + 34}l3 8M78 ${y + 31}l3 8`} stroke={WHITE} strokeWidth="3" />
          <path d={`M78 ${y + 33}l6 18l8 -4l-5 -16z`} fill={RED_DARK} />
          <path d={`M80 ${y + 41}l5 -1.500M82 ${y + 46}l5 -1.500`} stroke={WHITE} strokeWidth="2" />
        </g>
      )}
      {ids.includes("stethoscope") && (
        <g>
          <path d={`M42 ${y + 22}c-4 26 10 32 18 32s22 -6 18 -32`} stroke="#5b6472" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="60" cy={y + 56} r="6" fill="#cfd6e0" stroke="#5b6472" strokeWidth="2.500" />
        </g>
      )}
      {ids.includes("necktie") && (
        <g>
          <path d={`M46 ${y + 26}l14 8l14 -8l-3 12l-11 -4l-11 4z`} fill={WHITE} opacity="0.9" />
          <rect x="55.500" y={y + 30} width="9" height="7" rx="2" fill={BLUE} />
          <path d={`M56 ${y + 37}h8l4 20l-8 6l-8 -6z`} fill={BLUE} />
          <path d={`M54 ${y + 45}l12 -3M53 ${y + 51}l14 -3`} stroke={SKY} strokeWidth="2" />
        </g>
      )}
      {ids.includes("chefhat") && (
        <g fill={WHITE} stroke="#d8dde6" strokeWidth="1.800">
          <circle cx="46" cy={y - 38} r="11" /><circle cx="60" cy={y - 44} r="13" /><circle cx="74" cy={y - 38} r="11" />
          <path d={`M42 ${y - 36}h36v14a4 4 0 0 1 -4 4h-28a4 4 0 0 1 -4 -4z`} />
          <path d={`M42 ${y - 25}h36`} stroke="#d8dde6" />
        </g>
      )}
      {ids.includes("sunhat") && (
        <g>
          <ellipse cx="60" cy={y - 20} rx="36" ry="9" fill="#f0c97a" stroke="#d1a24e" strokeWidth="2" />
          <path d={`M40 ${y - 22}c0 -24 40 -24 40 0z`} fill="#f7d98f" stroke="#d1a24e" strokeWidth="2" />
          <path d={`M40 ${y - 26}h40`} stroke={BLUE} strokeWidth="5" />
        </g>
      )}
      {ids.includes("gradcap") && (
        <g>
          <path d={`M44 ${y - 30}v12q16 9 32 0v-12z`} fill="#2f3441" />
          <path d={`M60 ${y - 50}l34 13l-34 13l-34 -13z`} fill="#3a4052" stroke="#2b2b3a" strokeWidth="1.500" strokeLinejoin="round" />
          <path d={`M90 ${y - 38}v16`} stroke={GOLD} strokeWidth="2.500" strokeLinecap="round" />
          <circle cx="90" cy={y - 20} r="3.200" fill={GOLD} />
        </g>
      )}
      {ids.includes("tethat") && (
        <g>
          <path d={`M37 ${y - 17}c-2 -28 44 -28 46 0z`} fill="#b3202a" />
          <rect x="37" y={y - 25} width="46" height="7" fill={GOLD} />
          <circle cx="60" cy={y - 33} r="4" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1.500" />
        </g>
      )}
      {ids.includes("moonears") && (
        <g>
          <ellipse cx="45" cy={y - 46} rx="7" ry="17" fill={WHITE} stroke="#d8dde6" strokeWidth="2" transform={`rotate(-10 45 ${y - 46})`} />
          <ellipse cx="75" cy={y - 46} rx="7" ry="17" fill={WHITE} stroke="#d8dde6" strokeWidth="2" transform={`rotate(10 75 ${y - 46})`} />
          <ellipse cx="45" cy={y - 45} rx="3" ry="11" fill={PINK} opacity="0.7" transform={`rotate(-10 45 ${y - 45})`} />
          <ellipse cx="75" cy={y - 45} rx="3" ry="11" fill={PINK} opacity="0.7" transform={`rotate(10 75 ${y - 45})`} />
          <path d={`M36 ${y - 22}q24 -9 48 0`} stroke={GOLD} strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )}
      {ids.includes("santahat") && (
        <g>
          <path d={`M36 ${y - 18}c4 -26 30 -34 52 -30c-8 6 -6 18 -4 30z`} fill={RED} />
          <rect x="34" y={y - 24} width="52" height="9" rx="4.500" fill={WHITE} />
          <circle cx="90" cy={y - 46} r="6" fill={WHITE} />
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
      {ids.includes("starlantern") && (
        <g>
          <path d={`M88 ${y + 28}L100 ${y + 6}`} stroke={INK} strokeWidth="1.500" />
          <path d={`M100 ${y - 12}l4 8 9 1.500 -6.500 6 1.800 9 -8.300 -4.500 -8.300 4.500 1.800 -9 -6.500 -6 9 -1.500z`} fill={GOLD} stroke={GOLD_DARK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="100" cy={y + 2} r="3" fill={WHITE} opacity="0.8" />
          <path d={`M95 ${y + 14}v6M100 ${y + 15}v8M105 ${y + 14}v6`} stroke={RED} strokeWidth="2" strokeLinecap="round" />
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
