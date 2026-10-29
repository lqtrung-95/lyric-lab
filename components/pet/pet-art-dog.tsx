import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, Eyes, Mouth, Zzz } from "./pet-face-kit";

const FUR = "#eaa95c";
const EAR = "#b8763a";
const CREAM = "#fff0d6";
const NOSE = "#3a2b2b";

/** Cún vàng: cún con (tai cụp to) → thiếu niên (vẫy đuôi, đốm mắt) → trưởng thành (ngực trắng, tai to hơn). Hình phẳng không viền. */
export function Dog({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const hy = stage === 1 ? 62 : 52;
  const earRy = stage === 3 ? 25 : 22;
  return (
    <g>
      {stage >= 2 && <path className="pet-tail" d="M88 98q18 -2 14 -26" stroke={FUR} strokeWidth="9" strokeLinecap="round" fill="none" />}
      <ellipse cx="60" cy={stage === 1 ? 86 : 88} rx={stage === 1 ? 27 : 29} ry={stage === 1 ? 25 : 24} fill={FUR} />
      <ellipse cx="60" cy={stage === 1 ? 92 : 94} rx="16" ry="14" fill={CREAM} />
      {stage === 3 && <path d="M48 80q12 14 24 0z" fill={CREAM} />}
      <ellipse cx="46" cy="108" rx="10" ry="5.5" fill={CREAM} />
      <ellipse cx="74" cy="108" rx="10" ry="5.5" fill={CREAM} />
      <ellipse cx="29" cy={hy + 2} rx="12" ry={earRy} transform={`rotate(14 29 ${hy + 2})`} fill={EAR} />
      <ellipse cx="91" cy={hy + 2} rx="12" ry={earRy} transform={`rotate(-14 91 ${hy + 2})`} fill={EAR} />
      <ellipse cx="60" cy={hy} rx="33" ry="28" fill={FUR} />
      {stage >= 2 && <ellipse cx="45" cy={hy - 4} rx="13" ry="12" fill={EAR} opacity="0.9" />}
      <ellipse cx="60" cy={hy + 11} rx="17" ry="12" fill={CREAM} />
      <Eyes mood={mood} cx={60} y={hy - 4} r={8} />
      <ellipse cx="60" cy={hy + 4} rx="6.5" ry="4.5" fill={NOSE} />
      <ellipse cx="58" cy={hy + 2.8} rx="2" ry="1.2" fill="#fff" opacity="0.7" />
      <Cheeks cx={60} y={hy + 10} gap={62} />
      <Mouth mood={mood} cx={60} y={hy + 11} />
      {mood === "sleepy" && <Zzz x={96} y={hy - 14} />}
    </g>
  );
}
