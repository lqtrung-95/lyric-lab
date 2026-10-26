import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Tiệm giặt là
const washer = s(90, 100, <>
  <rect x="6" y="4" width="78" height="92" rx="9" fill={C.white} />
  <circle cx="45" cy="56" r="28" fill={C.blueL} />
  <circle cx="45" cy="56" r="20" fill={C.blue} strokeWidth={2.500} />
  <path d="M30 56q8-8 15 0t15 0" fill="none" stroke={C.white} strokeWidth={3} />
  <rect x="14" y="12" width="26" height="10" rx="3" fill={C.grey} strokeWidth={2.500} />
  <circle cx="68" cy="17" r="4" fill={C.red} strokeWidth={2} />
</>);
const dryer = s(90, 100, <>
  <rect x="6" y="4" width="78" height="92" rx="9" fill={C.cream} />
  <circle cx="45" cy="56" r="28" fill={C.grey} />
  <circle cx="45" cy="56" r="20" fill={C.greyD} strokeWidth={2.500} />
  <path d="M34 52q11 10 22 0M34 62q11 10 22 0" fill="none" stroke={C.orange} strokeWidth={3} />
  <rect x="14" y="12" width="26" height="10" rx="3" fill={C.orange} strokeWidth={2.500} />
  <circle cx="68" cy="17" r="4" fill={C.yellow} strokeWidth={2} />
</>);
const detergent = s(70, 90, <>
  <path d="M8 22h54l-4 62q0 4-4 4H16q-4 0-4-4Z" fill={C.blue} />
  <rect x="4" y="12" width="62" height="14" rx="4" fill={C.white} />
  <circle cx="35" cy="54" r="14" fill={C.cream} strokeWidth={2.500} />
  <path d="M28 54q7-8 14 0" fill="none" stroke={C.blue} strokeWidth={3} />
  <circle cx="54" cy="8" r="4" fill={C.blueL} strokeWidth={2} />
</>);
const hanger = s(90, 60, <>
  <path d="M45 26V14q0-8 8-8t8 8" fill="none" strokeWidth={5} />
  <path d="M45 26L6 52h78Z" fill="none" strokeWidth={5} />
  <path d="M45 26L6 52h78Z" fill="none" stroke={C.woodD} strokeWidth={2.500} />
  <circle cx="45" cy="26" r="3" fill={C.greyD} strokeWidth={2} />
</>);
const iron = s(100, 70, <>
  <path d="M6 54q0-26 30-26h40q18 0 20 26Z" fill={C.grey} />
  <path d="M18 28q4-18 20-18h20q8 0 8 10v8" fill="none" strokeWidth={7} />
  <rect x="4" y="52" width="92" height="12" rx="5" fill={C.greyD} />
  <circle cx="72" cy="42" r="4" fill={C.red} strokeWidth={2} />
  <path d="M14 44q8-8 24-8" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);
const shirt = s(90, 90, <>
  <path d="M30 6l-24 18 12 16 10-8v54h34V32l10 8 12-16L60 6q-15 12-30 0Z" fill={C.white} />
  <path d="M30 6q15 14 30 0" fill="none" />
  <path d="M45 18v68" fill="none" strokeWidth={2.500} />
  <circle cx="45" cy="34" r="2" fill={C.blue} stroke="none" />
  <circle cx="45" cy="50" r="2" fill={C.blue} stroke="none" />
</>);
const coat = s(100, 100, <>
  <path d="M34 6L6 26l8 52 18-6v24h36V72l18 6 8-52L66 6Z" fill={C.clay} />
  <path d="M34 6l16 22 16-22" fill={C.cream} strokeWidth={2.500} />
  <path d="M50 28v66" fill="none" strokeWidth={2.500} />
  <circle cx="44" cy="46" r="3" fill={C.yellow} strokeWidth={2} />
  <circle cx="44" cy="64" r="3" fill={C.yellow} strokeWidth={2} />
</>);
const sheetcloth = s(110, 70, <>
  <path d="M6 22q20-14 50 0t48-4v40q-20 14-48 0T6 58Z" fill={C.white} />
  <path d="M14 30q16-8 40 0M14 44q16-8 40 0" fill="none" stroke={C.blueL} strokeWidth={4} />
  <path d="M6 22v36" fill="none" strokeWidth={3} />
  <circle cx="86" cy="36" r="4" fill={C.pink} stroke="none" opacity={0.7} />
</>);
const clothesline = s(130, 70, <>
  <path d="M6 10v58M124 10v58" fill="none" strokeWidth={6} />
  <path d="M6 14q59 18 118 0" fill="none" strokeWidth={3} />
  <path d="M26 20h18v22H26ZM60 24h18v20H60ZM94 20h18v22H94Z" fill={C.blueL} />
  <path d="M26 20l9 6 9-6M60 24l9 6 9-6" fill="none" strokeWidth={2} />
</>);
const soap = s(80, 56, <>
  <rect x="6" y="16" width="68" height="36" rx="12" fill={C.pink} />
  <path d="M16 26q14-8 30-4" fill="none" stroke={C.white} strokeWidth={4} opacity={0.7} />
  <circle cx="60" cy="10" r="7" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="72" cy="22" r="4" fill={C.white} strokeWidth={2} />
</>);
const clothespin = s(40, 90, <>
  <path d="M10 6h20v52l-4 28H14l-4-28Z" fill={C.woodL} />
  <path d="M20 10v76" fill="none" strokeWidth={3} />
  <path d="M10 38h20" fill="none" stroke={C.woodD} strokeWidth={4} />
  <circle cx="20" cy="18" r="3" fill={C.woodD} stroke="none" />
</>);
const sewingmachine = s(110, 90, <>
  <rect x="6" y="64" width="98" height="20" rx="5" fill={C.greyD} />
  <path d="M10 64V30q0-10 12-10h60q12 0 12 12v32Z" fill={C.cream} />
  <path d="M92 32v34" fill="none" strokeWidth={4} />
  <rect x="86" y="30" width="14" height="14" rx="3" fill={C.red} strokeWidth={2.500} />
  <circle cx="30" cy="42" r="10" fill={C.white} strokeWidth={2.500} />
  <path d="M96 66v14" fill="none" strokeWidth={4} />
</>);

// ── Cửa hàng đồ chơi
const blocks = s(90, 90, <>
  <rect x="6" y="50" width="38" height="36" rx="3" fill={C.red} />
  <rect x="46" y="50" width="38" height="36" rx="3" fill={C.blue} />
  <rect x="26" y="12" width="38" height="36" rx="3" fill={C.yellow} />
  <path d="M18 68h14M58 68h14M38 30h14" fill="none" stroke={C.white} strokeWidth={4} />
</>);
const teddy = s(80, 100, <>
  <circle cx="18" cy="18" r="11" fill={C.woodD} />
  <circle cx="62" cy="18" r="11" fill={C.woodD} />
  <circle cx="40" cy="32" r="24" fill={C.woodD} />
  <ellipse cx="40" cy="74" rx="26" ry="24" fill={C.woodD} />
  <ellipse cx="40" cy="40" rx="11" ry="8" fill={C.woodL} strokeWidth={2.500} />
  <circle cx="30" cy="28" r="3" fill={INK} stroke="none" />
  <circle cx="50" cy="28" r="3" fill={INK} stroke="none" />
  <ellipse cx="40" cy="38" rx="4" ry="3" fill={INK} stroke="none" />
  <ellipse cx="40" cy="78" rx="14" ry="14" fill={C.woodL} strokeWidth={2.500} />
</>);
const robot = s(80, 110, <>
  <path d="M40 4v12" fill="none" strokeWidth={4} />
  <circle cx="40" cy="6" r="4" fill={C.red} strokeWidth={2.500} />
  <rect x="14" y="16" width="52" height="38" rx="8" fill={C.grey} />
  <rect x="22" y="26" width="12" height="12" rx="3" fill={C.blueL} strokeWidth={2.500} />
  <rect x="46" y="26" width="12" height="12" rx="3" fill={C.blueL} strokeWidth={2.500} />
  <path d="M28 46h24" fill="none" strokeWidth={3} />
  <rect x="10" y="58" width="60" height="36" rx="6" fill={C.blue} />
  <path d="M10 66H2v22M70 66h8v22M26 94v12M54 94v12" fill="none" strokeWidth={5} />
  <circle cx="40" cy="76" r="6" fill={C.yellow} strokeWidth={2.500} />
</>);
const puzzle = s(90, 80, <>
  <path d="M6 14h26q-4-12 8-12t8 12h24v22q12-4 12 8t-12 8v22H6Z" fill={C.green} />
  <path d="M46 14v62M6 46h40" fill="none" strokeWidth={2.500} />
  <circle cx="26" cy="30" r="5" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="64" cy="58" r="5" fill={C.red} strokeWidth={2.500} />
</>);
const doll = s(70, 110, <>
  <path d="M10 28q0-26 25-26t25 26v14H10Z" fill={C.yellow} />
  <circle cx="35" cy="34" r="18" fill={C.woodL} />
  <path d="M8 40q-4 28 4 34M62 40q4 28-4 34" fill="none" stroke={C.yellow} strokeWidth={6} />
  <path d="M16 56h38l10 46H6Z" fill={C.pink} />
  <circle cx="29" cy="34" r="2.500" fill={INK} stroke="none" />
  <circle cx="41" cy="34" r="2.500" fill={INK} stroke="none" />
  <path d="M30 42q5 4 10 0" fill="none" strokeWidth={2.500} />
</>);
const rccar = s(110, 60, <>
  <path d="M6 40q0-18 18-18h14l10-14h28l10 14h6q14 0 14 18v8H6Z" fill={C.orange} />
  <rect x="40" y="14" width="32" height="14" rx="3" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="28" cy="50" r="10" fill={INK} />
  <circle cx="84" cy="50" r="10" fill={INK} />
  <circle cx="28" cy="50" r="4" fill={C.grey} strokeWidth={2} />
  <circle cx="84" cy="50" r="4" fill={C.grey} strokeWidth={2} />
</>);
const yoyo = s(60, 100, <>
  <path d="M30 4v38" fill="none" strokeWidth={3} />
  <circle cx="30" cy="68" r="26" fill={C.red} />
  <circle cx="30" cy="68" r="14" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="30" cy="68" r="4" fill={C.greyD} strokeWidth={2} />
  <path d="M12 54q6-10 16-12" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);
const spintop = s(70, 90, <>
  <path d="M35 4v14" fill="none" strokeWidth={5} />
  <path d="M8 30q0-14 27-14t27 14q0 8-27 8T8 30Z" fill={C.blue} />
  <path d="M10 36q25 6 50 0L35 84Z" fill={C.yellow} />
  <path d="M16 30q19 4 38 0" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const rubik = s(80, 80, <>
  <path d="M40 4l34 18v36L40 76 6 58V22Z" fill={C.blue} />
  <path d="M6 22l34 18 34-18M40 40v36" fill="none" strokeWidth={3} />
  <rect x="14" y="26" width="10" height="10" fill={C.red} strokeWidth={2} />
  <rect x="48" y="50" width="10" height="10" fill={C.yellow} strokeWidth={2} />
  <rect x="58" y="30" width="10" height="10" fill={C.green} strokeWidth={2} />
</>);
const marbles = s(80, 60, <>
  <circle cx="22" cy="38" r="14" fill={C.red} />
  <circle cx="50" cy="40" r="14" fill={C.blue} />
  <circle cx="36" cy="18" r="14" fill={C.green} />
  <circle cx="64" cy="20" r="10" fill={C.yellow} />
  <path d="M14 32q4-6 10-6M42 34q4-6 10-6M30 12q4-5 9-5" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const toytrain = s(120, 70, <>
  <rect x="6" y="26" width="38" height="28" rx="5" fill={C.red} />
  <rect x="44" y="18" width="28" height="36" rx="4" fill={C.blue} />
  <rect x="76" y="30" width="38" height="24" rx="5" fill={C.green} />
  <path d="M10 26V12h14v14" fill={C.greyD} strokeWidth={3} />
  <circle cx="20" cy="58" r="8" fill={INK} />
  <circle cx="60" cy="58" r="8" fill={INK} />
  <circle cx="98" cy="58" r="8" fill={INK} />
  <path d="M44 38h-2M74 42h2" fill="none" strokeWidth={4} />
</>);
const chess = s(90, 90, <>
  <rect x="4" y="4" width="82" height="82" rx="6" fill={C.cream} />
  <path d="M4 4h41v41H4ZM45 45h41v41H45Z" fill={C.woodD} strokeWidth={2.500} />
  <path d="M60 14l8 8-4 12h-8l-4-12Z" fill={C.white} strokeWidth={2.500} />
  <path d="M20 54l8 8-4 14h-8l-4-14Z" fill={INK} />
</>);

export const VENUE5_LAUNDRY_TOY_SPRITES: Record<string, FlatSprite> = {
  washer, dryer, detergent, hanger, iron, shirt, coat, sheetcloth, clothesline, soap, clothespin, sewingmachine,
  blocks, teddy, robot, puzzle, doll, rccar, yoyo, spintop, rubik, marbles, toytrain, chess,
};
