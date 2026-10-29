import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, Eyes, Mouth, Zzz } from "./pet-face-kit";

const FUR = "#ffa24a";
const STRIPE = "#e8821f";
const CREAM = "#fff1dc";
const PINK = "#ff9fb0";

/** Mèo cam: mèo con (đầu to, tai nhỏ) → thiếu niên (đuôi vẫy, vằn trán) → trưởng thành (vằn thân, đuôi dài đầu trắng). Hình phẳng không viền. */
export function Cat({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const hy = stage === 1 ? 62 : 52;
  const earH = stage === 1 ? 32 : 38;
  return (
    <g>
      {stage >= 2 && <path className="pet-tail" d={stage === 3 ? "M86 98q34 -4 26 -40" : "M86 98q26 -2 22 -28"} stroke={FUR} strokeWidth="10" strokeLinecap="round" fill="none" />}
      {stage === 3 && <circle cx="112" cy="58" r="5.5" fill={CREAM} />}
      <ellipse cx="60" cy={stage === 1 ? 86 : 88} rx={stage === 1 ? 27 : 29} ry={stage === 1 ? 25 : 24} fill={FUR} />
      <ellipse cx="60" cy={stage === 1 ? 92 : 94} rx="16" ry="14" fill={CREAM} />
      {stage === 3 && <path d="M34 82q6 2 8 8 M32 94q6 0 9 5 M86 82q-6 2 -8 8 M88 94q-6 0 -9 5" stroke={STRIPE} strokeWidth="4" strokeLinecap="round" fill="none" />}
      <ellipse cx="46" cy="108" rx="10" ry="5.5" fill={CREAM} />
      <ellipse cx="74" cy="108" rx="10" ry="5.5" fill={CREAM} />
      <path d={`M32 ${hy - 10}L33 ${hy - earH + 2}L57 ${hy - 24}z M88 ${hy - 10}L87 ${hy - earH + 2}L63 ${hy - 24}z`} fill={FUR} />
      <path d={`M38 ${hy - 17}l0 -${earH - 20}l12 8z M82 ${hy - 17}l0 -${earH - 20}l-12 8z`} fill={PINK} />
      <ellipse cx="60" cy={hy} rx="34" ry="28" fill={FUR} />
      {stage >= 2 && <path d={`M54 ${hy - 26}v8 M60 ${hy - 28}v10 M66 ${hy - 26}v8`} stroke={STRIPE} strokeWidth="3.5" strokeLinecap="round" />}
      <ellipse cx="60" cy={hy + 12} rx="15" ry="10" fill={CREAM} />
      <Eyes mood={mood} cx={60} y={hy - 4} r={8} />
      <Cheeks cx={60} y={hy + 9} gap={58} />
      <path d={`M56 ${hy + 6}h8l-4 5z`} fill={PINK} />
      <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9"><path d={`M30 ${hy + 8}h10 M31 ${hy + 13}l9 -2 M90 ${hy + 8}h-10 M89 ${hy + 13}l-9 -2`} /></g>
      <Mouth mood={mood} cx={60} y={hy + 13} />
      {mood === "sleepy" && <Zzz x={96} y={hy - 12} />}
    </g>
  );
}
