import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ riêng của Phòng, Quán ăn và Chợ.
const sofa = s(110, 66, <>
  <rect x="8" y="10" width="94" height="34" rx="12" fill={C.teal} />
  <rect x="2" y="30" width="22" height="30" rx="9" fill={C.teal} />
  <rect x="86" y="30" width="22" height="30" rx="9" fill={C.teal} />
  <rect x="20" y="34" width="70" height="22" rx="8" fill={C.green} />
  <rect x="28" y="16" width="22" height="18" rx="6" fill={C.cream} strokeWidth={2.5} />
</>);
const pillow = s(60, 44, <>
  <rect x="5" y="6" width="50" height="32" rx="12" fill={C.cream} />
  <path d="M5 22q25-8 50 0" fill="none" strokeWidth={2.5} />
  <circle cx="30" cy="22" r="4" fill={C.pink} strokeWidth={2.5} />
  <path d="M16 12l4 4M44 30l-4-4" fill="none" strokeWidth={2.5} />
</>);
const wardrobe = s(72, 104, <>
  <rect x="6" y="4" width="60" height="94" rx="6" fill={C.wood} />
  <path d="M36 4v94" fill="none" strokeWidth={3} />
  <rect x="12" y="12" width="20" height="78" rx="3" fill={C.woodL} strokeWidth={2.5} />
  <rect x="40" y="12" width="20" height="78" rx="3" fill={C.woodL} strokeWidth={2.5} />
  <circle cx="30" cy="54" r="3" fill={C.brown} strokeWidth={2} />
  <circle cx="42" cy="54" r="3" fill={C.brown} strokeWidth={2} />
</>);
const bowl = s(60, 40, <>
  <path d="M4 12h52q0 22-26 26Q4 34 4 12Z" fill={C.white} />
  <ellipse cx="30" cy="12" rx="26" ry="6" fill={C.orange} />
  <path d="M10 24h40" fill="none" stroke={C.blue} strokeWidth={4} />
  <path d="M20 8q4-6 8 0" fill="none" strokeWidth={2} />
</>);
const spoon = s(64, 26, <>
  <ellipse cx="14" cy="13" rx="11" ry="8" fill={C.grey} />
  <path d="M24 13h34" fill="none" strokeWidth={5} />
  <path d="M24 13h34" fill="none" stroke={C.grey} strokeWidth={2} />
  <ellipse cx="12" cy="11" rx="4" ry="2.5" fill={C.white} stroke="none" />
</>);
const plate = s(64, 32, <>
  <ellipse cx="32" cy="18" rx="28" ry="12" fill={C.white} />
  <ellipse cx="32" cy="17" rx="19" ry="7" fill={C.blueL} strokeWidth={2.5} />
  <circle cx="26" cy="15" r="3.5" fill={C.red} strokeWidth={2} />
  <circle cx="37" cy="17" r="3.5" fill={C.green} strokeWidth={2} />
</>);
const dumpling = s(56, 42, <>
  <path d="M4 30q0-24 24-24t24 24q-24 10-48 0Z" fill={C.cream} />
  <path d="M10 18l4 4M18 12l3 5M27 10l1 6M36 12l-2 5M44 18l-4 4" fill="none" strokeWidth={2.5} />
  <ellipse cx="22" cy="26" rx="5" ry="2.5" fill={C.white} stroke="none" opacity={0.7} />
  <path d="M4 30q24 10 48 0" fill="none" strokeWidth={2.5} />
</>);
const bill = s(44, 60, <>
  <path d="M6 4h32v48l-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4Z" fill={C.white} />
  <path d="M12 14h20M12 22h20M12 30h12" fill="none" strokeWidth={2.5} />
  <circle cx="30" cy="40" r="5" fill={C.red} strokeWidth={2.5} />
  <circle cx="13" cy="21" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const napkin = s(54, 44, <>
  <path d="M4 38V10l24-6 22 6v28Z" fill={C.pink} />
  <path d="M4 10l24 14 22-14" fill="none" strokeWidth={2.5} />
  <path d="M28 24v14" fill="none" strokeWidth={2.5} />
  <circle cx="28" cy="30" r="3" fill={C.white} strokeWidth={2} />
</>);
const scale = s(68, 64, <>
  <rect x="14" y="44" width="40" height="16" rx="5" fill={C.greyD} />
  <rect x="28" y="30" width="12" height="16" fill={C.grey} />
  <circle cx="34" cy="18" r="14" fill={C.white} />
  <path d="M34 18l7-6" fill="none" strokeWidth={3} />
  <path d="M8 34h52" fill="none" strokeWidth={4} />
</>);
const chili = s(60, 40, <>
  <path d="M8 8q10 24 40 22q8 0 8-6q-20 4-34-12Z" fill={C.red} />
  <path d="M8 8q-4-4-2-6q6 0 8 6" fill={C.green} strokeWidth={2.5} />
  <ellipse cx="30" cy="18" rx="8" ry="2.5" fill={C.white} stroke="none" opacity={0.6} transform="rotate(22 30 18)" />
  <path d="M50 24l5 3" fill="none" strokeWidth={3} />
</>);

const remote = s(36, 70, <>
  <rect x="6" y="4" width="24" height="62" rx="8" fill={C.greyD} />
  <circle cx="18" cy="16" r="5" fill={C.red} strokeWidth={2.5} />
  {[28, 38, 48, 58].map((y) => <rect key={y} x="11" y={y - 4} width="14" height="6" rx="3" fill={C.cream} strokeWidth={2} />)}
</>);
const photoframe = s(60, 56, <>
  <rect x="4" y="4" width="52" height="46" rx="5" fill={C.woodD} />
  <rect x="10" y="10" width="40" height="34" rx="2" fill={C.blueL} strokeWidth={2.5} />
  <circle cx="22" cy="22" r="5" fill={C.yellow} strokeWidth={2.5} />
  <path d="M10 40q12-14 22-4t18-6v14H10Z" fill={C.green} strokeWidth={2.5} />
</>);

const alarmclock = s(54, 56, <>
  <circle cx="14" cy="10" r="8" fill={C.red} />
  <circle cx="40" cy="10" r="8" fill={C.red} />
  <circle cx="27" cy="32" r="22" fill={C.yellow} />
  <circle cx="27" cy="32" r="15" fill={C.cream} strokeWidth={2.5} />
  <path d="M27 32V22M27 32l8 4" fill="none" strokeWidth={3} />
  <path d="M16 52l-4 4M38 52l4 4" fill="none" strokeWidth={3} />
</>);
const lunchbox = s(64, 44, <>
  <rect x="4" y="12" width="56" height="28" rx="6" fill={C.red} />
  <rect x="4" y="8" width="56" height="10" rx="4" fill={C.redD} />
  <path d="M4 26h56" fill="none" strokeWidth={2.5} />
  <rect x="26" y="20" width="12" height="9" rx="3" fill={C.yellow} strokeWidth={2.5} />
</>);
const flag = s(46, 90, <>
  <path d="M10 4v82" fill="none" strokeWidth={5} />
  <path d="M10 6h30l-8 12 8 12H10Z" fill={C.green} />
  <circle cx="10" cy="86" r="4" fill={C.greyD} strokeWidth={2.5} />
  <path d="M16 12h12" fill="none" stroke={C.white} strokeWidth={3} />
</>);

export const NEW_HOME_SPRITES: Record<string, FlatSprite> = { sofa, pillow, wardrobe, bowl, spoon, plate, dumpling, bill, napkin, scale, chili, remote, photoframe, alarmclock, lunchbox, flag };
void INK;
