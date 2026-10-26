import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ riêng của Sân vận động, Tiệm bánh, Nhà bếp và Bảo tàng.
const whistle = s(60, 40, <>
  <path d="M18 6a16 16 0 1 0 0 28h30q8 0 8-8v-8q0-12-12-12Z" fill={C.grey} />
  <circle cx="18" cy="22" r="8" fill={C.greyD} />
  <rect x="34" y="12" width="12" height="6" rx="2" fill={C.cream} strokeWidth={2} />
  <path d="M52 8q6-4 6 2" fill="none" strokeWidth={2.5} />
</>);
const racket = s(54, 100, <>
  <ellipse cx="27" cy="30" rx="22" ry="26" fill={C.greenL} />
  <path d="M11 22h32M10 34h34M16 12v36M27 6v48M38 12v36" fill="none" strokeWidth={1.800} />
  <path d="M27 56v34" fill="none" strokeWidth={9} />
  <path d="M27 56v34" fill="none" stroke={C.brown} strokeWidth={5} />
  <ellipse cx="27" cy="30" rx="22" ry="26" fill="none" stroke={C.red} />
</>);
const medal = s(50, 76, <>
  <path d="M10 4h12l6 22M40 4H28l-6 22" fill="none" strokeWidth={0} />
  <path d="M10 4l10 24h10L40 4Z" fill={C.red} />
  <circle cx="25" cy="50" r="18" fill={C.yellow} />
  <circle cx="25" cy="50" r="11" fill={C.orange} strokeWidth={2.5} />
  <path d="M25 42l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill={C.cream} strokeWidth={1.800} />
</>);
const stopwatch = s(56, 70, <>
  <rect x="22" y="2" width="12" height="9" rx="3" fill={C.greyD} />
  <circle cx="28" cy="40" r="25" fill={C.white} />
  <circle cx="28" cy="40" r="25" fill="none" stroke={C.blue} strokeWidth={5} />
  <path d="M28 40V24M28 40l10 6" fill="none" strokeWidth={3.500} />
  <path d="M44 14l5-5" fill="none" strokeWidth={4} />
</>);
const croissant = s(80, 46, <>
  <path d="M6 34q0-26 34-28 34 2 34 28-8-8-18-6-8-8-16-8t-16 8q-10-2-18 6Z" fill={C.orange} />
  <path d="M24 10q-4 14-2 22M40 6v26M56 10q4 14 2 22" fill="none" strokeWidth={2.500} />
  <ellipse cx="34" cy="14" rx="10" ry="3" fill={C.yellow} stroke="none" opacity={0.7} />
  <circle cx="24" cy="16" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const cookie = s(54, 54, <>
  <circle cx="27" cy="27" r="22" fill={C.wood} />
  <circle cx="19" cy="20" r="4" fill={C.brown} strokeWidth={2} />
  <circle cx="34" cy="24" r="4" fill={C.brown} strokeWidth={2} />
  <circle cx="24" cy="35" r="4" fill={C.brown} strokeWidth={2} />
  <circle cx="37" cy="38" r="3" fill={C.brown} strokeWidth={2} />
</>);
const donut = s(60, 50, <>
  <ellipse cx="30" cy="26" rx="26" ry="20" fill={C.wood} />
  <ellipse cx="30" cy="22" rx="26" ry="18" fill={C.pink} />
  <ellipse cx="30" cy="22" rx="8" ry="6" fill={C.cream} strokeWidth={2.500} />
  <path d="M14 14l4 3M42 12l-3 4M44 28l-4-1M18 30l4-2" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const oven = s(84, 80, <>
  <rect x="4" y="6" width="76" height="70" rx="8" fill={C.greyD} />
  <rect x="12" y="26" width="60" height="42" rx="5" fill={C.cream} strokeWidth={2.500} />
  <rect x="18" y="32" width="48" height="30" rx="3" fill={C.orange} strokeWidth={2.500} />
  <circle cx="20" cy="15" r="4" fill={C.red} strokeWidth={2.500} />
  <circle cx="34" cy="15" r="4" fill={C.yellow} strokeWidth={2.500} />
</>);
const apron = s(64, 84, <>
  <path d="M20 4h24l-4 22h-16Z" fill={C.pink} />
  <path d="M12 26h40l8 54H4Z" fill={C.pink} />
  <rect x="20" y="46" width="24" height="18" rx="4" fill={C.white} strokeWidth={2.500} />
  <path d="M12 26l-6-4M52 26l6-4" fill="none" strokeWidth={3} />
</>);
const candle = s(30, 70, <>
  <ellipse cx="15" cy="9" rx="5" ry="7" fill={C.yellow} strokeWidth={2.500} />
  <path d="M15 14v8" fill="none" strokeWidth={2.500} />
  <rect x="6" y="22" width="18" height="44" rx="4" fill={C.pink} />
  <path d="M6 36q9 6 18 0" fill="none" strokeWidth={2.500} />
</>);
const knife = s(80, 36, <>
  <path d="M4 22Q4 6 38 6l36 12-4 8-66 2Z" fill={C.grey} />
  <rect x="58" y="14" width="20" height="14" rx="4" fill={C.brown} />
  <path d="M10 18q14-8 34-6" fill="none" stroke={C.white} strokeWidth={2.500} />
  <circle cx="24" cy="13" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const cuttingboard = s(80, 46, <>
  <rect x="4" y="8" width="72" height="32" rx="9" fill={C.woodL} />
  <circle cx="64" cy="24" r="4" fill={C.brown} strokeWidth={2.500} />
  <path d="M14 18h30M14 28h24" fill="none" stroke={C.wood} strokeWidth={2.500} />
  <rect x="22" y="14" width="22" height="8" rx="4" fill={C.green} strokeWidth={2.500} />
</>);
const stove = s(90, 70, <>
  <rect x="4" y="22" width="82" height="44" rx="8" fill={C.grey} />
  <rect x="12" y="32" width="66" height="26" rx="4" fill={C.greyD} strokeWidth={2.500} />
  <ellipse cx="28" cy="16" rx="16" ry="6" fill={C.greyD} />
  <ellipse cx="62" cy="16" rx="16" ry="6" fill={C.greyD} />
  <path d="M60 8q3-6 0-8M64 8q-3-6 0-8" fill="none" stroke={C.orange} strokeWidth={3} />
</>);
const kettle = s(70, 64, <>
  <path d="M52 22q16 4 12 20" fill="none" strokeWidth={5} />
  <path d="M12 54q-4-28 18-32 22 4 18 32Z" fill={C.blue} />
  <path d="M10 20q20-10 40 0" fill="none" strokeWidth={4} />
  <rect x="22" y="14" width="16" height="9" rx="4" fill={C.greyD} strokeWidth={2.500} />
  <path d="M10 56h40" fill="none" strokeWidth={5} />
</>);
const sink = s(90, 66, <>
  <rect x="6" y="28" width="78" height="34" rx="8" fill={C.grey} />
  <rect x="14" y="34" width="62" height="20" rx="8" fill={C.blueL} strokeWidth={2.500} />
  <path d="M45 28V14q0-8 12-8h8" fill="none" strokeWidth={5} />
  <path d="M65 12v6" fill="none" stroke={C.blue} strokeWidth={3} />
</>);
const saltjar = s(40, 60, <>
  <rect x="8" y="4" width="24" height="12" rx="4" fill={C.greyD} />
  <path d="M8 16h24v38q0 6-6 6H14q-6 0-6-6Z" fill={C.blueL} />
  <rect x="11" y="28" width="18" height="16" rx="3" fill={C.white} strokeWidth={2.500} />
  <path d="M16 36h8" fill="none" strokeWidth={2.500} />
</>);
const ricecooker = s(76, 70, <>
  <path d="M8 60V30q0-22 30-22t30 22v30Z" fill={C.white} />
  <rect x="4" y="52" width="68" height="14" rx="5" fill={C.greyD} />
  <rect x="30" y="2" width="16" height="9" rx="4" fill={C.grey} strokeWidth={2.500} />
  <circle cx="38" cy="36" r="6" fill={C.red} strokeWidth={2.500} />
</>);
const fossil = s(80, 60, <>
  <ellipse cx="40" cy="32" rx="34" ry="24" fill={C.woodL} />
  <path d="M20 32h40M26 22l6 20M40 20l2 24M54 22l-4 20" fill="none" strokeWidth={3} />
  <circle cx="18" cy="30" r="5" fill={C.cream} strokeWidth={2.500} />
  <circle cx="24" cy="21" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const scroll = s(90, 56, <>
  <rect x="4" y="6" width="12" height="44" rx="6" fill={C.wood} />
  <rect x="74" y="6" width="12" height="44" rx="6" fill={C.wood} />
  <rect x="14" y="10" width="62" height="36" fill={C.cream} />
  <path d="M26 20h38M26 28h30M26 36h38" fill="none" strokeWidth={2.500} />
  <circle cx="68" cy="30" r="4" fill={C.red} strokeWidth={2} />
</>);
const armor = s(70, 110, <>
  <path d="M35 4l12 8v10H23V12Z" fill={C.grey} />
  <path d="M14 26h42l4 36-10 6v34H20V68L10 62Z" fill={C.grey} />
  <rect x="26" y="28" width="18" height="9" rx="3" fill={C.greyD} strokeWidth={2.500} />
  <path d="M35 40v40M22 52h26" fill="none" stroke={C.white} strokeWidth={3} />
  <path d="M30 14h10" fill="none" strokeWidth={3} />
</>);
const showcase = s(90, 84, <>
  <rect x="6" y="8" width="78" height="60" rx="5" fill={C.blueL} fillOpacity={0.5} />
  <rect x="4" y="66" width="82" height="16" rx="4" fill={C.woodD} />
  <path d="M10 14l8 8M16 10l14 14" fill="none" stroke={C.white} strokeWidth={3} />
  <circle cx="45" cy="48" r="12" fill={C.yellow} strokeWidth={3} />
  <circle cx="45" cy="48" r="5" fill={C.cream} strokeWidth={2} />
</>);
const audioguide = s(40, 70, <>
  <rect x="6" y="4" width="28" height="62" rx="9" fill={C.greyD} />
  <rect x="11" y="10" width="18" height="20" rx="3" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="20" cy="46" r="7" fill={C.red} strokeWidth={2.500} />
  <path d="M14 58h12" fill="none" stroke={C.cream} strokeWidth={3} />
</>);

export const NEW_FUN_SPRITES: Record<string, FlatSprite> = { whistle, racket, medal, stopwatch, croissant, cookie, donut, oven, apron, candle, knife, cuttingboard, stove, kettle, sink, saltjar, ricecooker, fossil, scroll, armor, showcase, audioguide };
void INK;
