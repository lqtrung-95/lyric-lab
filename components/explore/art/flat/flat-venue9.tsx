import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Hình riêng cho các từ trước đây dùng chung hình với từ khác trong cùng một cảnh (bếp, bưu điện, hiệu thuốc, cửa hàng điện thoại, tàu điện ngầm).

// ── Bếp: chảo xào (khác nồi)
const wok = s(110, 70, <>
  <path d="M8 24h94q-4 34-47 38Q12 58 8 24Z" fill={C.greyD} />
  <path d="M8 24h94" fill="none" strokeWidth={4} />
  <path d="M102 28l18-8" fill="none" strokeWidth={8} stroke={C.brown} />
  <path d="M20 34q4 14 20 20" fill="none" stroke={C.grey} strokeWidth={4} />
  <circle cx="60" cy="40" r="4" fill={C.orange} strokeWidth={2} /><circle cx="74" cy="46" r="3" fill={C.green} strokeWidth={2} />
</>);

// ── Bưu điện
const mail = s(90, 66, <>
  <path d="M10 22l30-14 30 14v36H10Z" fill={C.white} />
  <path d="M26 14l30-8 22 14v38H30Z" fill={C.cream} />
  <path d="M40 30h28M40 40h20" fill="none" strokeWidth={3} stroke={C.greyD} />
  <rect x="52" y="10" width="14" height="12" rx="2" fill={C.red} strokeWidth={2} />
</>);
const waybill = s(70, 90, <>
  <rect x="8" y="6" width="54" height="78" rx="5" fill={C.white} />
  <rect x="16" y="14" width="38" height="10" rx="2" fill={C.blueL} strokeWidth={2} />
  <path d="M16 34h38M16 44h38M16 54h24" fill="none" strokeWidth={3} stroke={C.greyD} />
  <path d="M18 66v12M24 66v12M28 66v12M36 66v12M42 66v12M48 66v12" fill="none" strokeWidth={3} />
</>);
const label = s(80, 60, <>
  <path d="M6 12h56l14 18-14 18H6Z" fill={C.yellow} />
  <circle cx="18" cy="30" r="5" fill={C.cream} strokeWidth={2.500} />
  <path d="M30 24h26M30 34h18" fill="none" strokeWidth={3} stroke={C.orangeD} />
  <path d="M18 30Q4 22 2 8" fill="none" strokeWidth={2.500} stroke={C.greyD} />
</>);
const pobox = s(70, 110, <>
  <rect x="8" y="10" width="54" height="64" rx="6" fill={C.blue} />
  <rect x="16" y="24" width="38" height="8" rx="3" fill={C.greyD} strokeWidth={2.500} />
  <rect x="20" y="44" width="30" height="20" rx="3" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="35" cy="54" r="3" fill={C.yellow} strokeWidth={2} />
  <path d="M26 74v28M44 74v28M20 102h30" fill="none" strokeWidth={5} stroke={C.greyD} />
</>);

// ── Hiệu thuốc
const vitamin = s(64, 80, <>
  <rect x="10" y="18" width="44" height="58" rx="10" fill={C.orange} />
  <rect x="14" y="6" width="36" height="16" rx="4" fill={C.cream} />
  <rect x="18" y="34" width="28" height="26" rx="4" fill={C.cream} strokeWidth={2.500} />
  <path d="M24 47h16M32 40v14" fill="none" strokeWidth={4} stroke={C.orangeD} />
  <path d="M14 30q-2 14 0 30" fill="none" stroke={C.yellow} strokeWidth={3} />
</>);
const disinfectant = s(64, 100, <>
  <rect x="14" y="30" width="36" height="64" rx="8" fill={C.blueL} />
  <rect x="20" y="8" width="24" height="24" rx="4" fill={C.blue} />
  <path d="M44 14l16-4v10l-16 4" fill="none" strokeWidth={4} stroke={C.greyD} />
  <rect x="20" y="50" width="24" height="20" rx="3" fill={C.white} strokeWidth={2.500} />
  <path d="M32 54v12M26 60h12" fill="none" strokeWidth={4} stroke={C.red} />
  <path d="M60 22q4 6 0 8" fill="none" strokeWidth={3} stroke={C.blue} />
</>);

// ── Cửa hàng điện thoại
const powerbank = s(54, 90, <>
  <rect x="6" y="6" width="42" height="78" rx="9" fill={C.teal} />
  <rect x="12" y="14" width="30" height="8" rx="3" fill={C.cream} strokeWidth={2} />
  <path d="M24 38h6l-4 12h6l-10 18 3-14h-6Z" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="14" cy="76" r="2.500" fill={C.greenL} strokeWidth={1.500} /><circle cx="22" cy="76" r="2.500" fill={C.greenL} strokeWidth={1.500} /><circle cx="30" cy="76" r="2.500" fill={C.cream} strokeWidth={1.500} />
</>);

// ── Tàu điện ngầm
const exitsign = s(100, 56, <>
  <rect x="4" y="6" width="92" height="44" rx="8" fill={C.green} />
  <path d="M16 28h32M36 18l12 10-12 10" fill="none" strokeWidth={5} stroke={C.cream} />
  <rect x="58" y="16" width="30" height="24" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M65 40V26h16v14" fill="none" strokeWidth={3} stroke={C.greenD} />
</>);
const transfersign = s(100, 56, <>
  <rect x="4" y="6" width="92" height="44" rx="8" fill={C.orange} />
  <path d="M16 20h38l-8-8M54 36H16l8 8" fill="none" strokeWidth={5} stroke={C.cream} />
  <circle cx="72" cy="28" r="14" fill={C.cream} strokeWidth={2.500} />
  <path d="M72 28V20M72 28l6 4" fill="none" strokeWidth={3} stroke={C.orangeD} />
</>);
const carriage = s(140, 80, <>
  <rect x="6" y="8" width="128" height="58" rx="10" fill={C.blue} />
  <rect x="14" y="16" width="26" height="22" rx="3" fill={C.blueL} strokeWidth={2.500} /><rect x="48" y="16" width="26" height="22" rx="3" fill={C.blueL} strokeWidth={2.500} /><rect x="82" y="16" width="26" height="22" rx="3" fill={C.blueL} strokeWidth={2.500} />
  <path d="M6 46h128" fill="none" strokeWidth={3} stroke={C.cream} />
  <path d="M118 16v34M126 16v34" fill="none" strokeWidth={2.500} />
  <circle cx="30" cy="70" r="7" fill={C.greyD} strokeWidth={2.500} /><circle cx="110" cy="70" r="7" fill={C.greyD} strokeWidth={2.500} />
</>);

export const VENUE9_SPRITES: Record<string, FlatSprite> = {
  wok, mail, waybill, label, pobox, vitamin, disinfectant, powerbank, exitsign, transfersign, carriage,
};
