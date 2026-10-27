import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Công trường
const hardhat = s(100, 70, <>
  <path d="M10 52q0-38 40-38t40 38Z" fill={C.yellow} />
  <rect x="4" y="50" width="92" height="12" rx="6" fill={C.orange} />
  <path d="M50 14v36M34 22v28M66 22v28" fill="none" strokeWidth={3} stroke={C.orangeD} />
  <path d="M26 30q8-10 20-12" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const cement = s(80, 100, <>
  <path d="M8 14q32-10 64 0l4 76q-36 8-72 0Z" fill={C.grey} />
  <rect x="18" y="38" width="44" height="30" rx="4" fill={C.cream} />
  <path d="M26 54h28M40 46v16" fill="none" strokeWidth={4} stroke={C.red} />
  <path d="M8 14q32 8 64 0" fill="none" strokeWidth={3} />
</>);
const brick = s(100, 70, <>
  <rect x="6" y="8" width="42" height="22" rx="2" fill={C.clay} /><rect x="52" y="8" width="42" height="22" rx="2" fill={C.clay} />
  <rect x="26" y="34" width="42" height="22" rx="2" fill={C.clay} /><rect x="6" y="34" width="16" height="22" rx="2" fill={C.clay} /><rect x="72" y="34" width="22" height="22" rx="2" fill={C.clay} />
  <path d="M12 14h12M58 14h12M32 40h12" fill="none" strokeWidth={2.500} stroke={C.orangeD} />
</>);
const rebar = s(120, 70, <>
  <path d="M8 18h104M8 32h104M8 46h104" fill="none" strokeWidth={7} stroke={C.greyD} />
  <path d="M8 18h104M8 32h104M8 46h104" fill="none" strokeWidth={2.500} stroke={C.grey} />
  <path d="M30 12v40M60 12v40M90 12v40" fill="none" strokeWidth={4} stroke={C.brown} />
  <circle cx="14" cy="32" r="4" fill={C.grey} strokeWidth={2} />
</>);
const scaffold = s(120, 140, <>
  <path d="M14 8v128M106 8v128" fill="none" strokeWidth={6} stroke={C.grey} />
  <path d="M14 8h92M14 52h92M14 96h92M14 136h92" fill="none" strokeWidth={6} stroke={C.grey} />
  <path d="M14 52l92 44M14 96l92-44" fill="none" strokeWidth={3} stroke={C.greyD} />
  <rect x="26" y="40" width="68" height="8" rx="2" fill={C.woodD} />
</>);
const blueprint = s(110, 80, <>
  <rect x="6" y="8" width="98" height="64" rx="4" fill={C.blue} />
  <path d="M20 22h40v28H20ZM60 36h30v14H60Z" fill="none" strokeWidth={3} stroke={C.white} />
  <path d="M30 22v28M20 36h40" fill="none" strokeWidth={2} stroke={C.blueL} />
  <path d="M14 62h82" fill="none" strokeWidth={2.500} stroke={C.blueL} />
</>);
const tapemeasure = s(80, 80, <>
  <circle cx="38" cy="40" r="30" fill={C.yellow} />
  <circle cx="38" cy="40" r="12" fill={C.cream} />
  <path d="M66 52h10v14H48" fill="none" strokeWidth={5} stroke={C.orange} />
  <path d="M64 58h6M58 58h0" fill="none" strokeWidth={2.500} />
  <path d="M20 22q10-8 22-6" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const vest = s(90, 100, <>
  <path d="M14 12l20 6q11 8 22 0l20-6 6 76H8Z" fill={C.orange} />
  <path d="M34 18l10 70M56 18l-10 70" fill="none" strokeWidth={3} stroke={C.orangeD} />
  <path d="M10 62h70M10 74h70" fill="none" strokeWidth={6} stroke={C.yellow} />
  <path d="M10 62h70M10 74h70" fill="none" strokeWidth={2} stroke={C.white} />
</>);
const excavator = s(160, 120, <>
  <rect x="14" y="62" width="100" height="36" rx="12" fill={C.greyD} />
  <rect x="34" y="28" width="52" height="38" rx="6" fill={C.yellow} />
  <rect x="42" y="34" width="26" height="22" rx="3" fill={C.blueL} />
  <path d="M84 44L128 20l22 36" fill="none" strokeWidth={8} stroke={C.orange} />
  <path d="M146 56l12 16-24 4Z" fill={C.greyD} />
  <circle cx="30" cy="80" r="8" fill={C.grey} strokeWidth={2.500} /><circle cx="96" cy="80" r="8" fill={C.grey} strokeWidth={2.500} />
</>);
const mixer = s(130, 120, <>
  <path d="M30 20h54l10 20-6 32H26l-10-32Z" fill={C.orange} />
  <path d="M30 20q26 12 54 0M24 44q34 12 66 0" fill="none" strokeWidth={3} stroke={C.orangeD} />
  <rect x="8" y="76" width="106" height="14" rx="4" fill={C.greyD} />
  <circle cx="26" cy="102" r="12" fill={C.grey} /><circle cx="96" cy="102" r="12" fill={C.grey} />
  <path d="M96 76V60l24-8" fill="none" strokeWidth={5} stroke={C.grey} />
</>);
const shovel = s(70, 140, <>
  <path d="M35 6v76" fill="none" strokeWidth={7} stroke={C.woodD} />
  <path d="M25 6h20" fill="none" strokeWidth={6} stroke={C.greyD} />
  <path d="M16 84h38q4 28-19 46-23-18-19-46Z" fill={C.grey} />
  <path d="M26 92q-2 14 6 28" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const spiritlevel = s(130, 50, <>
  <rect x="6" y="10" width="118" height="30" rx="6" fill={C.green} />
  <rect x="48" y="16" width="34" height="18" rx="9" fill={C.cream} />
  <circle cx="65" cy="25" r="5" fill={C.yellow} strokeWidth={2.500} />
  <path d="M20 25h14M96 25h14" fill="none" strokeWidth={3} stroke={C.greenD} />
</>);

export const VENUE12_SPRITES: Record<string, FlatSprite> = {
  hardhat, cement, brick, rebar, scaffold, blueprint, tapemeasure, vest, excavator, mixer, shovel, spiritlevel,
};
