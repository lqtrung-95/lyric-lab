import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Công viên giải trí
const ferris = s(110, 120, <>
  <circle cx="55" cy="52" r="42" fill="none" strokeWidth={5} />
  <path d="M55 10v84M13 52h84M25 22l60 60M85 22L25 82" fill="none" strokeWidth={3} />
  <circle cx="55" cy="10" r="6" fill={C.red} />
  <circle cx="97" cy="52" r="6" fill={C.yellow} />
  <circle cx="55" cy="94" r="6" fill={C.blue} />
  <circle cx="13" cy="52" r="6" fill={C.green} />
  <path d="M55 52L34 116M55 52l21 64" fill="none" strokeWidth={5} />
</>);
const carousel = s(100, 100, <>
  <path d="M10 36L50 8l40 28Z" fill={C.red} />
  <rect x="8" y="34" width="84" height="8" rx="3" fill={C.yellow} />
  <path d="M22 42v40M50 42v40M78 42v40" fill="none" strokeWidth={5} />
  <rect x="6" y="82" width="88" height="12" rx="4" fill={C.woodD} />
  <ellipse cx="36" cy="66" rx="9" ry="7" fill={C.cream} strokeWidth={2.500} />
  <ellipse cx="64" cy="66" rx="9" ry="7" fill={C.pink} strokeWidth={2.500} />
</>);
const rollercoaster = s(130, 90, <>
  <path d="M4 80h122" fill="none" strokeWidth={5} />
  <path d="M6 78Q22 6 42 56T78 20 124 76" fill="none" strokeWidth={8} />
  <path d="M6 78Q22 6 42 56T78 20 124 76" fill="none" stroke={C.red} strokeWidth={4} />
  <path d="M26 40v40M60 42v38M92 36v44" fill="none" strokeWidth={3} />
  <rect x="48" y="38" width="22" height="12" rx="4" fill={C.yellow} strokeWidth={2.500} />
</>);
const balloon = s(60, 100, <>
  <path d="M30 92q6-14-2-26" fill="none" strokeWidth={2.500} />
  <ellipse cx="30" cy="34" rx="22" ry="28" fill={C.red} />
  <path d="M24 60l6 8 6-8Z" fill={C.redD} strokeWidth={2.500} />
  <path d="M16 24q4-12 14-14" fill="none" stroke={C.white} strokeWidth={4} opacity={0.6} />
</>);
const cottoncandy = s(60, 100, <>
  <rect x="26" y="50" width="8" height="46" rx="3" fill={C.cream} />
  <circle cx="30" cy="30" r="24" fill={C.pink} />
  <circle cx="18" cy="38" r="12" fill={C.pink} />
  <circle cx="42" cy="38" r="12" fill={C.pink} />
  <path d="M18 24q6-8 14-6M30 40q6 4 12 0" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const bumpercar = s(100, 70, <>
  <path d="M8 50q0-24 22-24h40q22 0 22 24v10H8Z" fill={C.blue} />
  <rect x="2" y="48" width="96" height="14" rx="7" fill={C.yellow} />
  <path d="M60 26V6M54 6h12" fill="none" strokeWidth={4} />
  <circle cx="40" cy="38" r="8" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="24" cy="64" r="5" fill={INK} stroke="none" />
  <circle cx="76" cy="64" r="5" fill={INK} stroke="none" />
</>);
const tent = s(110, 90, <>
  <path d="M4 82L55 8l51 74Z" fill={C.red} />
  <path d="M55 8L30 82M55 8l25 74" fill="none" stroke={C.cream} strokeWidth={6} />
  <path d="M46 82q9-26 18 0Z" fill={C.redD} />
  <path d="M55 8V0M55 0l12 4-12 4" fill={C.yellow} strokeWidth={2.500} />
</>);
const clown = s(70, 100, <>
  <path d="M10 94l8-36h34l8 36Z" fill={C.yellow} />
  <path d="M26 58l-4 36M44 58l4 36" fill="none" strokeWidth={2.500} />
  <circle cx="35" cy="34" r="22" fill={C.cream} />
  <circle cx="14" cy="22" r="9" fill={C.red} />
  <circle cx="56" cy="22" r="9" fill={C.red} />
  <circle cx="35" cy="36" r="6" fill={C.red} strokeWidth={2.500} />
  <circle cx="27" cy="28" r="2.500" fill={INK} stroke="none" />
  <circle cx="43" cy="28" r="2.500" fill={INK} stroke="none" />
  <path d="M24 46q11 8 22 0" fill="none" stroke={C.red} strokeWidth={3} />
</>);
const dart = s(90, 70, <>
  <path d="M10 56L58 22" fill="none" strokeWidth={5} />
  <path d="M58 22l18-14 4 18Z" fill={C.red} />
  <path d="M4 62l10-10 6 6Z" fill={C.greyD} />
  <circle cx="74" cy="48" r="16" fill={C.white} strokeWidth={2.500} />
  <circle cx="74" cy="48" r="9" fill={C.red} strokeWidth={2.500} />
  <circle cx="74" cy="48" r="3" fill={C.yellow} stroke="none" />
</>);
const prize = s(70, 90, <>
  <path d="M18 8h34v22q0 18-17 18T18 30Z" fill={C.yellow} />
  <path d="M18 14H6q0 16 12 18M52 14h12q0 16-12 18" fill="none" strokeWidth={4} />
  <rect x="30" y="48" width="10" height="16" fill={C.orange} />
  <rect x="18" y="64" width="34" height="14" rx="3" fill={C.woodD} />
  <path d="M26 16q2 8 6 10" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);
const firework = s(100, 100, <>
  <path d="M50 94V54" fill="none" strokeWidth={5} />
  <path d="M50 50V8M50 50L20 20M50 50l30-30M50 50H8M50 50h42M50 50L22 78M50 50l28 28" fill="none" stroke={C.red} strokeWidth={4} />
  <circle cx="50" cy="8" r="4" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="20" cy="20" r="4" fill={C.blue} strokeWidth={2.500} />
  <circle cx="80" cy="20" r="4" fill={C.green} strokeWidth={2.500} />
</>);
const stall = s(110, 100, <>
  <path d="M6 30h98l-8-24H14Z" fill={C.blue} />
  <path d="M6 30q9 12 18 0t18 0 18 0 18 0 18 0" fill={C.white} strokeWidth={3} />
  <rect x="12" y="38" width="86" height="56" rx="4" fill={C.wood} />
  <rect x="6" y="60" width="98" height="10" rx="3" fill={C.woodD} />
  <path d="M18 8v22M92 8v22" fill="none" strokeWidth={3} />
</>);

// ── Nông trại
const tractor = s(120, 90, <>
  <rect x="50" y="22" width="40" height="38" rx="5" fill={C.green} />
  <rect x="6" y="40" width="64" height="24" rx="6" fill={C.green} />
  <rect x="56" y="28" width="26" height="16" rx="3" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="30" cy="66" r="20" fill={INK} />
  <circle cx="30" cy="66" r="9" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="92" cy="72" r="13" fill={INK} />
  <circle cx="92" cy="72" r="5" fill={C.yellow} strokeWidth={2} />
  <path d="M10 40V26" fill="none" strokeWidth={5} />
</>);
const scarecrow = s(80, 110, <>
  <path d="M40 40v66M6 54h68" fill="none" strokeWidth={6} />
  <path d="M26 54l-2 30h32l-2-30Z" fill={C.blue} />
  <circle cx="40" cy="30" r="14" fill={C.woodL} />
  <path d="M20 22h40l-8-16H28Z" fill={C.woodD} />
  <rect x="16" y="20" width="48" height="6" rx="2" fill={C.brown} />
  <circle cx="35" cy="32" r="2" fill={INK} stroke="none" />
  <circle cx="45" cy="32" r="2" fill={INK} stroke="none" />
  <path d="M34 40q6 4 12 0" fill="none" strokeWidth={2.500} />
</>);
const barn = s(120, 100, <>
  <path d="M8 90V40L60 8l52 32v50Z" fill={C.red} />
  <path d="M8 40L60 8l52 32" fill="none" stroke={C.cream} strokeWidth={5} />
  <rect x="38" y="52" width="44" height="38" rx="3" fill={C.cream} />
  <path d="M38 52l44 38M82 52L38 90" fill="none" strokeWidth={3} />
  <circle cx="60" cy="30" r="6" fill={C.cream} strokeWidth={2.500} />
</>);
const hen = s(80, 80, <>
  <ellipse cx="38" cy="50" rx="28" ry="24" fill={C.cream} />
  <path d="M12 44q-8-8-6-18 12 4 14 16Z" fill={C.cream} />
  <circle cx="58" cy="30" r="14" fill={C.cream} />
  <path d="M52 16q4-10 8-2 4-8 8 2" fill={C.red} strokeWidth={2.500} />
  <path d="M70 30l10 4-10 4Z" fill={C.orange} strokeWidth={2.500} />
  <circle cx="62" cy="28" r="2.500" fill={INK} stroke="none" />
  <path d="M30 74v6M46 74v6" fill="none" stroke={C.orange} strokeWidth={4} />
  <path d="M28 46q10 8 22 0" fill="none" strokeWidth={2.500} />
</>);
const cow = s(110, 90, <>
  <rect x="14" y="24" width="72" height="42" rx="14" fill={C.white} />
  <path d="M22 70v16M42 70v16M62 70v16M78 70v16" fill="none" strokeWidth={6} />
  <circle cx="32" cy="38" r="9" fill={INK} />
  <circle cx="64" cy="50" r="8" fill={INK} />
  <rect x="78" y="14" width="26" height="30" rx="10" fill={C.white} />
  <ellipse cx="94" cy="38" rx="10" ry="7" fill={C.pink} strokeWidth={2.500} />
  <path d="M82 12l-4-8M100 12l4-8" fill="none" strokeWidth={4} />
  <circle cx="88" cy="26" r="2.500" fill={INK} stroke="none" />
  <circle cx="100" cy="26" r="2.500" fill={INK} stroke="none" />
</>);
const sheep = s(100, 80, <>
  <circle cx="34" cy="34" r="20" fill={C.white} />
  <circle cx="54" cy="30" r="22" fill={C.white} />
  <circle cx="70" cy="44" r="18" fill={C.white} />
  <circle cx="40" cy="50" r="18" fill={C.white} />
  <ellipse cx="82" cy="38" rx="14" ry="12" fill={C.greyD} />
  <path d="M30 62v14M50 62v14M64 62v14" fill="none" strokeWidth={5} />
  <circle cx="84" cy="34" r="2.500" fill={C.white} stroke="none" />
</>);
const hay = s(100, 80, <>
  <rect x="6" y="14" width="88" height="62" rx="10" fill={C.yellow} />
  <path d="M6 32h88M6 52h88" fill="none" stroke={C.orange} strokeWidth={3} />
  <path d="M30 14v62M70 14v62" fill="none" strokeWidth={3} />
  <path d="M12 8l6 8M44 6l-2 10M80 8l-6 8" fill="none" strokeWidth={3} />
</>);
const fence = s(120, 70, <>
  <path d="M6 26h108M6 48h108" fill="none" strokeWidth={9} />
  <path d="M6 26h108M6 48h108" fill="none" stroke={C.wood} strokeWidth={4.500} />
  <path d="M20 8h14v58H20ZM53 8h14v58H53ZM86 8h14v58H86Z" fill={C.woodL} />
  <path d="M20 8l7-6 7 6M53 8l7-6 7 6M86 8l7-6 7 6" fill={C.woodL} />
</>);
const wheat = s(60, 110, <>
  <path d="M30 104V30" fill="none" strokeWidth={4} />
  <ellipse cx="30" cy="14" rx="6" ry="12" fill={C.yellow} />
  <ellipse cx="18" cy="30" rx="6" ry="12" fill={C.yellow} transform="rotate(-25 18 30)" />
  <ellipse cx="42" cy="30" rx="6" ry="12" fill={C.yellow} transform="rotate(25 42 30)" />
  <ellipse cx="18" cy="52" rx="6" ry="12" fill={C.yellow} transform="rotate(-25 18 52)" />
  <ellipse cx="42" cy="52" rx="6" ry="12" fill={C.yellow} transform="rotate(25 42 52)" />
</>);
const windmill = s(100, 120, <>
  <path d="M30 112L38 46h24l8 66Z" fill={C.cream} />
  <path d="M34 46l16-14 16 14Z" fill={C.red} />
  <path d="M50 38L14 6M50 38l36-32M50 38L14 70M50 38l36 32" fill="none" strokeWidth={7} />
  <path d="M50 38L14 6M50 38l36-32M50 38L14 70M50 38l36 32" fill="none" stroke={C.woodL} strokeWidth={3} />
  <circle cx="50" cy="38" r="6" fill={C.greyD} strokeWidth={2.500} />
  <rect x="44" y="84" width="12" height="28" rx="3" fill={C.woodD} />
</>);
const horse = s(110, 100, <>
  <rect x="14" y="36" width="64" height="34" rx="14" fill={C.woodD} />
  <path d="M26 66v28M44 66v28M62 66v28M74 66v26" fill="none" strokeWidth={6} />
  <path d="M68 38l10-28h20l4 34q-4 14-18 6-8-4-16-12Z" fill={C.woodD} />
  <path d="M70 12q-14 6-16 24" fill="none" stroke={C.brown} strokeWidth={7} />
  <circle cx="94" cy="22" r="2.500" fill={INK} stroke="none" />
  <path d="M14 40q-12 6-8 28" fill="none" stroke={C.brown} strokeWidth={6} />
</>);
const pumpkin = s(90, 76, <>
  <ellipse cx="45" cy="44" rx="40" ry="30" fill={C.orange} />
  <path d="M32 18q-10 26 0 52M58 18q10 26 0 52M45 14v60" fill="none" strokeWidth={3} />
  <rect x="40" y="6" width="10" height="14" rx="3" fill={C.green} />
  <path d="M50 10q10-6 16 2" fill="none" stroke={C.green} strokeWidth={3} />
</>);

export const VENUE5_FUN_FARM_SPRITES: Record<string, FlatSprite> = {
  ferris, carousel, rollercoaster, balloon, cottoncandy, bumpercar, tent, clown, dart, prize, firework, stall,
  tractor, scarecrow, barn, hen, cow, sheep, hay, fence, wheat, windmill, horse, pumpkin,
};
