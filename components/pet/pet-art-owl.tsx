import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, DARK, Eyes, Zzz } from "./pet-face-kit";

const BODY = "#8b7bff";
const WING = "#6a5ae0";
const BELLY = "#ece8ff";
const BEAK = "#ffb347";

/** Cú tím: cú con (tròn, chỏm tai nhỏ) → thiếu niên (cánh rõ) → trưởng thành (chỏm tai dài, cánh xòe). Hình phẳng không viền, màu và dáng khác hẳn nhân vật cú của các app khác. */
export function Owl({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const hy = stage === 1 ? 62 : 52;
  const tuft = stage === 1 ? 16 : stage === 2 ? 22 : 28;
  const wingW = stage === 3 ? 15 : 11;
  return (
    <g>
      <ellipse cx="60" cy={stage === 1 ? 86 : 88} rx={stage === 1 ? 28 : 30} ry={stage === 1 ? 25 : 24} fill={BODY} />
      <ellipse cx="60" cy={stage === 1 ? 92 : 94} rx="18" ry="15" fill={BELLY} />
      <path d="M52 90q4 4 8 0q4 4 8 0 M52 99q4 4 8 0q4 4 8 0" stroke="#cfc7ff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {stage >= 2 && <path d={`M33 76q-${wingW + 6} 18 4 32q10 -8 4 -30z M87 76q${wingW + 6} 18 -4 32q-10 -8 -4 -30z`} fill={WING} />}
      {stage === 1 && <ellipse cx="32" cy="90" rx="7" ry="13" transform="rotate(12 32 90)" fill={WING} />}
      {stage === 1 && <ellipse cx="88" cy="90" rx="7" ry="13" transform="rotate(-12 88 90)" fill={WING} />}
      <ellipse cx="46" cy="109" rx="9" ry="4.5" fill={BEAK} />
      <ellipse cx="74" cy="109" rx="9" ry="4.5" fill={BEAK} />
      <path d={`M34 ${hy - 14}L28 ${hy - 14 - tuft}L54 ${hy - 24}z M86 ${hy - 14}L92 ${hy - 14 - tuft}L66 ${hy - 24}z`} fill={WING} />
      <ellipse cx="60" cy={hy} rx="34" ry="28" fill={BODY} />
      <circle cx="45" cy={hy - 3} r="15.5" fill={BELLY} />
      <circle cx="75" cy={hy - 3} r="15.5" fill={BELLY} />
      <Eyes mood={mood} cx={60} y={hy - 3} r={8.5} gap={30} />
      <Cheeks cx={60} y={hy + 12} gap={64} />
      <path d={`M54 ${hy + 6}l6 ${mood === "happy" ? 12 : 10}l6 -${mood === "happy" ? 12 : 10}z`} fill={BEAK} />
      {mood === "hungry" && <ellipse cx="60" cy={hy + 18} rx="2.6" ry="3.2" fill={DARK} />}
      {mood === "sleepy" && <Zzz x={98} y={hy - 16} />}
    </g>
  );
}
