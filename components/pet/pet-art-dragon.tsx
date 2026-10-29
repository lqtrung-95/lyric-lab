import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, Eyes, Mouth, Zzz } from "./pet-face-kit";

const BODY = "#4ccf7f";
const SHADE = "#2fa862";
const BELLY = "#d9f7e0";
const HORN = "#ffc800";
const FLAME = "#ff8a3d";

/** Rồng: con non (tròn, sừng nhỏ) → thiếu niên (cánh nhỏ, đuôi vẫy) → trưởng thành (cánh lớn, sừng dài, phun lửa nhỏ). Hình phẳng không viền. */
export function Dragon({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const hornLen = stage === 1 ? 10 : stage === 2 ? 16 : 22;
  const headY = stage === 1 ? 62 : 52;
  const wing = stage === 3 ? 34 : 20;
  return (
    <g>
      {stage >= 2 && <path d={`M28 80q-26 -${wing} -4 -${wing + 2}q2 20 14 30z M92 80q26 -${wing} 4 -${wing + 2}q-2 20 -14 30z`} fill={SHADE} />}
      {stage >= 2 && <path className="pet-tail" d="M86 100q28 4 26 -18q-8 10 -24 2z" fill={SHADE} />}
      <ellipse cx="60" cy={stage === 1 ? 84 : 88} rx={stage === 1 ? 29 : 28} ry={stage === 1 ? 26 : 24} fill={BODY} />
      <ellipse cx="60" cy={stage === 1 ? 90 : 94} rx="17" ry={stage === 1 ? 16 : 14} fill={BELLY} />
      <ellipse cx="46" cy="108" rx="10" ry="5.5" fill={SHADE} />
      <ellipse cx="74" cy="108" rx="10" ry="5.5" fill={SHADE} />
      <path d={`M40 ${headY - 20}l-8 -${hornLen}l17 ${hornLen - 6}z M80 ${headY - 20}l8 -${hornLen}l-17 ${hornLen - 6}z`} fill={HORN} />
      <ellipse cx="60" cy={headY} rx="33" ry="28" fill={BODY} />
      {stage >= 2 && <path d={`M60 ${headY - 28}l-6 -9l6 4l6 -4z`} fill={HORN} />}
      <ellipse cx="60" cy={headY + 12} rx="14" ry="9" fill={BELLY} />
      <Eyes mood={mood} cx={60} y={headY - 4} r={stage === 1 ? 9 : 8} />
      <Cheeks cx={60} y={headY + 8} />
      <circle cx="55" cy={headY + 7} r="1.4" fill={SHADE} />
      <circle cx="65" cy={headY + 7} r="1.4" fill={SHADE} />
      <Mouth mood={mood} cx={60} y={headY + 12} />
      {stage === 3 && mood !== "sleepy" && <path d="M80 70q14 -6 18 6q-10 0 -18 -6z" fill={FLAME} />}
      {mood === "sleepy" && <Zzz x={92} y={headY - 10} />}
    </g>
  );
}
