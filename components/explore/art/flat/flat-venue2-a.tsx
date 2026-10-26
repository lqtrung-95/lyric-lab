import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ riêng của Ngân hàng và Rạp chiếu phim.
const bankcard = s(64, 42, <>
  <rect x="4" y="4" width="56" height="34" rx="6" fill={C.blue} />
  <rect x="10" y="12" width="14" height="10" rx="2" fill={C.yellow} strokeWidth={2.5} />
  <path d="M10 30h26M42 30h12" fill="none" stroke={C.white} strokeWidth={3} />
  <circle cx="48" cy="14" r="5" fill={C.red} strokeWidth={2} />
</>);
const atm = s(70, 110, <>
  <rect x="6" y="4" width="58" height="102" rx="8" fill={C.greyD} />
  <rect x="14" y="12" width="42" height="28" rx="3" fill={C.greenL} strokeWidth={2.5} />
  <rect x="16" y="50" width="38" height="22" rx="3" fill={C.grey} strokeWidth={2.5} />
  <rect x="20" y="82" width="30" height="8" rx="3" fill={C.cream} strokeWidth={2.5} />
  <circle cx="35" cy="96" r="3" fill={C.red} strokeWidth={2} />
</>);
const cash = s(66, 44, <>
  <rect x="4" y="8" width="58" height="30" rx="3" fill={C.greenL} />
  <rect x="10" y="14" width="46" height="18" rx="2" fill={C.green} strokeWidth={2.5} />
  <circle cx="33" cy="23" r="6" fill={C.cream} strokeWidth={2.5} />
  <path d="M8 4h54" fill="none" strokeWidth={3} />
</>);
const safe = s(80, 86, <>
  <rect x="6" y="6" width="68" height="72" rx="6" fill={C.greyD} />
  <rect x="14" y="14" width="52" height="56" rx="4" fill={C.grey} strokeWidth={2.5} />
  <circle cx="40" cy="42" r="13" fill={C.white} />
  <path d="M40 42l7-5M40 32v-4M40 52v4M30 42h-4M50 42h4" fill="none" strokeWidth={2.5} />
</>);
const cheque = s(70, 38, <>
  <rect x="4" y="4" width="62" height="30" rx="3" fill={C.white} />
  <path d="M10 14h36M10 22h24" fill="none" strokeWidth={2.5} />
  <rect x="46" y="10" width="16" height="9" rx="2" fill={C.blueL} strokeWidth={2} />
  <path d="M40 28q8-8 18 0" fill="none" strokeWidth={2.5} />
</>);
const wallet = s(60, 46, <>
  <rect x="4" y="8" width="52" height="34" rx="7" fill={C.brown} />
  <rect x="34" y="18" width="22" height="14" rx="5" fill={C.wood} strokeWidth={2.5} />
  <circle cx="44" cy="25" r="3" fill={C.yellow} strokeWidth={2} />
  <path d="M10 8l6-4h28l4 4" fill="none" strokeWidth={2.5} />
</>);
const queueticket = s(46, 56, <>
  <path d="M6 4h34v44l-5 4-6-4-6 4-6-4-6 4-5-4Z" fill={C.cream} />
  <circle cx="23" cy="20" r="9" fill={C.orange} strokeWidth={2.5} />
  <path d="M10 38h26" fill="none" strokeWidth={2.5} />
  <circle cx="14" cy="20" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const stamp = s(46, 62, <>
  <rect x="8" y="46" width="30" height="12" rx="3" fill={C.red} />
  <rect x="16" y="22" width="14" height="26" rx="3" fill={C.brown} />
  <ellipse cx="23" cy="14" rx="12" ry="11" fill={C.brown} />
  <path d="M12 52h22" fill="none" stroke={C.cream} strokeWidth={2.5} />
</>);
const posmachine = s(50, 74, <>
  <rect x="6" y="4" width="38" height="66" rx="7" fill={C.greyD} />
  <rect x="11" y="10" width="28" height="14" rx="2" fill={C.greenL} strokeWidth={2.5} />
  {[34, 44, 54].map((y) => [14, 25, 36].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill={C.cream} strokeWidth={1.800} />))}
</>);
const passbook = s(46, 60, <>
  <rect x="6" y="4" width="34" height="52" rx="4" fill={C.red} />
  <rect x="12" y="12" width="22" height="14" rx="2" fill={C.cream} strokeWidth={2.5} />
  <path d="M12 36h22M12 44h14" fill="none" stroke={C.cream} strokeWidth={3} />
  <circle cx="14" cy="21" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const lock = s(46, 62, <>
  <path d="M12 28V18q0-12 11-12t11 12v10" fill="none" strokeWidth={5} />
  <rect x="6" y="26" width="34" height="30" rx="6" fill={C.yellow} />
  <circle cx="23" cy="38" r="4" fill={INK} stroke="none" />
  <path d="M23 40v8" fill="none" strokeWidth={3} />
</>);
const coinpurse = s(56, 54, <>
  <path d="M8 18q-2 32 20 34t20-34Z" fill={C.pink} />
  <path d="M10 14h36l-4 6H14Z" fill={C.redD} />
  <circle cx="28" cy="34" r="7" fill={C.yellow} strokeWidth={2.5} />
  <path d="M16 12q12-10 24 0" fill="none" strokeWidth={3} />
</>);
const popcorn = s(54, 76, <>
  <path d="M8 26h38l-5 46H13Z" fill={C.red} />
  <path d="M18 26l2 46M28 26v46M38 26l-2 46" fill="none" stroke={C.white} strokeWidth={4} />
  <circle cx="16" cy="18" r="9" fill={C.cream} />
  <circle cx="28" cy="12" r="10" fill={C.white} />
  <circle cx="40" cy="19" r="9" fill={C.cream} />
</>);
const screen = s(130, 70, <>
  <rect x="4" y="4" width="122" height="62" rx="4" fill={C.greyD} />
  <rect x="10" y="10" width="110" height="50" rx="2" fill={C.blueL} strokeWidth={2.5} />
  <path d="M10 46q28-24 52-8t58-6v28H10Z" fill={C.green} strokeWidth={2.5} />
  <circle cx="92" cy="26" r="8" fill={C.yellow} strokeWidth={2.5} />
</>);
const seat = s(60, 76, <>
  <rect x="10" y="4" width="40" height="40" rx="10" fill={C.red} />
  <rect x="4" y="38" width="52" height="22" rx="8" fill={C.redD} />
  <rect x="2" y="26" width="10" height="26" rx="4" fill={C.redD} />
  <rect x="48" y="26" width="10" height="26" rx="4" fill={C.redD} />
  <rect x="24" y="60" width="12" height="12" fill={C.greyD} />
</>);
const cola = s(40, 76, <>
  <path d="M6 12h28l-3 56q0 4-4 4H13q-4 0-4-4Z" fill={C.red} />
  <rect x="4" y="6" width="32" height="8" rx="3" fill={C.white} />
  <path d="M20 6V0l8-2" fill="none" strokeWidth={3} />
  <ellipse cx="20" cy="40" rx="10" ry="12" fill={C.white} strokeWidth={2.5} />
</>);
const poster = s(60, 86, <>
  <rect x="4" y="4" width="52" height="78" rx="3" fill={C.orange} />
  <rect x="10" y="10" width="40" height="36" rx="2" fill={C.blueL} strokeWidth={2.5} />
  <circle cx="30" cy="28" r="9" fill={C.yellow} strokeWidth={2.5} />
  <path d="M12 58h36M12 68h24" fill="none" stroke={C.cream} strokeWidth={4} />
</>);
const projector = s(80, 56, <>
  <rect x="4" y="14" width="56" height="34" rx="6" fill={C.greyD} />
  <circle cx="68" cy="30" r="9" fill={C.grey} />
  <circle cx="68" cy="30" r="4" fill={C.yellow} strokeWidth={2} />
  <circle cx="20" cy="8" r="7" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="44" cy="8" r="7" fill={C.greyD} strokeWidth={2.5} />
</>);
const curtain = s(90, 110, <>
  <path d="M4 6h82v10H4Z" fill={C.woodD} />
  <path d="M6 16q10 30 4 90h28q-6-60 4-90Z" fill={C.red} />
  <path d="M84 16q-10 30-4 90H52q6-60-4-90Z" fill={C.red} />
  <path d="M20 20v82M70 20v82" fill="none" stroke={C.redD} strokeWidth={3} />
</>);
const candy = s(60, 36, <>
  <path d="M4 8l12 10L4 28ZM56 8L44 18l12 10Z" fill={C.pink} />
  <ellipse cx="30" cy="18" rx="16" ry="12" fill={C.red} />
  <path d="M20 12q10 10 20 0" fill="none" stroke={C.white} strokeWidth={3} />
  <circle cx="18" cy="13" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const camera = s(80, 70, <>
  <rect x="6" y="18" width="52" height="40" rx="7" fill={C.greyD} />
  <path d="M58 30l16-10v34L58 44Z" fill={C.grey} />
  <circle cx="22" cy="10" r="8" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="42" cy="10" r="8" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="30" cy="38" r="10" fill={C.blueL} strokeWidth={2.5} />
</>);
const clapperboard = s(70, 62, <>
  <rect x="4" y="22" width="62" height="36" rx="3" fill={C.greyD} />
  <path d="M4 10l62-6 2 14-62 6Z" fill={C.white} />
  <path d="M14 8l8 14M30 6l8 14M46 4l8 14" fill="none" strokeWidth={4} />
  <path d="M12 36h46M12 46h30" fill="none" stroke={C.cream} strokeWidth={3} />
</>);

export const VENUE2A_SPRITES: Record<string, FlatSprite> = { bankcard, atm, cash, safe, cheque, wallet, queueticket, stamp, posmachine, passbook, lock, coinpurse, popcorn, screen, seat, cola, poster, projector, curtain, candy, camera, clapperboard };
