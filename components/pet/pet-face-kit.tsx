import type { PetMood } from "@/lib/pet/pet-logic";

/** Bộ phận mặt dùng chung cho mọi loài, theo kiểu hình phẳng: không viền, mắt to có chấm sáng, miệng cười tròn. */
export const DARK = "#3a2b2b";
const CHEEK = "#ff8fa3";

/** Mắt: vui = nhìn thẳng, đói = ngước lên đòi ăn, ngủ = nhắm (cung cong). Cặp mắt nằm trong `.pet-eye` để chớp. */
export function Eyes({ mood, cx, y, r = 8, gap = 28 }: { mood: PetMood; cx: number; y: number; r?: number; gap?: number }) {
  const xs = [cx - gap / 2, cx + gap / 2];
  if (mood === "sleepy") {
    return <g>{xs.map((x) => <path key={x} d={`M${x - r * 0.8} ${y}q${r * 0.8} ${r * 0.9} ${r * 1.6} 0`} stroke={DARK} strokeWidth="3" strokeLinecap="round" fill="none" />)}</g>;
  }
  const look = mood === "hungry" ? -1.6 : 0;
  return (
    <g>
      {xs.map((x) => (
        <g key={x} className="pet-eye">
          <ellipse cx={x} cy={y} rx={r} ry={r * 1.1} fill="#fff" />
          <circle cx={x} cy={y + look + 1} r={r * 0.62} fill={DARK} />
          <circle cx={x + r * 0.22} cy={y + look - r * 0.2} r={r * 0.24} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

/** Miệng: vui = cười há có lưỡi, đói = chữ "o" nhỏ, ngủ = nét ngang. */
export function Mouth({ mood, cx, y }: { mood: PetMood; cx: number; y: number }) {
  if (mood === "happy") return <g><path d={`M${cx - 9} ${y}q9 16 18 0z`} fill={DARK} /><ellipse cx={cx} cy={y + 6} rx="5" ry="2.6" fill="#ff7a8a" /></g>;
  if (mood === "hungry") return <ellipse cx={cx} cy={y + 4} rx="4.5" ry="5.5" fill={DARK} />;
  return <path d={`M${cx - 4} ${y + 3}h8`} stroke={DARK} strokeWidth="3" strokeLinecap="round" />;
}

export function Cheeks({ cx, y, gap = 52 }: { cx: number; y: number; gap?: number }) {
  return <g fill={CHEEK} opacity="0.65"><ellipse cx={cx - gap / 2} cy={y} rx="5.5" ry="3.6" /><ellipse cx={cx + gap / 2} cy={y} rx="5.5" ry="3.6" /></g>;
}

/** Hai chữ z bay lên khi pet ngủ. */
export function Zzz({ x, y }: { x: number; y: number }) {
  return <g fill={DARK}><text className="pet-z" x={x} y={y} fontSize="14" fontWeight="800">z</text><text className="pet-z pet-z2" x={x + 8} y={y - 12} fontSize="10" fontWeight="800">z</text></g>;
}
