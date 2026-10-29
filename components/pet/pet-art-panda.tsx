import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, Eyes, Mouth, Zzz } from "./pet-face-kit";

const WHITE = "#ffffff";
const SHADE = "#e3e8f2";
const BLACK = "#3b3d45";
const BAMBOO = "#6fcf5f";
const BAMBOO_DARK = "#49a63f";

/** Gấu trúc: con non (tròn xoe) → thiếu niên (nhánh tre ngắn) → trưởng thành (ôm cây tre cao có lá). Hình phẳng không viền. */
export function Panda({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const headY = stage === 1 ? 62 : 52;
  return (
    <g>
      {stage >= 2 && (
        <g className="pet-bamboo">
          <rect x="95" y={stage === 3 ? 30 : 66} width="7" height={stage === 3 ? 78 : 42} rx="3" fill={BAMBOO} />
          <path d={`M95 ${stage === 3 ? 56 : 82}h7 M95 ${stage === 3 ? 84 : 98}h7`} stroke={BAMBOO_DARK} strokeWidth="3" />
          {stage === 3 && <path d="M102 40q18 -4 20 -17q-15 2 -20 17z M95 53q-16 -2 -20 -15q14 0 20 15z" fill={BAMBOO} />}
        </g>
      )}
      <ellipse cx="60" cy={stage === 1 ? 87 : 89} rx={stage === 1 ? 27 : 29} ry={stage === 1 ? 25 : 24} fill={WHITE} />
      <ellipse cx="60" cy={stage === 1 ? 98 : 100} rx={stage === 1 ? 24 : 26} ry="9" fill={SHADE} />
      <path d={stage === 1 ? "M36 80q-9 12 2 21 M84 80q9 12 -2 21" : "M33 74q-13 17 4 31q11 -6 8 -27z M87 74q13 17 -4 31q-11 -6 -8 -27z"} fill={stage === 1 ? "none" : BLACK} stroke={stage === 1 ? BLACK : "none"} strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="43" cy="107" rx="11" ry="7" fill={BLACK} />
      <ellipse cx="77" cy="107" rx="11" ry="7" fill={BLACK} />
      <circle cx="35" cy={headY - 22} r="11" fill={BLACK} />
      <circle cx="85" cy={headY - 22} r="11" fill={BLACK} />
      <ellipse cx="60" cy={headY} rx="34" ry="29" fill={WHITE} />
      <ellipse cx="60" cy={headY + 22} rx="26" ry="8" fill={SHADE} opacity="0.7" />
      <ellipse cx="44" cy={headY + 1} rx="10" ry="12.5" transform={`rotate(20 44 ${headY + 1})`} fill={BLACK} />
      <ellipse cx="76" cy={headY + 1} rx="10" ry="12.5" transform={`rotate(-20 76 ${headY + 1})`} fill={BLACK} />
      {mood === "sleepy" ? (
        <g stroke={WHITE} strokeWidth="3" strokeLinecap="round" fill="none"><path d={`M39 ${headY + 1}q5 5 10 0`} /><path d={`M71 ${headY + 1}q5 5 10 0`} /></g>
      ) : (
        <Eyes mood={mood} cx={60} y={headY + 1} r={6} gap={32} />
      )}
      <ellipse cx="60" cy={headY + 11} rx="5" ry="3.4" fill={BLACK} />
      <Cheeks cx={60} y={headY + 15} gap={60} />
      <Mouth mood={mood} cx={60} y={headY + 17} />
      {mood === "sleepy" && <Zzz x={99} y={headY - 22} />}
    </g>
  );
}
