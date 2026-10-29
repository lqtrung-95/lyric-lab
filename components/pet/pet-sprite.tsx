import type { PetMood, PetSpecies, PetStage } from "@/lib/pet/pet-logic";

/** Loài đã có hình. Các loài khác (mèo, cún, gấu trúc, cú) chờ duyệt hình rồng rồi mới vẽ. */
export const PET_SPECIES_READY: readonly PetSpecies[] = ["dragon"];

const INK = "#3b2416";
const BODY = "#6bbf6f";
const BODY_DARK = "#4a9a50";
const BELLY = "#f6e7ae";
const HORN = "#f5c518";
const CHEEK = "#f59a8a";

/** Mắt và miệng theo tâm trạng: vui = mắt cong + miệng cười, đói = mắt tròn + miệng há, ngủ = mắt nhắm + chữ z. */
function Face({ mood, y }: { mood: PetMood; y: number }) {
  const eye = { stroke: INK, strokeWidth: 3, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      {mood === "happy" && <><path d={`M42 ${y}q6 -8 12 0`} {...eye} /><path d={`M66 ${y}q6 -8 12 0`} {...eye} /><path d={`M52 ${y + 12}q8 8 16 0`} {...eye} /></>}
      {mood === "hungry" && <><circle cx="48" cy={y} r="4.5" fill={INK} /><circle cx="72" cy={y} r="4.5" fill={INK} /><ellipse cx="60" cy={y + 14} rx="5" ry="6" fill={INK} /></>}
      {mood === "sleepy" && <><path d={`M42 ${y}q6 6 12 0`} {...eye} /><path d={`M66 ${y}q6 6 12 0`} {...eye} /><path d={`M56 ${y + 13}h8`} {...eye} /><text x="88" y={y - 10} fontSize="14" fontWeight="800" fill={INK}>z</text><text x="96" y={y - 22} fontSize="10" fontWeight="800" fill={INK}>z</text></>}
      <ellipse cx="38" cy={y + 9} rx="5" ry="3.5" fill={CHEEK} opacity="0.8" />
      <ellipse cx="82" cy={y + 9} rx="5" ry="3.5" fill={CHEEK} opacity="0.8" />
    </g>
  );
}

/** Rồng con ba giai đoạn: con non (tròn, sừng nhỏ) → thiếu niên (cánh nhỏ, đuôi) → trưởng thành (cánh lớn, sừng dài, lửa). */
function Dragon({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  const hornLen = stage === 1 ? 10 : stage === 2 ? 16 : 22;
  const headY = stage === 1 ? 64 : 52;
  return (
    <g>
      {stage >= 2 && <path d={`M26 78q-24 ${stage === 3 ? -34 : -18} -4 ${stage === 3 ? -34 : -22}q2 20 14 30z M94 78q24 ${stage === 3 ? -34 : -18} 4 ${stage === 3 ? -34 : -22}q-2 20 -14 30z`} fill={BODY_DARK} {...s} />}
      {stage >= 2 && <path d="M86 100q26 4 26 -16q-8 8 -22 2z" fill={BODY} {...s} />}
      <ellipse cx="60" cy={stage === 1 ? 82 : 86} rx={stage === 1 ? 30 : 28} ry={stage === 1 ? 28 : 26} fill={BODY} {...s} />
      <ellipse cx="60" cy={stage === 1 ? 90 : 94} rx="16" ry={stage === 1 ? 17 : 15} fill={BELLY} stroke={INK} strokeWidth="2" />
      <ellipse cx="60" cy={headY} rx="32" ry="28" fill={BODY} {...s} />
      <path d={`M38 ${headY - 22}l-6 -${hornLen}l16 ${hornLen - 6}z M82 ${headY - 22}l6 -${hornLen}l-16 ${hornLen - 6}z`} fill={HORN} {...s} />
      {stage >= 2 && <path d={`M60 ${headY - 28}l-5 -8l5 3l5 -3z`} fill={HORN} {...s} />}
      <Face mood={mood} y={headY - 2} />
      {stage === 3 && mood !== "sleepy" && <path d="M76 66q12 -4 14 6q-8 -2 -14 -6z" fill="#ff8a3d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />}
      <path d="M36 108h14m20 0h14" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

/** Hình linh vật. Chỉ trang trí (aria-hidden): thông tin tên, giai đoạn, tâm trạng luôn có chữ bên cạnh. */
export function PetSprite({ species, stage, mood, className = "size-28" }: { species: PetSpecies; stage: PetStage; mood: PetMood; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={`${className} overflow-visible ${mood === "sleepy" ? "opacity-90" : ""}`}>
      <ellipse cx="60" cy="112" rx="34" ry="5" fill={INK} opacity="0.12" />
      {species === "dragon" && <Dragon stage={stage} mood={mood} />}
    </svg>
  );
}
