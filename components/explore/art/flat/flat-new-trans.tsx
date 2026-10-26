import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ riêng của Nhà ga, Công viên và Bệnh viện.
const timetable = s(70, 56, <>
  <rect x="4" y="4" width="62" height="46" rx="5" fill={C.blueL} />
  <path d="M12 16h20M38 16h20M12 26h20M38 26h20M12 36h20M38 36h20" fill="none" strokeWidth={3} />
  <circle cx="35" cy="50" r="2.5" fill={C.greyD} strokeWidth={2} />
  <circle cx="21" cy="20" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const signboard = s(64, 70, <>
  <rect x="29" y="30" width="7" height="38" rx="2" fill={C.greyD} />
  <rect x="4" y="4" width="56" height="30" rx="8" fill={C.green} />
  <path d="M14 19h32M40 12l7 7-7 7" fill="none" stroke={C.white} strokeWidth={4} />
  <circle cx="19" cy="24" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const ticketwindow = s(80, 76, <>
  <rect x="4" y="6" width="72" height="66" rx="6" fill={C.woodD} />
  <rect x="12" y="14" width="56" height="30" rx="4" fill={C.blueL} strokeWidth={2.5} />
  <rect x="26" y="50" width="28" height="9" rx="3" fill={C.cream} strokeWidth={2.5} />
  <path d="M20 28h20" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const trolley = s(76, 70, <>
  <path d="M6 4l8 6v36h54" fill="none" strokeWidth={4} />
  <rect x="18" y="14" width="40" height="28" rx="4" fill={C.orange} />
  <path d="M18 24h40" fill="none" strokeWidth={2.5} />
  <circle cx="26" cy="56" r="7" fill={C.greyD} />
  <circle cx="58" cy="56" r="7" fill={C.greyD} />
</>);
const rails = s(120, 44, <>
  <path d="M6 8h108M6 34h108" fill="none" strokeWidth={5} />
  <path d="M6 8h108M6 34h108" fill="none" stroke={C.grey} strokeWidth={2} />
  {[12, 34, 56, 78, 100].map((x) => <rect key={x} x={x} y="4" width="14" height="34" rx="3" fill={C.woodD} strokeWidth={2.5} />)}
</>);
const pond = s(110, 50, <>
  <ellipse cx="55" cy="28" rx="50" ry="20" fill={C.blue} />
  <ellipse cx="55" cy="26" rx="40" ry="14" fill={C.blueL} strokeWidth={2} />
  <ellipse cx="38" cy="26" rx="8" ry="4" fill={C.greenL} strokeWidth={2.5} />
  <path d="M62 24q8-4 16 0" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const fountain = s(84, 90, <>
  <ellipse cx="42" cy="76" rx="38" ry="12" fill={C.grey} />
  <rect x="34" y="40" width="16" height="36" rx="3" fill={C.grey} />
  <ellipse cx="42" cy="42" rx="24" ry="7" fill={C.blueL} />
  <path d="M42 40q-12-24-26-20M42 40q12-24 26-20M42 40V12" fill="none" stroke={C.blue} strokeWidth={4} />
</>);
const squirrel = s(60, 62, <>
  <path d="M42 50C58 46 60 20 44 12" fill="none" strokeWidth={14} />
  <path d="M42 50C58 46 60 20 44 12" fill="none" stroke={C.clay} strokeWidth={8} />
  <ellipse cx="26" cy="44" rx="16" ry="16" fill={C.clay} />
  <ellipse cx="22" cy="48" rx="8" ry="9" fill={C.cream} strokeWidth={2.5} />
  <circle cx="18" cy="24" r="12" fill={C.clay} />
  <circle cx="22" cy="20" r="2.5" fill={INK} stroke="none" />
  <circle cx="12" cy="26" r="2" fill={INK} stroke="none" />
</>);
const pavilion = s(110, 104, <>
  <path d="M4 34L55 6l51 28Z" fill={C.red} />
  <rect x="16" y="34" width="8" height="62" fill={C.woodD} />
  <rect x="86" y="34" width="8" height="62" fill={C.woodD} />
  <rect x="8" y="90" width="94" height="10" rx="3" fill={C.grey} />
  <path d="M24 44h62" fill="none" strokeWidth={4} stroke={C.woodD} />
</>);
const stethoscope = s(70, 76, <>
  <path d="M14 6v22q0 16 16 16t16-16V6" fill="none" strokeWidth={4} />
  <path d="M30 44v8q0 12 14 12t14-10" fill="none" strokeWidth={4} />
  <circle cx="58" cy="52" r="8" fill={C.grey} />
  <circle cx="14" cy="6" r="4" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="46" cy="6" r="4" fill={C.greyD} strokeWidth={2.5} />
</>);
const wheelchair = s(80, 84, <>
  <path d="M18 8v34h38" fill="none" strokeWidth={5} />
  <rect x="18" y="26" width="34" height="10" rx="4" fill={C.blue} />
  <circle cx="30" cy="62" r="18" fill="none" strokeWidth={5} />
  <circle cx="30" cy="62" r="3" fill={C.greyD} strokeWidth={2} />
  <circle cx="62" cy="74" r="6" fill={C.greyD} />
</>);
const bandage = s(64, 36, <>
  <rect x="4" y="8" width="56" height="20" rx="10" fill={C.cream} />
  <rect x="22" y="8" width="20" height="20" fill={C.pink} stroke="none" />
  <path d="M22 8v20M42 8v20" fill="none" strokeWidth={2.5} />
  <circle cx="32" cy="18" r="2" fill={C.redD} stroke="none" />
</>);
const drip = s(46, 100, <>
  <path d="M23 4v14" fill="none" strokeWidth={3} />
  <rect x="8" y="16" width="30" height="46" rx="10" fill={C.blueL} />
  <rect x="11" y="38" width="24" height="22" rx="8" fill={C.blue} stroke="none" />
  <path d="M23 62v22" fill="none" strokeWidth={3} />
  <circle cx="23" cy="90" r="4" fill={C.red} strokeWidth={2.5} />
</>);

export const NEW_TRANS_SPRITES: Record<string, FlatSprite> = { timetable, signboard, ticketwindow, trolley, rails, pond, fountain, squirrel, pavilion, stethoscope, wheelchair, bandage, drip };
