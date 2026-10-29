import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, Eyes, Mouth, Zzz } from "./pet-face-kit";

const FUR = "#ff8a3d";
const WHITE = "#fff6ea";
const DARKP = "#5a3a2e";

/** Cáo cam: cáo con (tai nhỏ) → thiếu niên (đuôi bông đầu trắng) → trưởng thành (tai dài, ngực trắng). Hình phẳng không viền. */
export function Fox({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const hy = stage === 1 ? 62 : 52;
  const earH = stage === 1 ? 32 : stage === 2 ? 38 : 44;
  return (
    <g>
      {stage >= 2 && <path className="pet-tail" d="M86 100q34 -4 28 -40q-14 14 -30 22z" fill={FUR} />}
      {stage >= 2 && <path d="M108 58q7 7 6 16q-7 -2 -11 -9z" fill={WHITE} />}
      <ellipse cx="60" cy={stage === 1 ? 86 : 88} rx={stage === 1 ? 27 : 29} ry={stage === 1 ? 25 : 24} fill={FUR} />
      <ellipse cx="60" cy={stage === 1 ? 92 : 94} rx="16" ry="14" fill={WHITE} />
      {stage === 3 && <path d="M46 78q14 16 28 0z" fill={WHITE} />}
      <ellipse cx="46" cy="108" rx="10" ry="5.5" fill={DARKP} />
      <ellipse cx="74" cy="108" rx="10" ry="5.5" fill={DARKP} />
      <path d={`M31 ${hy - 10}L29 ${hy - earH + 2}L57 ${hy - 24}z M89 ${hy - 10}L91 ${hy - earH + 2}L63 ${hy - 24}z`} fill={FUR} />
      <path d={`M37 ${hy - 19}L36 ${hy - earH + 12}L49 ${hy - 26}z M83 ${hy - 19}L84 ${hy - earH + 12}L71 ${hy - 26}z`} fill={DARKP} />
      <ellipse cx="60" cy={hy} rx="34" ry="27" fill={FUR} />
      <path d={`M26 ${hy + 4}q12 -4 24 10q-14 10 -24 -10z M94 ${hy + 4}q-12 -4 -24 10q14 10 24 -10z`} fill={WHITE} />
      <ellipse cx="60" cy={hy + 12} rx="14" ry="10" fill={WHITE} />
      <Eyes mood={mood} cx={60} y={hy - 4} r={7.5} gap={30} />
      <ellipse cx="60" cy={hy + 5} rx="4.2" ry="3" fill={DARKP} />
      <Cheeks cx={60} y={hy + 9} gap={62} />
      <Mouth mood={mood} cx={60} y={hy + 11} />
      {mood === "sleepy" && <Zzz x={98} y={hy - 14} />}
    </g>
  );
}
