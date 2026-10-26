import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ riêng của Trường học, Cửa hàng quần áo, Khách sạn và Sân bay.
const eraser = s(60, 34, <>
  <rect x="4" y="8" width="52" height="22" rx="5" fill={C.blue} />
  <rect x="4" y="8" width="22" height="22" rx="5" fill={C.pink} />
  <path d="M26 8v22" fill="none" strokeWidth={2.5} />
  <circle cx="40" cy="19" r="2.5" fill={C.white} stroke="none" />
</>);
const notebook = s(50, 62, <>
  <rect x="6" y="4" width="40" height="54" rx="5" fill={C.green} />
  <rect x="14" y="14" width="24" height="16" rx="3" fill={C.cream} strokeWidth={2.5} />
  <path d="M6 14h-3M6 28h-3M6 42h-3" fill="none" strokeWidth={3} />
  <path d="M18 20h16M18 25h10" fill="none" strokeWidth={2} />
</>);
const chalk = s(54, 22, <>
  <rect x="4" y="5" width="46" height="13" rx="5" fill={C.white} />
  <path d="M30 5v13" fill="none" strokeWidth={2.5} />
  <rect x="30" y="5" width="20" height="13" rx="5" fill={C.pink} />
  <ellipse cx="14" cy="9" rx="5" ry="2" fill={C.cream} stroke="none" />
</>);
const globe = s(60, 80, <>
  <path d="M30 66v10M16 76h28" fill="none" strokeWidth={4} />
  <circle cx="30" cy="34" r="26" fill={C.blue} />
  <path d="M14 26q8-8 14 0t-4 14q-10 0-10-14ZM36 40q10-4 14 6-6 10-14 0Z" fill={C.green} strokeWidth={2.5} />
  <path d="M4 34q26 12 52 0" fill="none" strokeWidth={2} />
</>);
const bell = s(52, 56, <>
  <path d="M26 4v6" fill="none" strokeWidth={3} />
  <path d="M8 40q0-26 18-26t18 26Z" fill={C.yellow} />
  <rect x="4" y="38" width="44" height="8" rx="4" fill={C.orange} />
  <circle cx="26" cy="50" r="4" fill={C.brown} strokeWidth={2.5} />
</>);
const scarf = s(60, 60, <>
  <path d="M8 8h44v14H8Z" fill={C.red} />
  <path d="M14 22h14v34l-7-6-7 6Z" fill={C.red} />
  <path d="M8 14h44M14 34h14M14 44h14" fill="none" stroke={C.cream} strokeWidth={3} />
  <circle cx="18" cy="21" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const socks = s(64, 56, <>
  <path d="M12 4h22v26l16 8q8 4 4 12t-14 4H18q-10 0-10-12Z" fill={C.blueL} />
  <path d="M12 12h22M10 24h24" fill="none" stroke={C.blue} strokeWidth={4} />
  <rect x="12" y="4" width="22" height="7" fill={C.white} strokeWidth={2.5} />
  <circle cx="19" cy="20" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const tie = s(40, 84, <>
  <path d="M10 4h20l-3 12H13Z" fill={C.red} />
  <path d="M13 16h14l7 52-14 12-14-12Z" fill={C.red} />
  <path d="M16 32l10 8M14 46l12 8" fill="none" stroke={C.cream} strokeWidth={3} />
  <circle cx="12" cy="29" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const gloves = s(60, 64, <>
  <path d="M10 56V24q0-8 7-8h3l2-10q2-4 5 0l2 10h3l2-8q2-4 5 0l-1 10 6-4q4-2 4 3v12q0 18-14 22v6Z" fill={C.orange} />
  <path d="M10 48h30" fill="none" stroke={C.cream} strokeWidth={5} />
  <path d="M12 56h26" fill="none" strokeWidth={3} />
  <circle cx="18" cy="22" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const elevator = s(60, 100, <>
  <rect x="4" y="4" width="52" height="92" rx="6" fill={C.grey} />
  <rect x="10" y="14" width="19" height="78" rx="2" fill={C.blueL} strokeWidth={2.5} />
  <rect x="31" y="14" width="19" height="78" rx="2" fill={C.blueL} strokeWidth={2.5} />
  <path d="M24 8l6-4 6 4Z" fill={C.red} strokeWidth={2} />
  <circle cx="54" cy="48" r="2.5" fill={C.yellow} stroke="none" />
</>);
const roomcard = s(64, 44, <>
  <rect x="4" y="6" width="56" height="34" rx="6" fill={C.teal} />
  <rect x="10" y="12" width="16" height="12" rx="2" fill={C.yellow} strokeWidth={2.5} />
  <path d="M32 14h22M32 22h14" fill="none" stroke={C.white} strokeWidth={3} />
  <path d="M8 34h48" fill="none" strokeWidth={2.5} />
</>);
const slippers = s(70, 40, <>
  <path d="M4 26q0-18 16-18t16 18v8H4Z" fill={C.cream} />
  <path d="M36 28q0-18 16-18t16 18v8H36Z" fill={C.cream} />
  <path d="M10 22q10-6 20 0M42 24q10-6 20 0" fill="none" stroke={C.pink} strokeWidth={4} />
  <circle cx="21" cy="14" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const hairdryer = s(70, 60, <>
  <rect x="4" y="6" width="44" height="26" rx="12" fill={C.pink} />
  <rect x="44" y="12" width="22" height="14" rx="4" fill={C.greyD} />
  <path d="M24 30l8 26" fill="none" strokeWidth={9} />
  <path d="M24 30l8 26" fill="none" stroke={C.pink} strokeWidth={5} />
  <path d="M68 14l0 0M62 30q8 2 4 10" fill="none" strokeWidth={0} />
</>);
const securitygate = s(80, 110, <>
  <rect x="4" y="8" width="12" height="98" rx="4" fill={C.greyD} />
  <rect x="64" y="8" width="12" height="98" rx="4" fill={C.greyD} />
  <rect x="4" y="4" width="72" height="14" rx="6" fill={C.grey} />
  <circle cx="40" cy="11" r="3.5" fill={C.green} strokeWidth={2.5} />
  <path d="M16 30v70M64 30v70" fill="none" strokeWidth={0} />
</>);
const conveyor = s(120, 44, <>
  <rect x="4" y="12" width="112" height="22" rx="10" fill={C.greyD} />
  <rect x="12" y="16" width="96" height="10" rx="5" fill={C.grey} strokeWidth={2.5} />
  <circle cx="22" cy="38" r="5" fill={C.grey} strokeWidth={2.5} />
  <circle cx="98" cy="38" r="5" fill={C.grey} strokeWidth={2.5} />
</>);
const tower = s(70, 120, <>
  <path d="M26 112l6-70h6l6 70Z" fill={C.grey} />
  <rect x="10" y="22" width="50" height="22" rx="6" fill={C.blueL} />
  <path d="M6 22h58l-6-12H12Z" fill={C.red} />
  <path d="M35 10V2M35 4h12" fill="none" strokeWidth={3} />
</>);
const luggagetag = s(40, 60, <>
  <path d="M20 4v10" fill="none" strokeWidth={3} />
  <path d="M8 22q0-8 12-8t12 8v32H8Z" fill={C.yellow} />
  <circle cx="20" cy="22" r="3" fill={C.white} strokeWidth={2.5} />
  <path d="M14 34h12M14 42h12" fill="none" strokeWidth={2.5} />
</>);

export const NEW_LEARN_SPRITES: Record<string, FlatSprite> = { eraser, notebook, chalk, globe, bell, scarf, socks, tie, gloves, elevator, roomcard, slippers, hairdryer, securitygate, conveyor, tower, luggagetag };
void INK;
