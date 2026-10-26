import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ riêng của Phòng tập thể hình và Hiệu cắt tóc.
const dumbbell = s(76, 40, <>
  <rect x="4" y="8" width="12" height="24" rx="4" fill={C.greyD} />
  <rect x="60" y="8" width="12" height="24" rx="4" fill={C.greyD} />
  <rect x="16" y="14" width="44" height="12" rx="4" fill={C.grey} />
  <rect x="14" y="4" width="8" height="32" rx="3" fill={C.grey} strokeWidth={2.5} />
  <rect x="54" y="4" width="8" height="32" rx="3" fill={C.grey} strokeWidth={2.5} />
</>);
const treadmill = s(110, 90, <>
  <path d="M86 6L78 52" fill="none" strokeWidth={6} />
  <rect x="70" y="2" width="28" height="12" rx="4" fill={C.greyD} />
  <path d="M6 66h92l-8-18H18Z" fill={C.greyD} />
  <rect x="10" y="60" width="88" height="14" rx="6" fill={C.grey} />
  <circle cx="20" cy="82" r="6" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="88" cy="82" r="6" fill={C.greyD} strokeWidth={2.5} />
</>);
const yogamat = s(100, 40, <>
  <rect x="4" y="12" width="92" height="22" rx="8" fill={C.teal} />
  <ellipse cx="14" cy="23" rx="9" ry="11" fill={C.greenD} />
  <path d="M30 18h54M30 28h40" fill="none" stroke={C.cream} strokeWidth={2.5} />
  <circle cx="14" cy="23" r="4" fill={C.teal} strokeWidth={2} />
</>);
const waterbottle = s(34, 80, <>
  <rect x="10" y="4" width="14" height="12" rx="3" fill={C.red} />
  <path d="M6 16h22v54q0 6-6 6H12q-6 0-6-6Z" fill={C.blueL} />
  <rect x="8" y="38" width="18" height="30" rx="4" fill={C.blue} stroke="none" />
  <path d="M10 24h14" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const jumprope = s(70, 80, <>
  <path d="M14 8q-6 50 18 62q24-12 18-62" fill="none" strokeWidth={4} />
  <rect x="8" y="2" width="12" height="22" rx="5" fill={C.red} />
  <rect x="44" y="2" width="12" height="22" rx="5" fill={C.red} />
  <path d="M10 10h8M46 10h8" fill="none" stroke={C.white} strokeWidth={2.5} />
</>);
const headphones = s(64, 60, <>
  <path d="M10 36q-2-30 22-30t22 30" fill="none" strokeWidth={6} />
  <rect x="4" y="30" width="16" height="26" rx="7" fill={C.red} />
  <rect x="44" y="30" width="16" height="26" rx="7" fill={C.red} />
  <path d="M10 38v12M54 38v12" fill="none" stroke={C.white} strokeWidth={2.5} />
</>);
const locker = s(66, 110, <>
  <rect x="4" y="4" width="58" height="102" rx="5" fill={C.blue} />
  <path d="M4 36h58M4 70h58" fill="none" strokeWidth={3} />
  <path d="M14 14h20M14 46h20M14 80h20" fill="none" stroke={C.white} strokeWidth={3} />
  <circle cx="50" cy="22" r="3" fill={C.yellow} strokeWidth={2} />
  <circle cx="50" cy="54" r="3" fill={C.yellow} strokeWidth={2} />
  <circle cx="50" cy="88" r="3" fill={C.yellow} strokeWidth={2} />
</>);
const punchingbag = s(56, 110, <>
  <path d="M28 4v18" fill="none" strokeWidth={4} />
  <rect x="8" y="20" width="40" height="76" rx="14" fill={C.red} />
  <rect x="8" y="46" width="40" height="8" fill={C.redD} stroke="none" />
  <path d="M8 46h40M8 54h40" fill="none" strokeWidth={2.5} />
  <ellipse cx="28" cy="102" rx="14" ry="5" fill={C.grey} strokeWidth={0} />
</>);
const barbell = s(116, 52, <>
  <rect x="4" y="6" width="10" height="40" rx="4" fill={C.greyD} />
  <rect x="16" y="12" width="10" height="28" rx="4" fill={C.grey} />
  <rect x="26" y="22" width="64" height="8" rx="3" fill={C.grey} />
  <rect x="90" y="12" width="10" height="28" rx="4" fill={C.grey} />
  <rect x="102" y="6" width="10" height="40" rx="4" fill={C.greyD} />
</>);
const protein = s(54, 70, <>
  <rect x="6" y="14" width="42" height="52" rx="9" fill={C.orange} />
  <rect x="4" y="4" width="46" height="14" rx="5" fill={C.greyD} />
  <rect x="12" y="28" width="30" height="22" rx="4" fill={C.cream} strokeWidth={2.5} />
  <path d="M18 38h18" fill="none" strokeWidth={3} />
</>);
const scissors = s(60, 76, <>
  <circle cx="16" cy="62" r="9" fill="none" strokeWidth={5} />
  <circle cx="44" cy="62" r="9" fill="none" strokeWidth={5} />
  <path d="M20 54L44 6M40 54L16 6" fill="none" strokeWidth={6} />
  <path d="M20 54L44 6M40 54L16 6" fill="none" stroke={C.grey} strokeWidth={3} />
</>);
const comb = s(80, 34, <>
  <rect x="4" y="4" width="72" height="14" rx="5" fill={C.pink} />
  {[10, 18, 26, 34, 42, 50, 58, 66].map((x) => <rect key={x} x={x} y="18" width="4" height="12" rx="1.5" fill={C.pink} strokeWidth={2} />)}
  <path d="M12 10h56" fill="none" stroke={C.white} strokeWidth={2} />
</>);
const razor = s(70, 46, <>
  <rect x="6" y="16" width="30" height="16" rx="5" fill={C.greyD} />
  <path d="M34 12h30v22H34Z" fill={C.grey} />
  <path d="M38 18h22M38 26h22" fill="none" stroke={C.white} strokeWidth={2} />
  <circle cx="14" cy="24" r="3" fill={C.cream} strokeWidth={2} />
</>);
const conditioner = s(44, 76, <>
  <rect x="12" y="2" width="20" height="14" rx="4" fill={C.pink} />
  <path d="M6 16h32v50q0 8-8 8H14q-8 0-8-8Z" fill={C.cream} />
  <rect x="9" y="30" width="26" height="26" rx="5" fill={C.pink} strokeWidth={2.5} />
  <path d="M22 36l4 6h-8Z" fill={C.white} strokeWidth={2} />
</>);
const cape = s(90, 90, <>
  <path d="M30 6h30l22 74H8Z" fill={C.teal} />
  <path d="M30 6q15 14 30 0" fill="none" strokeWidth={3} />
  <path d="M18 44q27 10 54 0" fill="none" stroke={C.white} strokeWidth={3} />
  <circle cx="45" cy="10" r="3" fill={C.yellow} strokeWidth={2} />
</>);
const hairpin = s(60, 30, <>
  <path d="M6 6h38q10 0 10 9t-10 9H6" fill="none" strokeWidth={5} />
  <circle cx="48" cy="15" r="9" fill={C.pink} />
  <circle cx="48" cy="15" r="4" fill={C.yellow} strokeWidth={2} />
  <circle cx="18" cy="10" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const wig = s(70, 80, <>
  <path d="M10 42Q6 8 35 6t25 36l-6 30q-8-20-6-34-18 4-30-6-4 18-8 40Z" fill={C.orange} />
  <ellipse cx="35" cy="44" rx="18" ry="10" fill={C.cream} strokeWidth={2.5} />
  <path d="M20 14q10-6 20 0" fill="none" stroke={C.yellow} strokeWidth={3} />
  <circle cx="21" cy="28" r="2.2" fill={C.white} stroke="none" opacity={0.8} />
</>);
const hairspray = s(40, 82, <>
  <rect x="10" y="2" width="20" height="14" rx="4" fill={C.greyD} />
  <path d="M6 16h28v58q0 6-6 6H12q-6 0-6-6Z" fill={C.blue} />
  <rect x="9" y="32" width="22" height="24" rx="4" fill={C.white} strokeWidth={2.5} />
  <path d="M16 44h8" fill="none" strokeWidth={3} />
</>);
const clippers = s(48, 84, <>
  <rect x="8" y="22" width="32" height="56" rx="10" fill={C.greyD} />
  <path d="M10 22V10h28v12" fill={C.grey} />
  <path d="M14 10v-6M20 10v-6M26 10v-6M32 10v-6" fill="none" strokeWidth={3} />
  <circle cx="24" cy="46" r="5" fill={C.red} strokeWidth={2.5} />
</>);
const hairbrush = s(80, 46, <>
  <ellipse cx="22" cy="23" rx="18" ry="16" fill={C.woodD} />
  <path d="M38 23h38" fill="none" strokeWidth={9} />
  <path d="M38 23h38" fill="none" stroke={C.wood} strokeWidth={5} />
  {[12, 20, 28].map((x) => <circle key={x} cx={x} cy="23" r="2.200" fill={C.cream} strokeWidth={1.800} />)}
</>);
const rubberband = s(50, 46, <>
  <circle cx="25" cy="23" r="18" fill="none" strokeWidth={8} />
  <circle cx="25" cy="23" r="18" fill="none" stroke={C.pink} strokeWidth={4} />
  <circle cx="25" cy="23" r="9" fill="none" strokeWidth={2.5} />
  <circle cx="25" cy="5" r="3" fill={C.yellow} strokeWidth={2.500} />
</>);

export const VENUE2B_SPRITES: Record<string, FlatSprite> = { dumbbell, treadmill, yogamat, waterbottle, jumprope, headphones, locker, punchingbag, barbell, protein, scissors, comb, razor, conditioner, cape, hairpin, wig, hairspray, clippers, hairbrush, rubberband };
