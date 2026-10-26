import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ bổ sung cho các cảnh có sẵn (đợt 2).
const ticketmachine = s(70, 104, <>
  <rect x="6" y="4" width="58" height="96" rx="8" fill={C.blue} />
  <rect x="14" y="12" width="42" height="26" rx="3" fill={C.blueL} strokeWidth={2.5} />
  <rect x="16" y="48" width="38" height="20" rx="3" fill={C.grey} strokeWidth={2.5} />
  <rect x="20" y="78" width="30" height="9" rx="3" fill={C.cream} strokeWidth={2.5} />
</>);
const turnstile = s(80, 84, <>
  <rect x="6" y="38" width="22" height="40" rx="5" fill={C.greyD} />
  <rect x="52" y="38" width="22" height="40" rx="5" fill={C.greyD} />
  <path d="M28 46h24M28 58h24" fill="none" strokeWidth={5} />
  <circle cx="17" cy="30" r="5" fill={C.green} strokeWidth={2.5} />
  <path d="M40 8v26" fill="none" strokeWidth={0} />
</>);
const crutches = s(60, 100, <>
  <path d="M14 6l14 90M46 6L32 96" fill="none" strokeWidth={5} />
  <path d="M8 10h16M38 10h16" fill="none" strokeWidth={6} />
  <path d="M18 40h16M30 40h16" fill="none" stroke={C.wood} strokeWidth={4} />
  <circle cx="28" cy="96" r="3" fill={C.greyD} strokeWidth={2.5} />
</>);
const nursecap = s(60, 46, <>
  <path d="M6 38q0-30 24-30t24 30Z" fill={C.white} />
  <rect x="4" y="36" width="52" height="8" rx="3" fill={C.pink} />
  <path d="M30 16v14M23 23h14" fill="none" stroke={C.red} strokeWidth={5} />
  <circle cx="18" cy="16" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const bpmonitor = s(70, 66, <>
  <rect x="26" y="4" width="38" height="28" rx="5" fill={C.greyD} />
  <rect x="31" y="9" width="28" height="12" rx="2" fill={C.greenL} strokeWidth={2.5} />
  <path d="M26 26H10q-4 0-4 6v10q0 6 8 6h16" fill="none" strokeWidth={5} />
  <rect x="4" y="38" width="34" height="22" rx="8" fill={C.blue} />
</>);
const stretcher = s(110, 56, <>
  <rect x="6" y="12" width="98" height="16" rx="7" fill={C.blueL} />
  <path d="M6 20H0M110 20h-6" fill="none" strokeWidth={5} />
  <path d="M24 28l-6 20M86 28l6 20" fill="none" strokeWidth={4} />
  <circle cx="18" cy="50" r="5" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="92" cy="50" r="5" fill={C.greyD} strokeWidth={2.5} />
</>);
const bookend = s(56, 70, <>
  <path d="M6 66V6h14v42h30v18Z" fill={C.greyD} />
  <rect x="22" y="18" width="12" height="30" rx="2" fill={C.red} strokeWidth={2.5} />
  <rect x="34" y="22" width="10" height="26" rx="2" fill={C.blue} strokeWidth={2.5} />
  <circle cx="17" cy="24" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const quietsign = s(70, 60, <>
  <rect x="4" y="6" width="62" height="44" rx="8" fill={C.red} />
  <path d="M35 18v10M35 34v2" fill="none" stroke={C.white} strokeWidth={6} />
  <path d="M18 54h34" fill="none" strokeWidth={4} />
  <circle cx="35" cy="26" r="12" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const highlighter = s(76, 30, <>
  <rect x="6" y="6" width="44" height="18" rx="4" fill={C.yellow} />
  <path d="M50 8l20 8-20 8Z" fill={C.cream} />
  <path d="M66 12l4 4-4 4" fill={C.orange} strokeWidth={2.5} />
  <path d="M12 12h30" fill="none" stroke={C.white} strokeWidth={2.5} />
</>);
const toast = s(60, 56, <>
  <path d="M8 22q-6-16 12-16h20q18 0 12 16v30H8Z" fill={C.wood} />
  <rect x="14" y="20" width="32" height="28" rx="4" fill={C.cream} strokeWidth={2.5} />
  <path d="M20 30h20M20 38h14" fill="none" stroke={C.woodL} strokeWidth={2.5} />
  <circle cx="22" cy="12" r="2" fill={C.woodL} stroke="none" />
</>);
const baguette = s(110, 34, <>
  <path d="M6 18q0-12 14-12h70q14 0 14 12t-14 12H20Q6 30 6 18Z" fill={C.wood} />
  <path d="M24 8l8 20M44 8l8 20M64 8l8 20M84 8l8 20" fill="none" strokeWidth={3} stroke={C.woodD} />
  <path d="M14 14q20-6 50-4" fill="none" stroke={C.woodL} strokeWidth={2.5} />
  <circle cx="33" cy="12" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const flour = s(60, 74, <>
  <path d="M8 14h44l4 54q0 4-4 4H8q-4 0-4-4Z" fill={C.cream} />
  <path d="M8 14q22-14 44 0" fill="none" strokeWidth={3} />
  <rect x="14" y="30" width="32" height="22" rx="4" fill={C.blueL} strokeWidth={2.5} />
  <path d="M22 41h16" fill="none" strokeWidth={3} />
</>);
const rollingpin = s(100, 34, <>
  <rect x="2" y="12" width="14" height="10" rx="4" fill={C.woodD} />
  <rect x="84" y="12" width="14" height="10" rx="4" fill={C.woodD} />
  <rect x="14" y="4" width="72" height="26" rx="10" fill={C.woodL} />
  <path d="M24 12h52M24 22h40" fill="none" stroke={C.wood} strokeWidth={2.500} />
</>);
const ladle = s(70, 84, <>
  <path d="M34 6v44" fill="none" strokeWidth={7} />
  <path d="M34 6v44" fill="none" stroke={C.grey} strokeWidth={3} />
  <path d="M10 50h48q0 24-24 26-24-2-24-26Z" fill={C.grey} />
  <ellipse cx="34" cy="50" rx="24" ry="6" fill={C.greyD} />
</>);
const spatula = s(60, 90, <>
  <path d="M30 40v46" fill="none" strokeWidth={8} />
  <path d="M30 40v46" fill="none" stroke={C.brown} strokeWidth={4} />
  <rect x="10" y="4" width="40" height="40" rx="6" fill={C.grey} />
  <path d="M18 14v22M30 14v22M42 14v22" fill="none" strokeWidth={2.5} />
</>);
const oil = s(40, 84, <>
  <rect x="12" y="2" width="16" height="14" rx="3" fill={C.red} />
  <path d="M10 16h20q10 6 10 20v38q0 6-6 6H6q-6 0-6-6V36q0-14 10-20Z" fill={C.yellow} />
  <rect x="6" y="40" width="28" height="24" rx="4" fill={C.cream} strokeWidth={2.5} />
  <ellipse cx="20" cy="52" rx="6" ry="8" fill={C.orange} strokeWidth={2.5} />
</>);
const garlic = s(54, 56, <>
  <path d="M27 4q-3 10 0 14" fill="none" strokeWidth={4} />
  <path d="M27 18C6 18 2 50 27 52c25-2 21-34 0-34Z" fill={C.cream} />
  <path d="M27 18q-12 18 0 34M27 18q12 18 0 34" fill="none" strokeWidth={2.500} />
  <path d="M22 52l-2 4M32 52l2 4" fill="none" strokeWidth={2.500} />
</>);
const dinosaur = s(130, 90, <>
  <path d="M8 74q30 4 54-4l40 6" fill="none" strokeWidth={5} />
  <path d="M30 70q-4-34 24-36t38 8l22-24 6 10-18 22q-6 20-34 22" fill={C.cream} />
  <circle cx="118" cy="22" r="6" fill={C.cream} />
  <path d="M40 40v34M54 36v36M68 38v34M82 44v28" fill="none" strokeWidth={3.5} />
</>);
const barrier = s(110, 64, <>
  <rect x="6" y="10" width="10" height="50" rx="4" fill={C.yellow} />
  <rect x="94" y="10" width="10" height="50" rx="4" fill={C.yellow} />
  <path d="M16 20q38 14 78 0" fill="none" strokeWidth={6} />
  <path d="M16 20q38 14 78 0" fill="none" stroke={C.red} strokeWidth={3} />
  <circle cx="11" cy="8" r="6" fill={C.orange} strokeWidth={2.500} />
</>);
const lantern = s(56, 80, <>
  <path d="M28 2v10" fill="none" strokeWidth={3} />
  <rect x="14" y="10" width="28" height="8" rx="3" fill={C.yellow} />
  <ellipse cx="28" cy="40" rx="22" ry="24" fill={C.red} />
  <path d="M28 16v48M12 28q16 12 32 0M12 52q16-12 32 0" fill="none" strokeWidth={2.500} />
  <path d="M22 70v8M28 70v10M34 70v8" fill="none" strokeWidth={3} stroke={C.yellow} />
</>);
const seatbelt = s(80, 46, <>
  <rect x="4" y="14" width="30" height="20" rx="5" fill={C.greyD} />
  <rect x="46" y="14" width="30" height="20" rx="5" fill={C.grey} />
  <path d="M34 24h12" fill="none" strokeWidth={8} />
  <path d="M34 24h12" fill="none" stroke={C.red} strokeWidth={4} />
  <path d="M60 20v8" fill="none" strokeWidth={3} />
</>);
const glue = s(36, 76, <>
  <path d="M10 2h16l-2 14H12Z" fill={C.orange} />
  <path d="M8 16h20l2 54q0 4-4 4H10q-4 0-4-4Z" fill={C.white} />
  <rect x="9" y="30" width="18" height="20" rx="4" fill={C.blue} strokeWidth={2.5} />
  <path d="M14 40h8" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const paintbrush = s(100, 30, <>
  <path d="M30 15h66" fill="none" strokeWidth={8} />
  <path d="M30 15h66" fill="none" stroke={C.wood} strokeWidth={4} />
  <rect x="26" y="9" width="12" height="12" rx="2" fill={C.grey} />
  <path d="M4 15q4-10 22-6v12q-18 4-22-6Z" fill={C.red} />
</>);
const dnd = s(46, 70, <>
  <path d="M23 2v10" fill="none" strokeWidth={4} />
  <rect x="4" y="12" width="38" height="52" rx="6" fill={C.red} />
  <circle cx="23" cy="32" r="12" fill={C.white} strokeWidth={2.500} />
  <path d="M15 40L31 24" fill="none" stroke={C.red} strokeWidth={4} />
  <path d="M14 54h18" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const bathrobe = s(70, 96, <>
  <path d="M22 4h26l14 24-8 6-4-10v66H20V24l-4 10-8-6Z" fill={C.white} />
  <path d="M22 4l13 40 13-40" fill="none" strokeWidth={3} />
  <path d="M20 58h30" fill="none" stroke={C.blue} strokeWidth={5} />
  <circle cx="28" cy="62" r="2" fill={INK} stroke="none" />
</>);
const waterdispenser = s(60, 110, <>
  <rect x="8" y="30" width="44" height="76" rx="6" fill={C.white} />
  <ellipse cx="30" cy="16" rx="18" ry="12" fill={C.blueL} />
  <rect x="16" y="46" width="12" height="10" rx="2" fill={C.blue} strokeWidth={2.500} />
  <rect x="32" y="46" width="12" height="10" rx="2" fill={C.red} strokeWidth={2.500} />
  <rect x="18" y="70" width="24" height="10" rx="3" fill={C.grey} strokeWidth={2.500} />
</>);
const mouse = s(40, 56, <>
  <path d="M20 4C6 4 4 20 4 34c0 14 8 20 16 20s16-6 16-20C36 20 34 4 20 4Z" fill={C.greyD} />
  <path d="M20 4v24M4 28h32" fill="none" strokeWidth={2.500} />
  <rect x="16" y="12" width="8" height="12" rx="4" fill={C.cream} strokeWidth={2.500} />
  <circle cx="12" cy="20" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const keyboard = s(100, 40, <>
  <rect x="4" y="6" width="92" height="30" rx="6" fill={C.greyD} />
  {[14, 28, 42, 56, 70, 84].map((x) => <rect key={x} x={x - 5} y="11" width="10" height="7" rx="2" fill={C.cream} strokeWidth={1.800} />)}
  <rect x="22" y="23" width="56" height="8" rx="3" fill={C.cream} strokeWidth={1.800} />
</>);
const tofu = s(60, 44, <>
  <path d="M6 14l10-8h38l0 24-10 10H6Z" fill={C.cream} />
  <path d="M16 6l-10 8M54 6l-10 8M44 30V14" fill="none" strokeWidth={2.500} />
  <path d="M6 14h38v26H6Z" fill={C.white} />
  <circle cx="18" cy="28" r="2" fill={C.woodL} stroke="none" />
</>);
const swing = s(90, 100, <>
  <path d="M8 96L34 6M82 96L56 6" fill="none" strokeWidth={6} />
  <path d="M30 14h30" fill="none" strokeWidth={6} />
  <path d="M34 16l-6 56M56 16l6 56" fill="none" strokeWidth={3} />
  <rect x="22" y="70" width="46" height="9" rx="4" fill={C.red} />
</>);
const butterfly = s(60, 50, <>
  <path d="M30 24C14 2 2 8 6 24c2 12 14 10 24 0Z" fill={C.pink} />
  <path d="M30 24C46 2 58 8 54 24c-2 12-14 10-24 0Z" fill={C.blueL} />
  <rect x="28" y="12" width="5" height="30" rx="2.500" fill={C.brown} />
  <path d="M29 12q-6-8-10-8M32 12q6-8 10-8" fill="none" strokeWidth={2.500} />
</>);
const picnicmat = s(100, 46, <>
  <path d="M6 40L20 8h64l12 32Z" fill={C.red} />
  <path d="M26 8l-10 32M46 8l-4 32M66 8l4 32M84 8l8 32M12 24h78" fill="none" stroke={C.white} strokeWidth={3} />
  <circle cx="50" cy="24" r="6" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="30" cy="16" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const teapot = s(74, 56, <>
  <path d="M54 22q16 2 12 16" fill="none" strokeWidth={5} />
  <path d="M10 30q0-18 26-18t26 18q0 20-26 20T10 30Z" fill={C.teal} />
  <path d="M10 28q-6-6-4-12" fill="none" strokeWidth={5} />
  <rect x="26" y="6" width="20" height="8" rx="4" fill={C.greyD} strokeWidth={2.500} />
  <path d="M20 30h32" fill="none" stroke={C.cream} strokeWidth={3} />
</>);
const net = s(120, 70, <>
  <path d="M6 66V8h108v58" fill="none" strokeWidth={5} />
  <path d="M8 8h104M8 24h104M8 40h104M8 56h104M28 8v58M50 8v58M72 8v58M94 8v58" fill="none" strokeWidth={1.600} opacity={0.7} />
  <rect x="2" y="4" width="116" height="8" rx="4" fill={C.white} />
  <circle cx="60" cy="38" r="4" fill={C.white} stroke="none" opacity={0} />
</>);
const redcard = s(40, 56, <>
  <rect x="6" y="4" width="28" height="46" rx="5" fill={C.red} />
  <path d="M12 12l16 16M28 12L12 28" fill="none" stroke={C.white} strokeWidth={4} />
  <path d="M12 40h16" fill="none" stroke={C.cream} strokeWidth={3} />
  <circle cx="20" cy="8" r="1.500" fill={C.white} stroke="none" />
</>);
const surfboard = s(40, 110, <>
  <path d="M20 4C2 24 4 84 20 106 36 84 38 24 20 4Z" fill={C.orange} />
  <path d="M20 8v96" fill="none" stroke={C.cream} strokeWidth={4} />
  <path d="M10 40q10 6 20 0M10 70q10 6 20 0" fill="none" strokeWidth={2.500} />
  <circle cx="20" cy="94" r="3" fill={C.cream} strokeWidth={2} />
</>);

export const VENUE2C_SPRITES: Record<string, FlatSprite> = { ticketmachine, turnstile, crutches, nursecap, bpmonitor, stretcher, bookend, quietsign, highlighter, toast, baguette, flour, rollingpin, ladle, spatula, oil, garlic, dinosaur, barrier, lantern, seatbelt, glue, paintbrush, dnd, bathrobe, waterdispenser, mouse, keyboard, tofu, swing, butterfly, picnicmat, teapot, net, redcard, surfboard };
