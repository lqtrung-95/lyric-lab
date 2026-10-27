import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Tiệm thú cưng
const dogfood = s(70, 96, <>
  <path d="M10 14q25-8 50 0l4 76q-29 8-58 0Z" fill={C.brown} />
  <circle cx="35" cy="48" r="16" fill={C.cream} />
  <path d="M26 40q2-8 6-4M44 40q-2-8-6-4" fill="none" strokeWidth={3} />
  <path d="M28 52q7 6 14 0" fill="none" strokeWidth={2.500} />
  <path d="M10 14q25 6 50 0" fill="none" strokeWidth={3} />
</>);
const leash = s(100, 70, <>
  <circle cx="22" cy="30" r="16" fill="none" strokeWidth={7} stroke={C.red} />
  <path d="M36 38q20 24 44 4" fill="none" strokeWidth={6} stroke={C.red} />
  <circle cx="84" cy="40" r="6" fill={C.yellow} />
  <path d="M10 22l6 6" fill="none" strokeWidth={3} stroke={C.cream} />
</>);
const collar = s(90, 60, <>
  <path d="M8 22q37-16 74 0v18q-37 16-74 0Z" fill={C.blue} />
  <path d="M8 31q37 16 74 0" fill="none" strokeWidth={2.500} stroke={C.blueL} />
  <circle cx="45" cy="52" r="8" fill={C.yellow} />
  <path d="M42 52h6" fill="none" strokeWidth={2.500} />
</>);
const catlitter = s(100, 70, <>
  <path d="M6 28h88l-8 38H14Z" fill={C.cream} />
  <path d="M6 28h88" fill="none" strokeWidth={4} />
  <path d="M22 28q10-16 22 0M56 28q8-12 18 0" fill="none" strokeWidth={3} stroke={C.greyD} />
  <circle cx="30" cy="48" r="3" fill={C.grey} stroke="none" /><circle cx="52" cy="54" r="3" fill={C.grey} stroke="none" /><circle cx="70" cy="46" r="3" fill={C.grey} stroke="none" />
</>);
const teaser = s(90, 100, <>
  <path d="M74 8L22 78" fill="none" strokeWidth={5} stroke={C.woodD} />
  <path d="M22 78q-12 6-4 16" fill="none" strokeWidth={2.500} />
  <circle cx="16" cy="92" r="9" fill={C.pink} />
  <path d="M8 88l-6-6M12 100l-6 6M22 98l4 6" fill="none" strokeWidth={3} stroke={C.red} />
</>);
const hamster = s(80, 70, <>
  <ellipse cx="40" cy="42" rx="30" ry="24" fill={C.wood} />
  <circle cx="18" cy="22" r="8" fill={C.wood} /><circle cx="62" cy="22" r="8" fill={C.wood} />
  <ellipse cx="40" cy="48" rx="16" ry="12" fill={C.cream} />
  <circle cx="30" cy="38" r="2.500" fill={INK} stroke="none" /><circle cx="50" cy="38" r="2.500" fill={INK} stroke="none" />
  <path d="M36 46h8" fill="none" strokeWidth={3} />
</>);
const fishfood = s(60, 70, <>
  <rect x="10" y="14" width="40" height="52" rx="8" fill={C.orange} />
  <rect x="16" y="6" width="28" height="12" rx="3" fill={C.greyD} />
  <path d="M20 38q10-10 20 0-10 10-20 0ZM40 38l8-6v12Z" fill={C.cream} strokeWidth={2.500} />
  <circle cx="26" cy="36" r="1.500" fill={INK} stroke="none" />
</>);
const fishtank = s(150, 100, <>
  <rect x="6" y="14" width="138" height="78" rx="8" fill={C.blueL} />
  <path d="M6 30h138" fill="none" strokeWidth={3} stroke={C.blue} />
  <path d="M12 82h126" fill="none" strokeWidth={8} stroke={C.yellow} />
  <path d="M40 54q12-12 24 0-12 12-24 0ZM64 54l10-8v16Z" fill={C.orange} strokeWidth={2.500} />
  <path d="M100 66q8-8 16 0-8 8-16 0ZM116 66l7-5v10Z" fill={C.red} strokeWidth={2.500} />
  <path d="M120 82q-2-20 4-30M128 82q2-14-2-22" fill="none" strokeWidth={3} stroke={C.green} />
  <circle cx="90" cy="40" r="3" fill={C.white} strokeWidth={2} />
</>);
const cattree = s(100, 150, <>
  <rect x="38" y="26" width="24" height="108" rx="4" fill={C.woodL} />
  <path d="M38 50h24M38 74h24M38 98h24M38 122h24" fill="none" strokeWidth={2.500} stroke={C.woodD} />
  <rect x="10" y="14" width="80" height="14" rx="7" fill={C.pink} />
  <rect x="14" y="70" width="48" height="12" rx="6" fill={C.pink} />
  <rect x="6" y="134" width="88" height="12" rx="6" fill={C.brown} />
  <path d="M62 112h18v14H62Z" fill={C.cream} />
</>);
const petbowl = s(80, 50, <>
  <path d="M6 16h68l-8 30H14Z" fill={C.teal} />
  <path d="M6 16h68" fill="none" strokeWidth={4} />
  <path d="M20 12q8-8 16 0M44 12q8-8 16 0" fill="none" strokeWidth={3} stroke={C.brown} />
  <path d="M30 30l6 4 6-4" fill="none" strokeWidth={2.500} stroke={C.cream} />
</>);
const petcarrier = s(110, 90, <>
  <rect x="6" y="18" width="98" height="64" rx="12" fill={C.blue} />
  <rect x="18" y="28" width="52" height="44" rx="6" fill={C.blueL} />
  <path d="M30 28v44M42 28v44M54 28v44" fill="none" strokeWidth={2.500} />
  <path d="M30 18q25-18 50 0" fill="none" strokeWidth={5} stroke={C.greyD} />
  <circle cx="86" cy="50" r="6" fill={C.yellow} strokeWidth={2.500} />
</>);

// ── Phòng khám nha khoa
const toothbrush = s(100, 60, <>
  <rect x="8" y="26" width="70" height="12" rx="6" fill={C.blue} />
  <rect x="72" y="20" width="22" height="24" rx="6" fill={C.cream} />
  <path d="M76 20v-10M82 20v-12M88 20v-10" fill="none" strokeWidth={4} stroke={C.red} />
  <path d="M16 32h40" fill="none" strokeWidth={2.500} stroke={C.blueL} />
</>);
const toothpaste = s(110, 54, <>
  <path d="M10 14h70l14 8v10l-14 8H10Z" fill={C.green} />
  <rect x="94" y="19" width="14" height="16" rx="3" fill={C.cream} />
  <path d="M22 27h46" fill="none" strokeWidth={4} stroke={C.white} />
  <path d="M10 14l-4 -4v34l4 -4" fill="none" strokeWidth={3} />
</>);
const floss = s(80, 70, <>
  <rect x="10" y="8" width="52" height="52" rx="10" fill={C.cream} />
  <rect x="18" y="16" width="36" height="36" rx="6" fill={C.blueL} />
  <path d="M62 38q14 4 12 18" fill="none" strokeWidth={3} stroke={C.white} />
  <path d="M26 30h20M26 40h20" fill="none" strokeWidth={3} stroke={C.blue} />
</>);
const tooth = s(80, 90, <>
  <path d="M14 22q0-14 16-14 10 0 10 6 0-6 10-6 16 0 16 14 0 18-8 30-4 10-4 28-6 4-10-8-2-8-4-8-2 0-4 8-4 12-10 8 0-18-4-28-8-12-8-30Z" fill={C.white} />
  <path d="M24 22q4-8 12-6" fill="none" strokeWidth={3} stroke={C.blueL} />
  <path d="M32 40q8 6 16 0" fill="none" strokeWidth={2.500} />
  <circle cx="30" cy="28" r="2.500" fill={INK} stroke="none" /><circle cx="50" cy="28" r="2.500" fill={INK} stroke="none" />
</>);
const braces = s(110, 64, <>
  <path d="M8 40q47 26 94 0" fill="none" strokeWidth={6} stroke={C.white} />
  <path d="M8 40q47 26 94 0" fill="none" strokeWidth={3} stroke={C.greyD} />
  <rect x="14" y="30" width="14" height="14" rx="3" fill={C.cream} /><rect x="38" y="38" width="14" height="14" rx="3" fill={C.cream} /><rect x="58" y="38" width="14" height="14" rx="3" fill={C.cream} /><rect x="82" y="30" width="14" height="14" rx="3" fill={C.cream} />
  <circle cx="21" cy="37" r="2.500" fill={C.red} strokeWidth={1.500} /><circle cx="89" cy="37" r="2.500" fill={C.blue} strokeWidth={1.500} />
</>);
const rinsecup = s(60, 80, <>
  <path d="M8 12h44l-6 62H14Z" fill={C.blueL} />
  <path d="M8 12h44" fill="none" strokeWidth={4} />
  <path d="M14 30h32" fill="none" strokeWidth={3} stroke={C.blue} />
  <path d="M40 4l10-4" fill="none" strokeWidth={3} stroke={C.red} />
  <path d="M18 44q12 6 24 0" fill="none" strokeWidth={2.500} stroke={C.white} />
</>);
const dentalmirror = s(100, 90, <>
  <circle cx="70" cy="28" r="20" fill={C.blueL} />
  <path d="M60 20q4-6 10-4" fill="none" strokeWidth={3} stroke={C.white} />
  <path d="M56 42L16 80" fill="none" strokeWidth={7} stroke={C.grey} />
  <path d="M56 42L16 80" fill="none" strokeWidth={3} stroke={C.white} />
  <circle cx="14" cy="82" r="6" fill={C.greyD} />
</>);
const xray = s(100, 80, <>
  <rect x="6" y="6" width="88" height="68" rx="6" fill="#33445c" />
  <path d="M20 24q4 24 8 24 3 0 4-10 2-8 4 0 2 10 6 10 6 0 8-24-8-6-14 0-6-6-16 0Z" fill={C.white} strokeWidth={2.500} />
  <path d="M60 30q4 18 8 18 3 0 4-8 2-6 4 0 2 8 6 8 5 0 6-18-6-4-10 0-6-4-18 0Z" fill={C.cream} strokeWidth={2.500} />
  <path d="M10 66h80" fill="none" strokeWidth={3} stroke={C.blueL} />
</>);
const dentalchair = s(130, 110, <>
  <rect x="26" y="8" width="26" height="62" rx="12" fill={C.teal} />
  <path d="M40 60h66q14 0 14 14v6H40Z" fill={C.teal} />
  <rect x="22" y="2" width="34" height="14" rx="7" fill={C.blueL} />
  <path d="M60 80v18M30 80v18M20 100h80" fill="none" strokeWidth={6} stroke={C.greyD} />
  <path d="M96 60V40l10-6" fill="none" strokeWidth={5} stroke={C.grey} />
</>);
const surgerylamp = s(120, 110, <>
  <path d="M60 0v34" fill="none" strokeWidth={6} stroke={C.greyD} />
  <path d="M60 34L96 54" fill="none" strokeWidth={6} stroke={C.greyD} />
  <ellipse cx="100" cy="68" rx="20" ry="14" fill={C.cream} />
  <ellipse cx="100" cy="68" rx="12" ry="8" fill={C.yellow} strokeWidth={2.500} />
  <path d="M92 88l-12 18M108 88l12 18M96 92l-2 16" fill="none" strokeWidth={3} stroke={C.yellow} />
</>);
const drill = s(110, 70, <>
  <path d="M10 38q30-26 62-10l24-4v18l-24 2q-32 12-62-6Z" fill={C.grey} />
  <path d="M96 24l12-4v26l-12-4" fill={C.greyD} />
  <rect x="86" y="20" width="10" height="30" rx="3" fill={C.red} />
  <path d="M14 38q30 14 56 2" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const instrtray = s(120, 56, <>
  <path d="M6 20h108l-8 30H14Z" fill={C.grey} />
  <path d="M6 20h108" fill="none" strokeWidth={4} />
  <path d="M26 30l28-6M60 28h30M96 32l8-6" fill="none" strokeWidth={4} stroke={C.white} />
  <circle cx="34" cy="40" r="4" fill={C.blueL} strokeWidth={2} />
</>);

export const VENUE10_SPRITES: Record<string, FlatSprite> = {
  dogfood, leash, collar, catlitter, teaser, hamster, fishfood, fishtank, cattree, petbowl, petcarrier,
  toothbrush, toothpaste, floss, tooth, braces, rinsecup, dentalmirror, xray, dentalchair, surgerylamp, drill, instrtray,
};
