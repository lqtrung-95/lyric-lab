import type { ReactNode } from "react";

const INK = "#2b2b3a";
const WOOD = "#b9772f";
const WOOD_DARK = "#8f5a22";
const RED = "#e5484d";
const GOLD = "#ffc800";
const GOLD_DARK = "#e0a800";
const GREEN = "#58cc02";
const GREEN_DARK = "#3f9a00";
const BLUE = "#4aa3ff";
const CREAM = "#fff6e0";

/** Hình đồ trang trí trong "nhà" của pet: mỗi món vẽ trong ô 64×64, phẳng, không viền, cùng bảng màu với linh vật. Chỉ để ngắm (aria-hidden ở nơi dùng). */
const ART: Record<string, ReactNode> = {
  window: (
    <g>
      <rect x="8" y="6" width="48" height="52" rx="6" fill={WOOD} />
      <rect x="13" y="11" width="38" height="42" rx="3" fill="#27315a" />
      <path d="M36 20a9 9 0 1 0 6 14a7 7 0 0 1 -6 -14z" fill={GOLD} />
      <circle cx="21" cy="22" r="1.6" fill={CREAM} /><circle cx="24" cy="42" r="1.3" fill={CREAM} /><circle cx="44" cy="46" r="1.6" fill={CREAM} />
      <rect x="30.5" y="11" width="3" height="42" fill={WOOD} /><rect x="13" y="30" width="38" height="3" fill={WOOD} />
    </g>
  ),
  fuposter: (
    <g>
      <rect x="10" y="4" width="44" height="56" rx="3" fill={RED} />
      <rect x="14" y="8" width="36" height="48" rx="2" fill="#c9343a" />
      <rect x="22" y="22" width="20" height="20" rx="2" fill={GOLD} transform="rotate(45 32 32)" />
      <text x="32" y="38" textAnchor="middle" fontSize="17" fontWeight="800" fill="#7a1319" fontFamily="serif">福</text>
      <circle cx="32" cy="4" r="2" fill={GOLD_DARK} />
    </g>
  ),
  shelf: (
    <g>
      <rect x="6" y="8" width="52" height="48" rx="3" fill={WOOD_DARK} />
      <rect x="9" y="11" width="46" height="20" fill="#5b3b16" /><rect x="9" y="34" width="46" height="19" fill="#5b3b16" />
      <rect x="12" y="14" width="6" height="17" fill={RED} /><rect x="19" y="17" width="5" height="14" fill={BLUE} /><rect x="25" y="13" width="7" height="18" fill={GREEN} />
      <rect x="34" y="16" width="5" height="15" fill={GOLD} /><rect x="40" y="14" width="8" height="17" fill="#8e6fe0" />
      <rect x="12" y="38" width="9" height="15" fill={GOLD_DARK} /><rect x="22" y="41" width="6" height="12" fill={RED} /><rect x="30" y="37" width="7" height="16" fill={BLUE} />
    </g>
  ),
  medalframe: (
    <g>
      <rect x="8" y="8" width="48" height="48" rx="4" fill={GOLD_DARK} />
      <rect x="13" y="13" width="38" height="38" rx="2" fill={CREAM} />
      <path d="M26 16l6 11l6 -11z" fill={RED} />
      <circle cx="32" cy="36" r="10" fill={GOLD} /><circle cx="32" cy="36" r="6" fill={GOLD_DARK} />
      <path d="M32 31l1.7 3.4l3.7 .5l-2.7 2.6l.7 3.7l-3.4 -1.8l-3.4 1.8l.7 -3.7l-2.7 -2.6l3.7 -.5z" fill={CREAM} />
    </g>
  ),
  lanternwall: (
    <g>
      <rect x="31" y="2" width="2" height="9" fill={INK} />
      <rect x="25" y="10" width="14" height="5" rx="2" fill={GOLD_DARK} />
      <ellipse cx="32" cy="32" rx="19" ry="17" fill={RED} />
      <ellipse cx="32" cy="32" rx="9" ry="17" fill="#c9343a" />
      <rect x="25" y="47" width="14" height="5" rx="2" fill={GOLD_DARK} />
      <path d="M30 52h4v9h-4z" fill={GOLD} /><path d="M26 61h12l-2 -3h-8z" fill={GOLD} />
      <text x="32" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill={GOLD} fontFamily="serif">春</text>
    </g>
  ),
  bed: (
    <g>
      <ellipse cx="32" cy="52" rx="29" ry="8" fill="#3a2b2b" opacity="0.14" />
      <ellipse cx="32" cy="44" rx="28" ry="14" fill="#c98a4b" />
      <ellipse cx="32" cy="42" rx="21" ry="9" fill="#f6d6a8" />
      <path d="M14 38q18 -8 36 0q-18 6 -36 0z" fill="#fff0d6" />
    </g>
  ),
  rug: (
    <g>
      <ellipse cx="32" cy="46" rx="29" ry="11" fill="#c9343a" />
      <ellipse cx="32" cy="46" rx="22" ry="8" fill="#ffd9a0" />
      <ellipse cx="32" cy="46" rx="14" ry="5" fill={BLUE} />
      <ellipse cx="32" cy="46" rx="6" ry="2.2" fill={GOLD} />
    </g>
  ),
  plant: (
    <g>
      <ellipse cx="32" cy="58" rx="16" ry="3.5" fill="#3a2b2b" opacity="0.14" />
      <path d="M32 40C20 34 16 20 22 10c8 6 12 16 10 30z" fill={GREEN} />
      <path d="M32 40C44 32 48 20 42 8c-8 6 -12 18 -10 32z" fill={GREEN_DARK} />
      <path d="M32 42C28 30 30 18 32 6c4 12 4 24 0 36z" fill="#7be22b" />
      <path d="M20 42h24l-3 16h-18z" fill="#d9683c" /><rect x="18" y="39" width="28" height="6" rx="2" fill="#e8814f" />
    </g>
  ),
  toybox: (
    <g>
      <ellipse cx="32" cy="58" rx="22" ry="3.5" fill="#3a2b2b" opacity="0.14" />
      <rect x="10" y="30" width="44" height="26" rx="3" fill={BLUE} />
      <rect x="8" y="24" width="48" height="9" rx="3" fill="#2f86dc" />
      <rect x="28" y="30" width="8" height="12" fill={GOLD} />
      <circle cx="22" cy="18" r="6" fill={RED} /><rect x="36" y="9" width="10" height="10" rx="2" fill={GREEN} transform="rotate(14 41 14)" />
    </g>
  ),
  kumquat: (
    <g>
      <ellipse cx="32" cy="59" rx="16" ry="3" fill="#3a2b2b" opacity="0.14" />
      <rect x="30" y="30" width="4" height="16" fill={WOOD_DARK} />
      <circle cx="32" cy="22" r="17" fill={GREEN} /><circle cx="22" cy="26" r="9" fill={GREEN_DARK} />
      {[[24, 14], [38, 18], [30, 28], [42, 30], [20, 28], [34, 10]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.6" fill="#ff9a1f" />)}
      <path d="M18 46h28l-3 13h-22z" fill={RED} /><rect x="16" y="43" width="32" height="5" rx="2" fill="#c9343a" />
    </g>
  ),
  telescope: (
    <g>
      <ellipse cx="32" cy="60" rx="18" ry="3" fill="#3a2b2b" opacity="0.14" />
      <path d="M32 36l-12 24h4l8 -16l8 16h4z" fill={WOOD_DARK} />
      <g transform="rotate(-28 32 30)">
        <rect x="10" y="22" width="34" height="13" rx="4" fill={BLUE} /><rect x="42" y="24" width="10" height="9" rx="2" fill="#2f86dc" />
        <rect x="14" y="22" width="4" height="13" fill={GOLD} /><rect x="6" y="24" width="6" height="9" rx="2" fill={INK} />
      </g>
    </g>
  ),
  trophy: (
    <g>
      <ellipse cx="32" cy="60" rx="18" ry="3" fill="#3a2b2b" opacity="0.14" />
      <path d="M16 10h32v14a16 16 0 0 1 -32 0z" fill={GOLD} />
      <path d="M16 14H8q0 14 10 16M48 14h8q0 14 -10 16" fill="none" stroke={GOLD_DARK} strokeWidth="4" />
      <rect x="28" y="38" width="8" height="10" fill={GOLD_DARK} />
      <rect x="18" y="48" width="28" height="10" rx="2" fill={WOOD_DARK} /><rect x="22" y="51" width="20" height="4" fill={GOLD} />
      <path d="M32 15l2.4 4.8l5.3 .8l-3.8 3.7l.9 5.3l-4.8 -2.5l-4.8 2.5l.9 -5.3l-3.8 -3.7l5.3 -.8z" fill={CREAM} />
    </g>
  ),
  bowl: (
    <g>
      <ellipse cx="32" cy="56" rx="20" ry="4" fill="#3a2b2b" opacity="0.14" />
      <path d="M10 34h44q-2 20 -22 20t-22 -20z" fill={RED} />
      <ellipse cx="32" cy="34" rx="22" ry="6" fill="#c9343a" />
      <ellipse cx="32" cy="33" rx="17" ry="4" fill="#d9a066" />
      <circle cx="26" cy="32" r="2" fill="#b9772f" /><circle cx="34" cy="33" r="2" fill="#b9772f" /><circle cx="40" cy="31.5" r="1.8" fill="#b9772f" />
    </g>
  ),
  ball: (
    <g>
      <ellipse cx="32" cy="58" rx="16" ry="3" fill="#3a2b2b" opacity="0.14" />
      <circle cx="32" cy="36" r="21" fill={RED} />
      <path d="M12 30q20 12 40 0M14 46q18 -8 36 0" fill="none" stroke={CREAM} strokeWidth="3.5" />
      <circle cx="24" cy="26" r="4" fill="#fff" opacity="0.4" />
    </g>
  ),
  lamp: (
    <g>
      <ellipse cx="32" cy="58" rx="16" ry="3" fill="#3a2b2b" opacity="0.14" />
      <rect x="22" y="52" width="20" height="6" rx="3" fill={WOOD_DARK} /><rect x="30" y="30" width="4" height="23" fill={WOOD_DARK} />
      <path d="M14 32l6 -24h24l6 24z" fill={GOLD} /><path d="M14 32l6 -24h8l-3 24z" fill="#ffe27a" />
      <ellipse cx="32" cy="32" rx="18" ry="3" fill={GOLD_DARK} />
    </g>
  ),
  clock: (
    <g>
      <ellipse cx="32" cy="58" rx="18" ry="3" fill="#3a2b2b" opacity="0.14" />
      <circle cx="32" cy="34" r="23" fill={RED} /><circle cx="32" cy="34" r="18" fill={CREAM} />
      <path d="M32 34V21M32 34l9 5" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="34" r="2.5" fill={INK} />
      <circle cx="16" cy="12" r="6" fill={GOLD} /><circle cx="48" cy="12" r="6" fill={GOLD} />
    </g>
  ),
  globe: (
    <g>
      <ellipse cx="32" cy="60" rx="16" ry="3" fill="#3a2b2b" opacity="0.14" />
      <path d="M20 58h24l-6 -8h-12z" fill={WOOD_DARK} />
      <circle cx="32" cy="30" r="22" fill={BLUE} />
      <path d="M18 24q8 -8 14 -2q-2 8 -10 8zM34 34q10 -4 12 4q-4 8 -12 6z" fill={GREEN} />
      <ellipse cx="32" cy="30" rx="22" ry="22" fill="none" stroke={GOLD_DARK} strokeWidth="2.5" strokeDasharray="0" opacity="0.5" />
    </g>
  ),
  inkset: (
    <g>
      <ellipse cx="32" cy="58" rx="22" ry="3.5" fill="#3a2b2b" opacity="0.14" />
      <path d="M8 44h40l6 12H4z" fill="#3b3b4f" /><ellipse cx="28" cy="44" rx="18" ry="4" fill={INK} />
      <ellipse cx="28" cy="43" rx="13" ry="2.4" fill="#0f0f1a" />
      <g transform="rotate(30 46 28)"><rect x="44" y="4" width="4" height="34" rx="2" fill={WOOD} /><path d="M44 36h4l-2 10z" fill={INK} /></g>
    </g>
  ),
};

export function HomeItemArt({ id, className, box }: { id: string; className?: string; /** Đặt trong một SVG lớn hơn: toạ độ và cạnh. */ box?: { x: number; y: number; s: number } }) {
  return <svg viewBox="0 0 64 64" aria-hidden="true" className={className} {...(box ? { x: box.x, y: box.y, width: box.s, height: box.s } : {})}>{ART[id] ?? null}</svg>;
}
