import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ riêng của Văn phòng, Thư viện, Siêu thị và Bãi biển.
const stapler = s(64, 36, <>
  <path d="M4 20q0-12 12-12h40q6 0 4 6l-2 8H8Z" fill={C.red} />
  <rect x="4" y="22" width="56" height="10" rx="4" fill={C.greyD} />
  <path d="M16 8h28" fill="none" stroke={C.white} strokeWidth={2.5} />
  <circle cx="19" cy="13" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const folder = s(64, 52, <>
  <path d="M4 10q0-6 6-6h16l6 8h26q6 0 6 6v28q0 6-6 6H10q-6 0-6-6Z" fill={C.yellow} />
  <path d="M4 20h56" fill="none" strokeWidth={2.5} />
  <rect x="20" y="28" width="24" height="9" rx="3" fill={C.white} strokeWidth={2.5} />
  <circle cx="19" cy="18" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const calculator = s(46, 62, <>
  <rect x="5" y="4" width="36" height="54" rx="6" fill={C.greyD} />
  <rect x="10" y="10" width="26" height="12" rx="2" fill={C.greenL} strokeWidth={2.5} />
  {[[12, 30], [22, 30], [32, 30], [12, 40], [22, 40], [32, 40], [12, 50], [22, 50]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill={C.cream} strokeWidth={2} />)}
</>);
const namecard = s(60, 38, <>
  <rect x="4" y="4" width="52" height="30" rx="4" fill={C.white} />
  <circle cx="16" cy="19" r="6" fill={C.blue} strokeWidth={2.5} />
  <path d="M28 14h22M28 22h16" fill="none" strokeWidth={3} />
  <circle cx="18" cy="13" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const magazine = s(54, 66, <>
  <rect x="6" y="4" width="42" height="58" rx="3" fill={C.pink} />
  <rect x="12" y="10" width="30" height="12" rx="2" fill={C.cream} strokeWidth={2.5} />
  <circle cx="27" cy="40" r="10" fill={C.blueL} strokeWidth={2.5} />
  <path d="M14 56h26" fill="none" strokeWidth={2.5} />
</>);
const dictionary = s(60, 64, <>
  <rect x="6" y="4" width="48" height="56" rx="4" fill={C.brown} />
  <rect x="10" y="8" width="40" height="48" rx="2" fill={C.redD} strokeWidth={2.5} />
  <rect x="18" y="18" width="24" height="12" rx="2" fill={C.yellow} strokeWidth={2.5} />
  <path d="M16 42h28M16 48h18" fill="none" stroke={C.cream} strokeWidth={2.5} />
</>);
const bookmark = s(36, 66, <>
  <path d="M6 4h24v56l-12-12-12 12Z" fill={C.red} />
  <circle cx="18" cy="16" r="4" fill={C.yellow} strokeWidth={2.5} />
  <path d="M12 28h12" fill="none" stroke={C.cream} strokeWidth={3} />
  <circle cx="11" cy="23" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const ladder = s(56, 110, <>
  <path d="M10 6l-4 100M46 6l4 100" fill="none" strokeWidth={6} />
  <path d="M10 6l-4 100M46 6l4 100" fill="none" stroke={C.wood} strokeWidth={3} />
  {[22, 44, 66, 88].map((y) => <rect key={y} x="8" y={y} width="40" height="7" rx="3" fill={C.woodD} strokeWidth={2.5} />)}
</>);
const yogurt = s(40, 52, <>
  <path d="M6 12h28l-3 36q0 4-4 4H13q-4 0-4-4Z" fill={C.white} />
  <rect x="4" y="6" width="32" height="8" rx="3" fill={C.pink} />
  <path d="M10 26h20" fill="none" stroke={C.pink} strokeWidth={5} />
  <circle cx="20" cy="38" r="4" fill={C.red} strokeWidth={2} />
</>);
const juice = s(44, 70, <>
  <rect x="6" y="14" width="32" height="52" rx="5" fill={C.orange} />
  <path d="M22 14V4l8-2" fill="none" strokeWidth={3} />
  <circle cx="22" cy="40" r="11" fill={C.yellow} strokeWidth={2.5} />
  <path d="M22 29v22M11 40h22" fill="none" strokeWidth={2} />
</>);
const instantnoodles = s(60, 56, <>
  <path d="M6 12h48l-5 38q-1 4-5 4H16q-4 0-5-4Z" fill={C.red} />
  <ellipse cx="30" cy="12" rx="24" ry="5" fill={C.cream} />
  <path d="M16 6q4-6 8 0t8 0t8 0" fill="none" strokeWidth={2.5} />
  <path d="M14 30h32" fill="none" stroke={C.yellow} strokeWidth={5} />
</>);
const toiletpaper = s(52, 56, <>
  <ellipse cx="26" cy="12" rx="20" ry="7" fill={C.white} />
  <path d="M6 12v34q0 8 20 8t20-8V12" fill={C.white} />
  <ellipse cx="26" cy="12" rx="8" ry="3" fill={C.grey} strokeWidth={2.5} />
  <path d="M10 30q16 6 32 0" fill="none" strokeWidth={2} opacity={0.6} />
</>);
const shampoo = s(40, 76, <>
  <rect x="14" y="2" width="14" height="14" rx="3" fill={C.greyD} />
  <path d="M8 16h26v50q0 6-6 6H14q-6 0-6-6Z" fill={C.teal} />
  <rect x="10" y="30" width="22" height="22" rx="4" fill={C.white} strokeWidth={2.5} />
  <circle cx="21" cy="41" r="5" fill={C.greenL} strokeWidth={2.5} />
</>);
const icecream = s(40, 78, <>
  <path d="M8 34h24L20 74Z" fill={C.wood} />
  <path d="M12 42l16 6M14 54l12 4" fill="none" strokeWidth={2.5} />
  <circle cx="20" cy="26" r="15" fill={C.pink} />
  <circle cx="20" cy="12" r="9" fill={C.cream} />
  <circle cx="24" cy="5" r="3" fill={C.red} strokeWidth={2.5} />
</>);
const chips = s(52, 66, <>
  <path d="M6 8q23 8 40 0v52q-20 8-40 0Z" fill={C.yellow} />
  <path d="M6 8q23 8 40 0" fill="none" strokeWidth={2.5} />
  <circle cx="26" cy="32" r="12" fill={C.orange} strokeWidth={2.5} />
  <path d="M20 32h12" fill="none" stroke={C.cream} strokeWidth={4} />
</>);
const scanner = s(50, 66, <>
  <path d="M10 8h30q6 0 6 6v14H4V14q0-6 6-6Z" fill={C.greyD} />
  <rect x="14" y="26" width="20" height="36" rx="5" fill={C.grey} />
  <rect x="10" y="12" width="30" height="8" rx="3" fill={C.red} strokeWidth={2.5} />
  <path d="M14 18h22" fill="none" stroke={C.white} strokeWidth={2} />
</>);
const lifebuoy = s(66, 66, <>
  <circle cx="33" cy="33" r="28" fill={C.red} />
  <circle cx="33" cy="33" r="13" fill={C.cream} strokeWidth={3} />
  <path d="M33 5v15M33 46v15M5 33h15M46 33h15" fill="none" stroke={C.white} strokeWidth={9} />
  <circle cx="33" cy="33" r="28" fill="none" />
</>);
const sunscreen = s(40, 76, <>
  <rect x="12" y="4" width="16" height="12" rx="3" fill={C.white} />
  <path d="M7 16h26l2 52q0 6-6 6H11q-6 0-6-6Z" fill={C.yellow} />
  <circle cx="20" cy="38" r="9" fill={C.orange} strokeWidth={2.5} />
  <path d="M20 26v4M20 46v4M8 38h4M28 38h4" fill="none" strokeWidth={2.5} />
</>);
const bucket = s(60, 62, <>
  <path d="M10 18q20-22 40 0" fill="none" strokeWidth={4} />
  <path d="M6 18h48l-6 40q-1 4-5 4H17q-4 0-5-4Z" fill={C.red} />
  <ellipse cx="30" cy="18" rx="24" ry="5" fill={C.redD} />
  <path d="M14 34h32" fill="none" stroke={C.yellow} strokeWidth={5} />
</>);
const starfish = s(58, 56, <>
  <path d="M29 4l7 17 19 2-15 12 5 19-16-10-16 10 5-19L3 23l19-2Z" fill={C.orange} />
  <circle cx="29" cy="28" r="3" fill={C.cream} strokeWidth={2} />
  <circle cx="20" cy="24" r="1.800" fill={C.cream} stroke="none" />
  <circle cx="38" cy="24" r="1.800" fill={C.cream} stroke="none" />
</>);
const swimsuit = s(60, 64, <>
  <path d="M10 4l8 10M50 4l-8 10" fill="none" strokeWidth={4} />
  <path d="M12 14h36q4 16-8 30l-10 14-10-14Q8 30 12 14Z" fill={C.blue} />
  <circle cx="26" cy="26" r="3" fill={C.white} stroke="none" />
  <circle cx="36" cy="34" r="3" fill={C.white} stroke="none" />
</>);
const sandcastle = s(90, 70, <>
  <rect x="8" y="30" width="74" height="36" rx="4" fill={C.woodL} />
  <rect x="8" y="16" width="20" height="20" rx="3" fill={C.woodL} />
  <rect x="62" y="16" width="20" height="20" rx="3" fill={C.woodL} />
  <path d="M36 66V46q9-10 18 0v20" fill={C.wood} />
  <path d="M45 16V4h14l-4 5 4 5Z" fill={C.red} strokeWidth={2.5} />
</>);

export const NEW_WORK_SPRITES: Record<string, FlatSprite> = { stapler, folder, calculator, namecard, magazine, dictionary, bookmark, ladder, yogurt, juice, instantnoodles, toiletpaper, shampoo, icecream, chips, scanner, lifebuoy, sunscreen, bucket, starfish, swimsuit, sandcastle };
void INK;
