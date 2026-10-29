import type { PetMood, PetStage } from "@/lib/pet/pet-logic";
import { Cheeks, Eyes, Mouth, Zzz } from "./pet-face-kit";

const FUR = "#fffaf5";
const SHADE = "#efe2dc";
const PINK = "#ffb3c1";

/** Thỏ trắng: thỏ con (tai ngắn) → thiếu niên (tai dài, đuôi bông) → trưởng thành (tai dài nhất, ngực xù). Hình phẳng không viền. */
export function Rabbit({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const hy = stage === 1 ? 62 : 52;
  const earRy = stage === 1 ? 17 : stage === 2 ? 21 : 25;
  return (
    <g>
      {stage >= 2 && <circle className="pet-tail" cx="90" cy="100" r="8" fill={FUR} />}
      <ellipse cx="60" cy={stage === 1 ? 88 : 90} rx={stage === 1 ? 27 : 29} ry={stage === 1 ? 24 : 23} fill={SHADE} />
      <ellipse cx="60" cy={stage === 1 ? 86 : 88} rx={stage === 1 ? 27 : 29} ry={stage === 1 ? 24 : 23} fill={FUR} />
      <ellipse cx="60" cy={stage === 1 ? 92 : 94} rx="15" ry="12" fill="#ffe9ee" />
      <ellipse cx="46" cy="108" rx="10" ry="5.5" fill={FUR} />
      <ellipse cx="74" cy="108" rx="10" ry="5.5" fill={FUR} />
      <ellipse cx="43" cy={hy - 28 - earRy / 2} rx="8.5" ry={earRy} transform={`rotate(-8 43 ${hy - 28})`} fill={FUR} />
      <ellipse cx="77" cy={hy - 28 - earRy / 2} rx="8.5" ry={earRy} transform={`rotate(8 77 ${hy - 28})`} fill={FUR} />
      <ellipse cx="43" cy={hy - 27 - earRy / 2} rx="4.5" ry={earRy - 6} transform={`rotate(-8 43 ${hy - 28})`} fill={PINK} />
      <ellipse cx="77" cy={hy - 27 - earRy / 2} rx="4.5" ry={earRy - 6} transform={`rotate(8 77 ${hy - 28})`} fill={PINK} />
      <ellipse cx="60" cy={hy} rx="33" ry="28" fill={FUR} />
      {stage === 3 && <path d="M50 78q10 12 20 0z" fill={FUR} />}
      <Eyes mood={mood} cx={60} y={hy - 4} r={8} />
      <Cheeks cx={60} y={hy + 9} gap={58} />
      <path d={`M56 ${hy + 5}h8l-4 5z`} fill={PINK} />
      <Mouth mood={mood} cx={60} y={hy + 12} />
      {mood === "sleepy" && <Zzz x={98} y={hy - 14} />}
    </g>
  );
}
