import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

/** Hình mới cho nhóm cảnh 7 (trạm xe buýt, mẫu giáo, ký túc xá, núi, nhà hát kinh kịch). Mọi từ còn lại của các cảnh này dùng lại hình có sẵn qua ALIASES. */
const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });
const STONE = { light: "#b8b2a6", mid: "#9c968b", dark: "#7c766b" } as const;

// ── Trạm xe buýt
const coinbox = s(70, 90, <>
  <rect x="10" y="8" width="50" height="74" rx="8" fill={C.grey} />
  <rect x="10" y="8" width="14" height="74" rx="6" fill={C.greyD} />
  <rect x="26" y="22" width="26" height="8" rx="4" fill={C.woodD} />
  <circle cx="39" cy="50" r="10" fill={C.yellow} /><path d="M39 44v12M35 48h8" fill="none" strokeWidth={2.500} stroke={C.orangeD} />
  <rect x="26" y="68" width="26" height="8" rx="3" fill={C.cream} />
</>);
const handring = s(60, 110, <>
  <rect x="6" y="6" width="48" height="10" rx="5" fill={C.grey} />
  <path d="M30 16v22" fill="none" strokeWidth={4} stroke={C.greyD} />
  <circle cx="30" cy="66" r="24" fill="none" strokeWidth={12} stroke={C.red} />
  <circle cx="30" cy="66" r="24" fill="none" strokeWidth={4} stroke={C.redD} />
</>);
const bus = s(180, 100, <>
  <rect x="8" y="12" width="164" height="68" rx="14" fill={C.green} />
  <rect x="8" y="54" width="164" height="12" fill={C.greenD} />
  <rect x="18" y="22" width="26" height="26" rx="4" fill={C.blueL} /><rect x="50" y="22" width="26" height="26" rx="4" fill={C.blueL} /><rect x="82" y="22" width="26" height="26" rx="4" fill={C.blueL} />
  <rect x="120" y="20" width="22" height="48" rx="3" fill={C.blue} /><path d="M131 22v44" fill="none" strokeWidth={2.500} />
  <rect x="148" y="22" width="18" height="26" rx="4" fill={C.blueL} />
  <rect x="62" y="6" width="50" height="10" rx="4" fill={C.yellow} />
  <circle cx="40" cy="82" r="13" fill={C.greyD} /><circle cx="40" cy="82" r="5" fill={C.cream} />
  <circle cx="138" cy="82" r="13" fill={C.greyD} /><circle cx="138" cy="82" r="5" fill={C.cream} />
  <circle cx="166" cy="62" r="4" fill={C.yellow} strokeWidth={2} />
</>);

// ── Mẫu giáo
const playdough = s(100, 80, <>
  <ellipse cx="50" cy="66" rx="44" ry="10" fill={C.woodL} />
  <path d="M10 60q-2-30 22-30q20 0 18 30Z" fill={C.red} />
  <path d="M42 60q-2-40 22-40q22 0 20 40Z" fill={C.yellow} />
  <path d="M68 62q0-24 16-24q14 0 14 24Z" fill={C.blue} />
  <circle cx="26" cy="46" r="3" fill={C.white} strokeWidth={1.500} /><circle cx="58" cy="40" r="3" fill={C.white} strokeWidth={1.500} />
</>);
const seesaw = s(150, 80, <>
  <path d="M60 70l15-30 15 30Z" fill={C.grey} />
  <rect x="14" y="30" width="122" height="10" rx="5" fill={C.red} transform="rotate(-9 75 35)" />
  <rect x="14" y="14" width="22" height="14" rx="4" fill={C.yellow} transform="rotate(-9 75 35)" />
  <rect x="114" y="14" width="22" height="14" rx="4" fill={C.yellow} transform="rotate(-9 75 35)" />
  <ellipse cx="75" cy="72" rx="46" ry="5" fill={C.greyD} opacity={0.35} stroke="none" />
</>);

// ── Ký túc xá
const mosquitonet = s(120, 130, <>
  <path d="M60 8L10 110h100Z" fill={C.white} opacity={0.85} />
  <path d="M60 8L36 110M60 8l24 102M60 8v102" fill="none" strokeWidth={2} stroke={C.grey} />
  <circle cx="60" cy="8" r="6" fill={C.red} />
  <path d="M6 112h108" fill="none" strokeWidth={5} stroke={C.woodD} />
  <path d="M26 56q34 14 68 0" fill="none" strokeWidth={2} stroke={C.grey} />
</>);
const bunkbed = s(140, 140, <>
  <rect x="10" y="8" width="8" height="126" fill={C.woodD} /><rect x="122" y="8" width="8" height="126" fill={C.woodD} />
  <rect x="10" y="40" width="120" height="14" rx="4" fill={C.wood} />
  <rect x="14" y="26" width="112" height="16" rx="6" fill={C.blueL} />
  <rect x="14" y="20" width="30" height="10" rx="5" fill={C.white} />
  <rect x="10" y="100" width="120" height="14" rx="4" fill={C.wood} />
  <rect x="14" y="86" width="112" height="16" rx="6" fill={C.pink} />
  <rect x="14" y="80" width="30" height="10" rx="5" fill={C.white} />
  <path d="M104 40v60M112 40v60" fill="none" strokeWidth={3} stroke={C.greyD} />
  <path d="M104 52h8M104 66h8M104 80h8M104 94h8" fill="none" strokeWidth={3} stroke={C.greyD} />
</>);

// ── Núi
const boulder = s(100, 70, <>
  <path d="M6 62q-2-28 20-38q10-14 30-10q22 2 32 22q10 16 6 26Z" fill={STONE.mid} />
  <path d="M26 24q10-12 30-10q-14 6-22 20Z" fill={STONE.light} stroke="none" />
  <path d="M60 36q10 6 12 22M30 46l10 14" fill="none" strokeWidth={2.500} stroke={STONE.dark} />
  <path d="M12 56q16-6 24 4q-12 4-24-4Z" fill={C.green} />
</>);
const cablecar = s(150, 120, <>
  <path d="M0 18L150 4" fill="none" strokeWidth={4} stroke={C.greyD} />
  <path d="M75 11v26" fill="none" strokeWidth={4} stroke={C.greyD} />
  <rect x="52" y="34" width="46" height="8" rx="3" fill={C.greyD} />
  <rect x="38" y="42" width="74" height="62" rx="12" fill={C.red} />
  <rect x="38" y="42" width="74" height="14" rx="8" fill={C.redD} />
  <rect x="46" y="60" width="26" height="30" rx="4" fill={C.blueL} /><rect x="78" y="60" width="26" height="30" rx="4" fill={C.blueL} />
  <path d="M38 94h74" fill="none" strokeWidth={3} stroke={C.redD} />
</>);
const waterfall = s(120, 150, <>
  <path d="M6 10h108v118H6Z" fill={STONE.mid} />
  <path d="M6 10h30v118H6Z" fill={STONE.dark} stroke="none" />
  <path d="M38 14h44v104H38Z" fill={C.blueL} />
  <path d="M48 20v90M60 18v96M72 20v88" fill="none" strokeWidth={4} stroke={C.white} />
  <ellipse cx="60" cy="132" rx="52" ry="14" fill={C.blue} />
  <ellipse cx="60" cy="130" rx="30" ry="7" fill={C.white} opacity={0.8} stroke="none" />
  <path d="M96 10l8-10 6 10M12 10l6-8 6 8" fill={C.green} />
</>);

// ── Kinh kịch
const operamask = s(80, 90, <>
  <path d="M40 6q32 0 34 34q0 40-34 46Q6 80 6 40Q8 6 40 6Z" fill={C.red} />
  <path d="M40 10v26" fill="none" strokeWidth={4} stroke={C.yellow} />
  <path d="M14 34q14-14 24-2q-10 10-24 2ZM66 34q-14-14-24-2q10 10 24 2Z" fill={C.white} />
  <circle cx="28" cy="34" r="3.500" fill={C.greyD} strokeWidth={1.500} /><circle cx="52" cy="34" r="3.500" fill={C.greyD} strokeWidth={1.500} />
  <path d="M26 62q14 12 28 0" fill="none" strokeWidth={4} stroke={C.redD} />
  <path d="M14 50q10 6 14 0M66 50q-10 6-14 0" fill="none" strokeWidth={3} stroke={C.yellow} />
</>);
const gong = s(90, 110, <>
  <path d="M8 104L22 20M82 104L68 20" fill="none" strokeWidth={6} stroke={C.woodD} />
  <rect x="14" y="14" width="62" height="8" rx="4" fill={C.wood} />
  <circle cx="45" cy="56" r="30" fill={C.yellow} />
  <circle cx="45" cy="56" r="20" fill={C.orange} />
  <circle cx="45" cy="56" r="8" fill={C.yellow} />
  <path d="M45 22v4" fill="none" strokeWidth={3} />
  <path d="M74 84l12 16" fill="none" strokeWidth={5} stroke={C.brown} /><circle cx="72" cy="80" r="6" fill={C.red} />
</>);
const drum = s(100, 90, <>
  <path d="M14 82L28 56M86 82L72 56" fill="none" strokeWidth={6} stroke={C.woodD} />
  <rect x="12" y="20" width="76" height="40" rx="8" fill={C.red} />
  <ellipse cx="50" cy="20" rx="38" ry="10" fill={C.cream} />
  <path d="M12 36h76M12 48h76" fill="none" strokeWidth={3} stroke={C.yellow} />
  {[20, 34, 48, 62, 76].map((x) => <circle key={x} cx={x} cy="42" r="2.500" fill={C.yellow} strokeWidth={1.500} />)}
  <path d="M60 4l22 12M74 2l-12 14" fill="none" strokeWidth={4} stroke={C.brown} />
</>);
const stage = s(220, 140, <>
  <path d="M10 28l100-24 100 24Z" fill={C.redD} />
  <path d="M18 28h184v10H18Z" fill={C.yellow} />
  <rect x="24" y="38" width="10" height="72" fill={C.woodD} /><rect x="186" y="38" width="10" height="72" fill={C.woodD} />
  <rect x="34" y="38" width="152" height="72" fill="#6b2230" />
  <path d="M34 38q10 34 0 72M186 38q-10 34 0 72" fill="none" strokeWidth={3} stroke={C.red} />
  <rect x="34" y="38" width="30" height="72" fill={C.red} /><rect x="156" y="38" width="30" height="72" fill={C.red} />
  <circle cx="110" cy="62" r="14" fill={C.yellow} /><text x="110" y="68" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.redD} stroke="none">戏</text>
  <rect x="14" y="110" width="192" height="22" rx="4" fill={C.wood} />
  <rect x="14" y="110" width="192" height="8" rx="3" fill={C.woodL} />
  <circle cx="38" cy="44" r="8" fill={C.red} /><circle cx="182" cy="44" r="8" fill={C.red} />
</>);

export const VENUE16_SPRITES: Record<string, FlatSprite> = {
  coinbox, handring, bus, playdough, seesaw, mosquitonet, bunkbed, boulder, cablecar, waterfall, operamask, gong, drum, stage,
};
