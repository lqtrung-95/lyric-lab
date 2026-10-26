import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });
/** Hai mắt tròn có ánh sáng, dùng chung cho các con vật ở sở thú. */
const eyes = (y: number, gap = 10) => (
  <>
    <circle cx={42 - gap} cy={y} r="4.200" fill={INK} stroke="none" />
    <circle cx={42 + gap} cy={y} r="4.200" fill={INK} stroke="none" />
    <circle cx={43.500 - gap} cy={y - 1.500} r="1.500" fill={C.white} stroke="none" />
    <circle cx={43.500 + gap} cy={y - 1.500} r="1.500" fill={C.white} stroke="none" />
  </>
);

const tiger = s(84, 90, <>
  <circle cx="16" cy="22" r="10" fill={C.orange} />
  <circle cx="68" cy="22" r="10" fill={C.orange} />
  <ellipse cx="42" cy="48" rx="32" ry="30" fill={C.orange} />
  <path d="M30 22l4 10M42 20v10M54 22l-4 10M12 48l10 2M72 48l-10 2" fill="none" strokeWidth={4} />
  <ellipse cx="42" cy="58" rx="15" ry="11" fill={C.cream} strokeWidth={2.500} />
  {eyes(44, 13)}
  <ellipse cx="42" cy="53" rx="4.500" ry="3.200" fill={C.pink} strokeWidth={2} />
  <path d="M42 56v4M42 60q-5 4-9 0M42 60q5 4 9 0" fill="none" strokeWidth={2.200} />
</>);
const elephant = s(100, 90, <>
  <ellipse cx="16" cy="40" rx="15" ry="20" fill={C.grey} />
  <ellipse cx="84" cy="40" rx="15" ry="20" fill={C.grey} />
  <circle cx="50" cy="40" r="30" fill={C.grey} />
  <path d="M42 56q-4 24 4 28 6 0 4-8" fill={C.grey} strokeWidth={9} />
  <path d="M42 56q-4 24 4 28 6 0 4-8" fill="none" stroke={C.grey} strokeWidth={4.500} />
  <circle cx="36" cy="36" r="4" fill={INK} stroke="none" />
  <circle cx="64" cy="36" r="4" fill={INK} stroke="none" />
  <circle cx="37.300" cy="34.700" r="1.400" fill={C.white} stroke="none" />
  <circle cx="65.300" cy="34.700" r="1.400" fill={C.white} stroke="none" />
  <ellipse cx="26" cy="50" rx="5" ry="3" fill={C.pink} stroke="none" opacity={0.6} />
  <ellipse cx="74" cy="50" rx="5" ry="3" fill={C.pink} stroke="none" opacity={0.6} />
</>);
const giraffe = s(64, 110, <>
  <path d="M24 6l-2 -4M40 6l2 -4" fill="none" strokeWidth={3} />
  <rect x="22" y="40" width="22" height="64" rx="8" fill={C.yellow} />
  <circle cx="33" cy="28" r="19" fill={C.yellow} />
  <ellipse cx="33" cy="36" rx="11" ry="8" fill={C.woodL} strokeWidth={2.500} />
  <circle cx="26" cy="24" r="3.500" fill={INK} stroke="none" />
  <circle cx="40" cy="24" r="3.500" fill={INK} stroke="none" />
  <circle cx="27" cy="23" r="1.200" fill={C.white} stroke="none" />
  <circle cx="41" cy="23" r="1.200" fill={C.white} stroke="none" />
  <circle cx="28" cy="58" r="4" fill={C.woodD} stroke="none" />
  <circle cx="38" cy="72" r="4" fill={C.woodD} stroke="none" />
  <circle cx="28" cy="88" r="4" fill={C.woodD} stroke="none" />
</>);
const pandaanimal = s(80, 84, <>
  <circle cx="14" cy="16" r="11" fill={INK} />
  <circle cx="66" cy="16" r="11" fill={INK} />
  <ellipse cx="40" cy="42" rx="31" ry="28" fill={C.white} />
  <ellipse cx="26" cy="38" rx="8" ry="10" fill={INK} transform="rotate(20 26 38)" />
  <ellipse cx="54" cy="38" rx="8" ry="10" fill={INK} transform="rotate(-20 54 38)" />
  <circle cx="27" cy="38" r="3" fill={C.white} stroke="none" />
  <circle cx="53" cy="38" r="3" fill={C.white} stroke="none" />
  <ellipse cx="40" cy="52" rx="5" ry="3.500" fill={INK} stroke="none" />
  <path d="M40 55q-5 5-9 1M40 55q5 5 9 1" fill="none" strokeWidth={2.200} />
</>);
const monkey = s(84, 86, <>
  <circle cx="10" cy="44" r="11" fill={C.woodD} />
  <circle cx="74" cy="44" r="11" fill={C.woodD} />
  <circle cx="10" cy="44" r="5.500" fill={C.pink} strokeWidth={2} />
  <circle cx="74" cy="44" r="5.500" fill={C.pink} strokeWidth={2} />
  <ellipse cx="42" cy="42" rx="30" ry="28" fill={C.woodD} />
  <path d="M20 40q0-14 22-8 22-6 22 8 0 14-22 14T20 40Z" fill={C.woodL} strokeWidth={2.500} />
  {eyes(38, 9)}
  <ellipse cx="42" cy="54" rx="9" ry="6" fill={C.woodL} strokeWidth={2.500} />
  <path d="M36 54q6 4 12 0" fill="none" strokeWidth={2.200} />
</>);
const lion = s(96, 92, <>
  <circle cx="48" cy="46" r="42" fill={C.orangeD} />
  <path d="M10 30l-6-6M86 30l6-6M6 56l-6 2M90 56l6 2" fill="none" strokeWidth={4} />
  <circle cx="48" cy="48" r="28" fill={C.yellow} />
  <circle cx="30" cy="26" r="8" fill={C.yellow} />
  <circle cx="66" cy="26" r="8" fill={C.yellow} />
  <circle cx="37" cy="42" r="4.200" fill={INK} stroke="none" />
  <circle cx="59" cy="42" r="4.200" fill={INK} stroke="none" />
  <circle cx="38.500" cy="40.500" r="1.500" fill={C.white} stroke="none" />
  <circle cx="60.500" cy="40.500" r="1.500" fill={C.white} stroke="none" />
  <ellipse cx="48" cy="56" rx="12" ry="9" fill={C.cream} strokeWidth={2.500} />
  <ellipse cx="48" cy="52" rx="4.500" ry="3.200" fill={C.brown} stroke="none" />
  <path d="M48 55v4M48 59q-5 4-9 0M48 59q5 4 9 0" fill="none" strokeWidth={2.200} />
</>);
const zebra = s(84, 92, <>
  <path d="M20 4l4 18M60 4l-4 18" fill="none" strokeWidth={9} />
  <ellipse cx="42" cy="46" rx="28" ry="34" fill={C.white} />
  <path d="M18 30q10 4 20 0M46 30q10 4 20 0M16 46q12 4 24 0M44 46q12 4 24 0" fill="none" stroke={INK} strokeWidth={4.500} />
  <ellipse cx="42" cy="70" rx="19" ry="14" fill={C.pink} strokeWidth={2.500} />
  <circle cx="34" cy="68" r="2.500" fill={INK} stroke="none" />
  <circle cx="50" cy="68" r="2.500" fill={INK} stroke="none" />
  <circle cx="30" cy="38" r="4" fill={INK} stroke="none" />
  <circle cx="54" cy="38" r="4" fill={INK} stroke="none" />
</>);
const penguin = s(70, 100, <>
  <ellipse cx="35" cy="56" rx="26" ry="38" fill={INK} />
  <ellipse cx="35" cy="62" rx="17" ry="28" fill={C.white} strokeWidth={2.500} />
  <path d="M10 52l-8 22q4 4 10-2ZM60 52l8 22q-4 4-10-2Z" fill={INK} />
  <circle cx="27" cy="30" r="4.500" fill={C.white} strokeWidth={2} />
  <circle cx="43" cy="30" r="4.500" fill={C.white} strokeWidth={2} />
  <circle cx="27" cy="31" r="2" fill={INK} stroke="none" />
  <circle cx="43" cy="31" r="2" fill={INK} stroke="none" />
  <path d="M29 38l6 7 6-7Z" fill={C.orange} strokeWidth={2.500} />
  <path d="M24 94h14M34 94h14" fill="none" stroke={C.orange} strokeWidth={6} />
</>);
const cage = s(90, 100, <>
  <rect x="6" y="10" width="78" height="82" rx="6" fill="none" strokeWidth={5} />
  <path d="M24 10v82M42 10v82M60 10v82" fill="none" strokeWidth={4} />
  <rect x="2" y="4" width="86" height="12" rx="4" fill={C.greyD} />
  <rect x="2" y="86" width="86" height="10" rx="4" fill={C.greyD} />
  <circle cx="45" cy="52" r="5" fill={C.yellow} strokeWidth={2.500} />
</>);
const telescope = s(90, 80, <>
  <path d="M14 38l56-22 8 18-56 22Z" fill={C.blue} />
  <path d="M60 14l16-6 8 18-16 6Z" fill={C.greyD} />
  <path d="M30 56l-10 22M54 48l10 28" fill="none" strokeWidth={5} />
  <circle cx="22" cy="44" r="3" fill={C.yellow} strokeWidth={2} />
</>);
const feed = s(70, 80, <>
  <path d="M10 22h50l4 54q0 4-4 4H10q-4 0-4-4Z" fill={C.woodL} />
  <path d="M10 22q25-16 50 0" fill={C.wood} strokeWidth={3} />
  <circle cx="35" cy="52" r="13" fill={C.cream} strokeWidth={2.500} />
  <path d="M30 52l4 4 8-8" fill="none" stroke={C.green} strokeWidth={3} />
  <circle cx="14" cy="12" r="3" fill={C.yellow} strokeWidth={2} />
</>);

export const VENUE4_ZOO_SPRITES: Record<string, FlatSprite> = { tiger, elephant, giraffe, pandaanimal, monkey, lion, zebra, penguin, cage, telescope, feed };
