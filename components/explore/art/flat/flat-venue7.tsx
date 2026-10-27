import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Quán cà phê
const coffeebeans = s(80, 70, <>
  <ellipse cx="26" cy="38" rx="20" ry="26" fill={C.brown} transform="rotate(-25 26 38)" />
  <path d="M12 56q14-16 28-36" fill="none" stroke={C.woodL} strokeWidth={4} />
  <ellipse cx="56" cy="40" rx="18" ry="24" fill={C.woodD} transform="rotate(20 56 40)" />
  <path d="M46 56q14-16 20-36" fill="none" stroke={C.woodL} strokeWidth={4} />
  <path d="M20 22q4-6 10-6" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);
const espressomachine = s(110, 90, <>
  <rect x="6" y="8" width="98" height="26" rx="8" fill={C.greyD} />
  <rect x="6" y="30" width="98" height="52" rx="8" fill={C.red} />
  <circle cx="30" cy="20" r="7" fill={C.cream} strokeWidth={2.500} /><circle cx="52" cy="20" r="7" fill={C.cream} strokeWidth={2.500} />
  <rect x="38" y="48" width="34" height="8" rx="3" fill={C.grey} />
  <rect x="42" y="56" width="26" height="14" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M16 74h78" fill="none" stroke={C.redD} strokeWidth={4} />
</>);
const milkfoam = s(70, 80, <>
  <path d="M10 30h50l-6 44q-1 6-8 6H24q-7 0-8-6Z" fill={C.cream} />
  <path d="M10 30q4-18 14-16 4-10 16-6 12-2 14 14 6 6 0 14Z" fill={C.white} />
  <path d="M60 40q16 0 12 16t-18 14" fill="none" strokeWidth={5} />
  <path d="M18 48h34" fill="none" stroke={C.woodL} strokeWidth={4} />
</>);
const tiramisu = s(90, 70, <>
  <path d="M8 60V26l74 0v34q0 4-4 4H12q-4 0-4-4Z" fill={C.woodL} />
  <path d="M8 42h74" fill="none" strokeWidth={3} />
  <rect x="8" y="22" width="74" height="12" rx="4" fill={C.brown} />
  <rect x="8" y="46" width="74" height="8" fill={C.cream} stroke="none" />
  <circle cx="30" cy="16" r="5" fill={C.red} strokeWidth={2.500} />
</>);
const macaron = s(80, 70, <>
  <path d="M10 28q0-18 30-18t30 18Z" fill={C.pink} />
  <rect x="8" y="28" width="64" height="10" rx="5" fill={C.cream} />
  <path d="M10 38h60q0 22-30 22T10 38Z" fill={C.pink} />
  <path d="M20 22q6-6 14-6" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
</>);
const barstool = s(70, 110, <>
  <ellipse cx="35" cy="22" rx="28" ry="12" fill={C.red} />
  <rect x="7" y="20" width="56" height="12" rx="6" fill={C.redD} />
  <path d="M30 32l-12 70M40 32l12 70" fill="none" strokeWidth={6} />
  <path d="M22 70h26" fill="none" strokeWidth={5} />
  <path d="M12 102h18M40 102h18" fill="none" strokeWidth={5} />
</>);

// ── Hiệu sách
const fairytale = s(90, 80, <>
  <path d="M4 16q20-8 41 4v52q-21-12-41-4Z" fill={C.blueL} />
  <path d="M86 16q-20-8-41 4v52q21-12 41-4Z" fill={C.cream} />
  <path d="M45 20v52" fill="none" strokeWidth={3} />
  <path d="M65 34l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill={C.yellow} strokeWidth={2.500} />
</>);
const cookbook = s(80, 90, <>
  <rect x="8" y="6" width="64" height="78" rx="6" fill={C.orange} />
  <rect x="8" y="6" width="10" height="78" rx="4" fill={C.orangeD} />
  <circle cx="46" cy="38" r="16" fill={C.cream} />
  <path d="M38 38h16M46 30v16" fill="none" strokeWidth={3} />
  <path d="M26 66h38" fill="none" stroke={C.cream} strokeWidth={4} />
</>);
const calendar = s(80, 90, <>
  <rect x="6" y="12" width="68" height="72" rx="7" fill={C.white} />
  <rect x="6" y="12" width="68" height="20" rx="7" fill={C.red} />
  <path d="M22 4v14M58 4v14" fill="none" strokeWidth={6} />
  <path d="M16 44h10M35 44h10M54 44h10M16 58h10M35 58h10M54 58h10M16 72h10M35 72h10" fill="none" strokeWidth={4} />
  <circle cx="59" cy="72" r="7" fill="none" stroke={C.red} strokeWidth={3} />
</>);
const stickynotes = s(80, 80, <>
  <rect x="10" y="10" width="46" height="46" fill={C.yellow} />
  <rect x="24" y="26" width="46" height="46" fill={C.pink} />
  <path d="M32 40h28M32 50h20" fill="none" strokeWidth={3} />
  <path d="M10 56l-2 8 8-2" fill="none" strokeWidth={3} />
</>);
const bookpile = s(110, 80, <>
  <rect x="8" y="52" width="94" height="22" rx="4" fill={C.blue} />
  <rect x="16" y="30" width="80" height="22" rx="4" fill={C.red} />
  <rect x="26" y="10" width="64" height="20" rx="4" fill={C.green} />
  <path d="M14 63h82M22 41h66M32 20h50" fill="none" stroke={C.cream} strokeWidth={4} />
</>);

// ── Hồ bơi
const swimcap = s(90, 70, <>
  <path d="M8 56q0-46 37-46t37 46Z" fill={C.blue} />
  <rect x="6" y="52" width="78" height="10" rx="5" fill={C.blueL} />
  <path d="M28 26q8-10 20-10" fill="none" stroke={C.white} strokeWidth={4} opacity={0.7} />
  <path d="M40 14v38M58 16v36" fill="none" stroke={C.blueL} strokeWidth={3} />
</>);
const kickboard = s(70, 110, <>
  <rect x="8" y="6" width="54" height="98" rx="24" fill={C.yellow} />
  <rect x="22" y="26" width="26" height="14" rx="7" fill={C.cream} strokeWidth={2.500} />
  <path d="M20 66h30M20 80h30" fill="none" stroke={C.orange} strokeWidth={4} />
  <path d="M16 20q6-8 14-8" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
</>);
const armbands = s(100, 70, <>
  <ellipse cx="26" cy="36" rx="20" ry="26" fill={C.orange} />
  <ellipse cx="26" cy="36" rx="9" ry="14" fill={C.blueL} />
  <ellipse cx="74" cy="36" rx="20" ry="26" fill={C.orange} />
  <ellipse cx="74" cy="36" rx="9" ry="14" fill={C.blueL} />
  <path d="M12 26q4-8 12-8M60 26q4-8 12-8" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
</>);
const showerhead = s(80, 100, <>
  <path d="M10 8h36q14 0 14 14v6" fill="none" strokeWidth={7} />
  <path d="M20 26h48l8 24H12Z" fill={C.grey} />
  <path d="M20 58v14M34 58v22M48 58v14M62 58v22" fill="none" stroke={C.blue} strokeWidth={4} />
  <circle cx="26" cy="86" r="2.500" fill={C.blue} stroke="none" /><circle cx="54" cy="86" r="2.500" fill={C.blue} stroke="none" />
</>);
const earplugs = s(80, 60, <>
  <path d="M10 36q0-22 14-22t14 22q0 14-14 14T10 36Z" fill={C.orange} />
  <path d="M44 36q0-22 14-22t14 22q0 14-14 14T44 36Z" fill={C.orange} />
  <circle cx="24" cy="34" r="5" fill={C.orangeD} strokeWidth={2} /><circle cx="58" cy="34" r="5" fill={C.orangeD} strokeWidth={2} />
  <path d="M38 36h6" fill="none" strokeWidth={3} />
</>);
const noseclip = s(70, 80, <>
  <path d="M14 10q0 32 9 40 7 6 7 18" fill="none" strokeWidth={8} />
  <path d="M56 10q0 32-9 40-7 6-7 18" fill="none" strokeWidth={8} />
  <path d="M14 10q0 32 9 40 7 6 7 18M56 10q0 32-9 40-7 6-7 18" fill="none" stroke={C.pink} strokeWidth={4} />
  <circle cx="35" cy="72" r="5" fill={C.red} strokeWidth={2.500} />
</>);
const divingboard = s(130, 100, <>
  <rect x="4" y="46" width="34" height="50" rx="4" fill={C.grey} />
  <rect x="4" y="38" width="124" height="12" rx="5" fill={C.blue} />
  <path d="M10 44h108" fill="none" stroke={C.blueL} strokeWidth={3} />
  <path d="M4 96h34" fill="none" strokeWidth={4} />
  <path d="M44 74q12-8 24 0t24 0" fill="none" stroke={C.blue} strokeWidth={3} />
</>);
const laneropes = s(150, 40, <>
  <path d="M4 20h142" fill="none" strokeWidth={7} />
  <circle cx="14" cy="20" r="9" fill={C.red} /><circle cx="42" cy="20" r="9" fill={C.white} /><circle cx="70" cy="20" r="9" fill={C.blue} /><circle cx="98" cy="20" r="9" fill={C.white} /><circle cx="126" cy="20" r="9" fill={C.red} />
</>);
const lounger = s(130, 70, <>
  <path d="M8 40L40 10h18L28 42Z" fill={C.cream} />
  <rect x="26" y="38" width="96" height="14" rx="6" fill={C.cream} />
  <path d="M30 52v14M112 52v14" fill="none" strokeWidth={6} />
  <path d="M40 18l-14 22M44 14l-14 22" fill="none" stroke={C.blueL} strokeWidth={4} />
  <path d="M60 44h54" fill="none" stroke={C.blue} strokeWidth={4} />
</>);
const waterslide = s(130, 120, <>
  <path d="M10 8h30v14H10Z" fill={C.grey} />
  <path d="M14 22q0 50 40 64 30 10 66 10" fill="none" strokeWidth={22} stroke={INK} />
  <path d="M14 22q0 50 40 64 30 10 66 10" fill="none" strokeWidth={14} stroke={C.blue} />
  <path d="M12 8v104M38 22v90" fill="none" strokeWidth={5} />
  <path d="M10 108h40" fill="none" strokeWidth={5} />
</>);

// ── Trạm cứu hỏa
const firehat = s(100, 70, <>
  <path d="M18 52q0-42 32-42t32 42Z" fill={C.red} />
  <path d="M4 52h92q0 10-10 10H14Q4 62 4 52Z" fill={C.redD} />
  <rect x="38" y="24" width="24" height="18" rx="4" fill={C.yellow} strokeWidth={2.500} />
  <path d="M50 10v14" fill="none" strokeWidth={5} />
</>);
const extinguisher = s(60, 110, <>
  <rect x="12" y="26" width="36" height="78" rx="14" fill={C.red} />
  <rect x="16" y="12" width="28" height="18" rx="6" fill={C.greyD} />
  <path d="M44 20h12q4 0 4 6v12" fill="none" strokeWidth={5} />
  <rect x="18" y="52" width="24" height="24" rx="4" fill={C.cream} strokeWidth={2.500} />
  <path d="M20 8h14" fill="none" strokeWidth={5} />
</>);
const firehose = s(100, 90, <>
  <circle cx="44" cy="46" r="36" fill="none" strokeWidth={20} stroke={INK} />
  <circle cx="44" cy="46" r="36" fill="none" strokeWidth={13} stroke={C.yellow} />
  <circle cx="44" cy="46" r="14" fill={C.cream} strokeWidth={2.500} />
  <path d="M80 46h14" fill="none" strokeWidth={9} />
  <rect x="86" y="38" width="12" height="16" rx="3" fill={C.grey} />
</>);
const fireaxe = s(70, 110, <>
  <rect x="30" y="14" width="10" height="92" rx="4" fill={C.woodD} />
  <path d="M40 14q22 2 24 22-8 8-24 6Z" fill={C.grey} />
  <path d="M40 14q22 2 24 22" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
  <path d="M30 70h10M30 84h10" fill="none" stroke={C.red} strokeWidth={5} />
</>);
const oxygentank = s(60, 110, <>
  <rect x="12" y="22" width="36" height="82" rx="16" fill={C.teal} />
  <rect x="22" y="8" width="16" height="16" rx="4" fill={C.greyD} />
  <circle cx="30" cy="8" r="6" fill={C.grey} strokeWidth={2.500} />
  <rect x="18" y="46" width="24" height="16" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M18 80h24" fill="none" stroke={C.white} strokeWidth={4} opacity={0.7} />
</>);
const ropecoil = s(90, 80, <>
  <ellipse cx="45" cy="44" rx="38" ry="30" fill="none" strokeWidth={14} stroke={INK} />
  <ellipse cx="45" cy="44" rx="38" ry="30" fill="none" strokeWidth={8} stroke={C.woodL} />
  <ellipse cx="45" cy="44" rx="20" ry="14" fill="none" strokeWidth={8} stroke={C.wood} />
  <path d="M74 66q10 8 6 12" fill="none" strokeWidth={6} />
</>);
const firetruck = s(180, 90, <>
  <rect x="6" y="30" width="108" height="42" rx="6" fill={C.red} />
  <path d="M114 30h30l22 22v20h-52Z" fill={C.red} />
  <path d="M122 36h18l14 16h-32Z" fill={C.blueL} strokeWidth={2.500} />
  <path d="M8 18h96l-4 8H12Z" fill={C.grey} />
  <path d="M20 14h80" fill="none" strokeWidth={4} />
  <rect x="6" y="56" width="160" height="6" fill={C.yellow} stroke="none" />
  <circle cx="44" cy="76" r="13" fill={INK} /><circle cx="142" cy="76" r="13" fill={INK} />
  <circle cx="44" cy="76" r="5" fill={C.grey} strokeWidth={2} /><circle cx="142" cy="76" r="5" fill={C.grey} strokeWidth={2} />
</>);
const hydrant = s(70, 100, <>
  <rect x="16" y="34" width="38" height="58" rx="8" fill={C.red} />
  <path d="M10 34q0-22 25-22t25 22Z" fill={C.redD} />
  <rect x="2" y="48" width="14" height="14" rx="4" fill={C.grey} /><rect x="54" y="48" width="14" height="14" rx="4" fill={C.grey} />
  <rect x="26" y="2" width="18" height="12" rx="4" fill={C.grey} />
  <path d="M10 92h50" fill="none" strokeWidth={5} />
</>);
const firepole = s(60, 150, <>
  <rect x="24" y="4" width="12" height="136" rx="6" fill={C.yellow} />
  <path d="M28 12v120" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
  <ellipse cx="30" cy="142" rx="24" ry="7" fill={C.grey} />
  <ellipse cx="30" cy="8" rx="20" ry="6" fill={C.greyD} />
</>);

export const VENUE7_SPRITES: Record<string, FlatSprite> = {
  coffeebeans, espressomachine, milkfoam, tiramisu, macaron, barstool,
  fairytale, cookbook, calendar, stickynotes, bookpile,
  swimcap, kickboard, armbands, showerhead, earplugs, noseclip, divingboard, laneropes, lounger, waterslide,
  firehat, extinguisher, firehose, fireaxe, oxygentank, ropecoil, firetruck, hydrant, firepole,
};
