import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Đồn cảnh sát
const policecar = s(120, 70, <>
  <path d="M6 48q0-14 16-16l14-18h46l18 18q16 2 16 16v10H6Z" fill={C.white} />
  <rect x="6" y="40" width="108" height="10" fill={C.blue} stroke="none" />
  <path d="M42 18h18v14H30ZM66 18h12l14 14H66Z" fill={C.blueL} strokeWidth={2.500} />
  <rect x="52" y="6" width="20" height="8" rx="3" fill={C.red} strokeWidth={2.500} />
  <circle cx="34" cy="60" r="11" fill={INK} /><circle cx="92" cy="60" r="11" fill={INK} />
  <circle cx="34" cy="60" r="4.500" fill={C.grey} strokeWidth={2} /><circle cx="92" cy="60" r="4.500" fill={C.grey} strokeWidth={2} />
</>);
const handcuffs = s(90, 60, <>
  <circle cx="24" cy="34" r="18" fill="none" strokeWidth={8} />
  <circle cx="24" cy="34" r="18" fill="none" stroke={C.grey} strokeWidth={4} />
  <circle cx="66" cy="34" r="18" fill="none" strokeWidth={8} />
  <circle cx="66" cy="34" r="18" fill="none" stroke={C.grey} strokeWidth={4} />
  <rect x="38" y="28" width="14" height="12" rx="3" fill={C.greyD} />
  <path d="M24 12v-6M66 12v-6" fill="none" strokeWidth={4} />
</>);
const walkietalkie = s(50, 100, <>
  <path d="M14 4v22" fill="none" strokeWidth={6} />
  <rect x="6" y="24" width="38" height="72" rx="8" fill={C.greyD} />
  <rect x="12" y="32" width="26" height="16" rx="3" fill={C.greenL} strokeWidth={2.500} />
  <path d="M14 58h22M14 66h22M14 74h22" fill="none" stroke={C.grey} strokeWidth={3} />
  <circle cx="25" cy="86" r="4" fill={C.red} strokeWidth={2} />
</>);
const fingerprint = s(70, 80, <>
  <ellipse cx="35" cy="40" rx="28" ry="34" fill={C.cream} />
  <path d="M18 54q-2-24 17-26 18 2 14 26M24 56q-2-16 11-18 12 2 10 18M30 58q0-8 5-9 6 1 5 9" fill="none" strokeWidth={3} />
  <path d="M14 38q4-22 21-22" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
  <circle cx="35" cy="62" r="2.500" fill={C.greyD} stroke="none" />
</>);
const idcard = s(90, 60, <>
  <rect x="4" y="6" width="82" height="50" rx="7" fill={C.cream} />
  <rect x="10" y="14" width="26" height="30" rx="4" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="23" cy="24" r="5" fill={C.clay} strokeWidth={2} />
  <path d="M42 18h36M42 28h36M42 38h24" fill="none" strokeWidth={3} />
</>);
const policecap = s(90, 60, <>
  <path d="M8 40q0-26 37-26t37 26Z" fill={C.blue} />
  <rect x="4" y="38" width="82" height="10" rx="4" fill={C.greyD} />
  <path d="M30 40h30" fill="none" stroke={C.cream} strokeWidth={0} />
  <circle cx="45" cy="26" r="7" fill={C.yellow} strokeWidth={2.500} />
  <path d="M42 26l3-4 3 4-3 3Z" fill={C.red} stroke="none" />
</>);
const badge = s(70, 80, <>
  <path d="M35 4l8 10 13-2 1 13 11 7-8 10 4 12-13 2-8 10-8-10-13-2 4-12-8-10 11-7 1-13 13 2Z" fill={C.yellow} />
  <circle cx="35" cy="40" r="14" fill={C.blue} strokeWidth={2.500} />
  <path d="M35 32l3 6h7l-5 5 2 7-7-4-7 4 2-7-5-5h7Z" fill={C.yellow} stroke="none" />
  <circle cx="35" cy="40" r="3" fill={C.red} stroke="none" />
</>);
const cctv = s(100, 70, <>
  <path d="M8 8h18v16" fill="none" strokeWidth={6} />
  <rect x="22" y="14" width="64" height="30" rx="8" fill={C.grey} />
  <circle cx="74" cy="29" r="11" fill={INK} />
  <circle cx="74" cy="29" r="5" fill={C.blue} strokeWidth={2} />
  <circle cx="34" cy="22" r="3" fill={C.red} strokeWidth={2} />
  <path d="M40 54q10 8 20 0" fill="none" strokeWidth={3} />
</>);
const magnifier = s(80, 90, <>
  <circle cx="34" cy="34" r="26" fill={C.blueL} />
  <circle cx="34" cy="34" r="26" fill="none" strokeWidth={6} />
  <path d="M54 54l22 26" fill="none" strokeWidth={10} />
  <path d="M54 54l22 26" fill="none" stroke={C.wood} strokeWidth={5} />
  <path d="M18 24q6-10 16-10" fill="none" stroke={C.white} strokeWidth={4} opacity={0.8} />
</>);
const lostbox = s(90, 80, <>
  <rect x="6" y="22" width="78" height="54" rx="6" fill={C.wood} />
  <rect x="2" y="12" width="86" height="14" rx="5" fill={C.woodD} />
  <rect x="26" y="34" width="38" height="22" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M33 42h24M33 49h14" fill="none" strokeWidth={2.500} />
  <circle cx="45" cy="18" r="3" fill={C.yellow} strokeWidth={2} />
</>);

// ── Ga tàu điện ngầm
const subwaytrain = s(130, 70, <>
  <rect x="6" y="10" width="118" height="48" rx="14" fill={C.blue} />
  <rect x="14" y="18" width="24" height="22" rx="4" fill={C.blueL} strokeWidth={2.500} />
  <rect x="44" y="18" width="24" height="22" rx="4" fill={C.blueL} strokeWidth={2.500} />
  <rect x="74" y="18" width="24" height="22" rx="4" fill={C.blueL} strokeWidth={2.500} />
  <path d="M6 46h118" fill="none" stroke={C.yellow} strokeWidth={5} />
  <circle cx="34" cy="62" r="6" fill={INK} /><circle cx="96" cy="62" r="6" fill={INK} />
</>);
const escalator = s(110, 90, <>
  <path d="M6 80L100 14v24L6 100Z" fill={C.grey} />
  <path d="M6 80L100 14" fill="none" strokeWidth={5} />
  <path d="M16 72l10 8M34 60l10 8M52 48l10 8M70 36l10 8" fill="none" stroke={C.greyD} strokeWidth={4} />
  <path d="M10 60L96 -4" fill="none" stroke={C.red} strokeWidth={5} />
</>);
const strap = s(50, 100, <>
  <path d="M6 6h38" fill="none" strokeWidth={6} />
  <path d="M25 6v42" fill="none" strokeWidth={4} />
  <circle cx="25" cy="64" r="17" fill="none" strokeWidth={8} />
  <circle cx="25" cy="64" r="17" fill="none" stroke={C.yellow} strokeWidth={4} />
</>);
const safetyline = s(110, 40, <>
  <rect x="4" y="12" width="102" height="22" rx="4" fill={C.greyD} />
  <path d="M4 20h102" fill="none" stroke={C.yellow} strokeWidth={6} />
  <path d="M20 12l-8 22M44 12l-8 22M68 12l-8 22M92 12l-8 22" fill="none" stroke={INK} strokeWidth={3} />
  <path d="M4 34h102" fill="none" strokeWidth={3} />
</>);

// ── Khu cắm trại
const sleepingbag = s(110, 60, <>
  <rect x="6" y="14" width="98" height="38" rx="19" fill={C.green} />
  <path d="M30 14v38" fill="none" strokeWidth={3} />
  <rect x="8" y="18" width="30" height="30" rx="14" fill={C.greenL} strokeWidth={2.500} />
  <path d="M40 33h60" fill="none" stroke={C.greenD} strokeWidth={3} />
</>);
const campfire = s(80, 80, <>
  <path d="M8 66l56-16M72 66L16 50" fill="none" strokeWidth={10} />
  <path d="M8 66l56-16M72 66L16 50" fill="none" stroke={C.wood} strokeWidth={5} />
  <path d="M40 6q16 20 8 30 6-2 10-12 14 18 2 36H28Q14 40 40 6Z" fill={C.orange} />
  <path d="M40 30q8 10 2 20-8-4-2-20Z" fill={C.yellow} strokeWidth={2.500} />
</>);
const flashlight = s(100, 50, <>
  <rect x="6" y="14" width="56" height="24" rx="7" fill={C.greyD} />
  <path d="M62 8h24l8 6v22l-8 6H62Z" fill={C.grey} />
  <path d="M90 14l8-6v32l-8-6" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="30" cy="26" r="4" fill={C.red} strokeWidth={2} />
</>);
const compass = s(80, 80, <>
  <circle cx="40" cy="40" r="34" fill={C.cream} />
  <circle cx="40" cy="40" r="34" fill="none" strokeWidth={6} />
  <path d="M40 14l8 26-8 26-8-26Z" fill={C.red} />
  <path d="M40 66l8-26H32Z" fill={C.white} strokeWidth={2.500} />
  <circle cx="40" cy="40" r="3.500" fill={INK} stroke="none" />
</>);
const backpack = s(80, 100, <>
  <rect x="10" y="18" width="60" height="74" rx="16" fill={C.orange} />
  <rect x="18" y="52" width="44" height="30" rx="8" fill={C.orangeD} />
  <path d="M28 18q0-14 12-14t12 14" fill="none" strokeWidth={5} />
  <rect x="32" y="62" width="16" height="8" rx="3" fill={C.yellow} strokeWidth={2.500} />
</>);
const matches = s(80, 70, <>
  <rect x="8" y="30" width="64" height="34" rx="4" fill={C.red} />
  <rect x="14" y="36" width="52" height="22" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M24 30V10M36 30V6M48 30V12M60 30V8" fill="none" strokeWidth={4} />
  <circle cx="24" cy="8" r="4" fill={C.red} strokeWidth={2} /><circle cx="36" cy="5" r="4" fill={C.red} strokeWidth={2} />
</>);
const foldchair = s(80, 100, <>
  <path d="M18 8l8 50M62 8l-8 50M16 56l-6 40M64 56l6 40M26 58l28 38M54 58L26 96" fill="none" strokeWidth={6} />
  <path d="M16 56h48" fill="none" strokeWidth={9} />
  <path d="M16 56h48" fill="none" stroke={C.blue} strokeWidth={5} />
  <rect x="16" y="6" width="48" height="16" rx="4" fill={C.blue} />
</>);
const grill = s(100, 90, <>
  <rect x="8" y="22" width="84" height="14" rx="5" fill={C.greyD} />
  <path d="M16 26h68M16 32h68" fill="none" stroke={C.grey} strokeWidth={3} />
  <path d="M20 36l-10 52M80 36l10 52M50 36v52" fill="none" strokeWidth={6} />
  <ellipse cx="34" cy="20" rx="12" ry="5" fill={C.red} strokeWidth={2.500} />
  <ellipse cx="62" cy="20" rx="12" ry="5" fill={C.clay} strokeWidth={2.500} />
</>);
const star = s(70, 70, <>
  <path d="M35 6l8 20 22 2-17 14 6 22-19-12-19 12 6-22L5 28l22-2Z" fill={C.yellow} />
  <path d="M26 24q4-8 10-10" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
  <circle cx="35" cy="34" r="3" fill={C.orange} stroke="none" />
  <circle cx="22" cy="50" r="2" fill={C.orange} stroke="none" opacity={0.6} />
</>);
const moon = s(70, 80, <>
  <path d="M46 6q-34 10-30 38 4 26 32 30Q18 70 18 40 18 18 46 6Z" fill={C.yellow} />
  <circle cx="30" cy="30" r="4" fill={C.orange} stroke="none" opacity={0.6} />
  <circle cx="26" cy="50" r="3" fill={C.orange} stroke="none" opacity={0.6} />
  <path d="M38 14q-12 6-14 16" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const mosquitocoil = s(80, 80, <>
  <circle cx="40" cy="40" r="32" fill="none" strokeWidth={9} />
  <circle cx="40" cy="40" r="32" fill="none" stroke={C.green} strokeWidth={4} />
  <circle cx="40" cy="40" r="20" fill="none" strokeWidth={9} />
  <circle cx="40" cy="40" r="20" fill="none" stroke={C.green} strokeWidth={4} />
  <circle cx="40" cy="40" r="8" fill={C.greenD} />
</>);
const hikingboot = s(90, 80, <>
  <path d="M18 6h28v34q22 4 32 16v14H10V6Z" fill={C.brown} />
  <rect x="8" y="64" width="72" height="12" rx="4" fill={INK} />
  <path d="M18 18h28M18 28h28" fill="none" stroke={C.cream} strokeWidth={3} />
  <circle cx="28" cy="18" r="2" fill={C.yellow} stroke="none" /><circle cx="28" cy="28" r="2" fill={C.yellow} stroke="none" />
</>);

// ── Phòng thí nghiệm
const microscope = s(80, 100, <>
  <path d="M40 8l16 40-12 6-18-40Z" fill={C.greyD} />
  <rect x="14" y="88" width="56" height="8" rx="4" fill={C.greyD} />
  <path d="M26 90V70q-8-4-4-18 6 14 22 12" fill="none" strokeWidth={6} />
  <rect x="24" y="64" width="34" height="6" rx="3" fill={C.grey} />
  <circle cx="26" cy="16" r="4" fill={C.blue} strokeWidth={2.500} />
</>);
const testtube = s(40, 100, <>
  <path d="M10 6h20v70q0 16-10 16T10 76Z" fill={C.blueL} />
  <path d="M10 56h20v20q0 16-10 16T10 76Z" fill={C.green} stroke="none" opacity={0.85} />
  <path d="M6 6h28" fill="none" strokeWidth={6} />
  <path d="M14 14v34" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const beaker = s(70, 90, <>
  <path d="M10 10h50l-4 68q0 8-8 8H22q-8 0-8-8Z" fill={C.blueL} />
  <path d="M13 44h44l-2 34q0 8-8 8H23q-8 0-8-8Z" fill={C.pink} stroke="none" opacity={0.9} />
  <path d="M6 10h58" fill="none" strokeWidth={6} />
  <path d="M18 26h10M18 38h10M18 50h10" fill="none" strokeWidth={3} />
</>);
const labcoat = s(90, 100, <>
  <path d="M30 6L8 22l4 70h66l4-70L60 6l-15 16Z" fill={C.white} />
  <path d="M45 22v70" fill="none" strokeWidth={3} />
  <rect x="14" y="58" width="22" height="18" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M20 50h10" fill="none" stroke={C.blue} strokeWidth={3} />
  <circle cx="48" cy="40" r="2.500" fill={C.greyD} stroke="none" />
</>);
const balance = s(110, 90, <>
  <path d="M55 10v68" fill="none" strokeWidth={6} />
  <rect x="30" y="76" width="50" height="10" rx="5" fill={C.greyD} />
  <path d="M10 28h90" fill="none" strokeWidth={6} />
  <path d="M16 28l-10 28h34Z M94 28l-10 28h34Z" fill={C.yellow} strokeWidth={2.500} />
  <circle cx="55" cy="10" r="5" fill={C.red} strokeWidth={2.500} />
</>);
const alcohollamp = s(70, 90, <>
  <path d="M35 4q10 12 4 22-4-2-8-8-6 10 0 14-8-2-6-14Q30 14 35 4Z" fill={C.orange} />
  <rect x="31" y="26" width="8" height="14" fill={C.cream} strokeWidth={2.500} />
  <path d="M26 40h18l14 44q0 4-4 4H16q-4 0-4-4Z" fill={C.blueL} />
  <path d="M18 62h34l4 22H14Z" fill={C.pink} stroke="none" opacity={0.7} />
</>);
const goggles = s(100, 60, <>
  <rect x="6" y="16" width="38" height="30" rx="12" fill={C.blueL} />
  <rect x="56" y="16" width="38" height="30" rx="12" fill={C.blueL} />
  <path d="M44 28h12" fill="none" strokeWidth={5} />
  <path d="M6 30H0M94 30h6" fill="none" strokeWidth={5} />
  <path d="M14 24q6-4 14-2" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
</>);
const specimen = s(90, 70, <>
  <rect x="6" y="14" width="78" height="40" rx="4" fill={C.blueL} />
  <path d="M30 34q10-12 20 0t20 0" fill="none" stroke={C.green} strokeWidth={5} />
  <rect x="4" y="54" width="82" height="8" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M14 22v8" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
</>);
const dropper = s(40, 100, <>
  <path d="M10 6q10-6 20 0v20H10Z" fill={C.red} />
  <rect x="14" y="26" width="12" height="46" fill={C.blueL} />
  <path d="M14 72h12l-6 22Z" fill={C.blueL} />
  <rect x="8" y="24" width="24" height="6" rx="3" fill={C.greyD} />
</>);
const cylinder = s(50, 100, <>
  <path d="M10 6h30v76q0 12-15 12T10 82Z" fill={C.blueL} />
  <path d="M10 56h30v26q0 12-15 12T10 82Z" fill={C.yellow} stroke="none" opacity={0.85} />
  <path d="M10 16h8M10 28h8M10 40h8M10 52h8M10 64h8" fill="none" strokeWidth={3} />
  <rect x="6" y="2" width="38" height="8" rx="3" fill={C.cream} strokeWidth={2.500} />
</>);

export const VENUE6_SPRITES: Record<string, FlatSprite> = {
  policecar, handcuffs, walkietalkie, fingerprint, idcard, policecap, badge, cctv, magnifier, lostbox,
  subwaytrain, escalator, strap, safetyline,
  sleepingbag, campfire, flashlight, compass, backpack, matches, foldchair, grill, star, moon, mosquitocoil, hikingboot,
  microscope, testtube, beaker, labcoat, balance, alcohollamp, goggles, specimen, dropper, cylinder,
};
