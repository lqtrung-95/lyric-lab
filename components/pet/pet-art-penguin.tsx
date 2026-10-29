import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, DARK, Eyes, Zzz } from "./pet-face-kit";

const NAVY = "#3d4a7a";
const WHITE = "#ffffff";
const BEAK = "#ffb347";
const GOLD = "#ffd36e";

/** Chim cánh cụt: con non (tròn, cánh ngắn) → thiếu niên (cánh dang) → trưởng thành (má vàng như cánh cụt hoàng đế). Hình phẳng không viền. */
export function Penguin({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const hy = stage === 1 ? 62 : 52;
  return (
    <g>
      <ellipse cx="60" cy={stage === 1 ? 86 : 88} rx={stage === 1 ? 28 : 30} ry={stage === 1 ? 25 : 24} fill={NAVY} />
      <ellipse cx="60" cy={stage === 1 ? 92 : 94} rx="19" ry={stage === 1 ? 16 : 15} fill={WHITE} />
      {stage === 1 ? (
        <><ellipse cx="32" cy="90" rx="7" ry="13" transform="rotate(12 32 90)" fill={NAVY} /><ellipse cx="88" cy="90" rx="7" ry="13" transform="rotate(-12 88 90)" fill={NAVY} /></>
      ) : (
        <path d="M33 76q-16 16 -4 31q10 -6 8 -29z M87 76q16 16 4 31q-10 -6 -8 -29z" fill={NAVY} />
      )}
      <ellipse cx="46" cy="109" rx="10" ry="4.5" fill={BEAK} />
      <ellipse cx="74" cy="109" rx="10" ry="4.5" fill={BEAK} />
      <ellipse cx="60" cy={hy} rx="33" ry="28" fill={NAVY} />
      <ellipse cx="45" cy={hy + 1} rx="15" ry="16" fill={WHITE} />
      <ellipse cx="75" cy={hy + 1} rx="15" ry="16" fill={WHITE} />
      <ellipse cx="60" cy={hy + 10} rx="14" ry="10" fill={WHITE} />
      {stage === 3 && <path d={`M40 ${hy + 24}q20 8 40 0q-20 4 -40 0z`} fill={GOLD} />}
      <Eyes mood={mood} cx={60} y={hy - 2} r={8} gap={30} />
      <Cheeks cx={60} y={hy + 10} gap={64} />
      <path d={`M54 ${hy + 6}l6 ${mood === "happy" ? 11 : 9}l6 -${mood === "happy" ? 11 : 9}z`} fill={BEAK} />
      {mood === "hungry" && <ellipse cx="60" cy={hy + 17} rx="2.4" ry="3" fill={DARK} />}
      {mood === "sleepy" && <Zzz x={98} y={hy - 14} />}
    </g>
  );
}
