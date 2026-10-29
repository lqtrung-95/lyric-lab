import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

/** Màu riêng của sofa KTV (tím) và hạt dưa. */
const PURPLE = { light: "#9b78c9", dark: "#6c4a9a" } as const;
const INK_BROWN = "#6b4a2a";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── KTV
const ktvmic = s(60, 120, <>
  <circle cx="30" cy="26" r="20" fill={C.greyD} />
  <path d="M14 22h32M14 30h32M30 6v40" fill="none" strokeWidth={2} stroke={C.grey} />
  <path d="M18 42l24 0-6 14H24Z" fill={C.grey} />
  <rect x="22" y="56" width="16" height="56" rx="8" fill={C.red} />
  <rect x="22" y="70" width="16" height="8" fill={C.yellow} />
</>);
const songbook = s(100, 90, <>
  <rect x="14" y="8" width="72" height="76" rx="5" fill={C.red} />
  <rect x="14" y="8" width="12" height="76" rx="4" fill={C.redD} />
  <path d="M40 30q0-10 12-10v28q0 8-8 8t-8-8q0-6 8-6" fill="none" strokeWidth={3} stroke={C.yellow} />
  <path d="M52 20q8 2 8 10" fill="none" strokeWidth={3} stroke={C.yellow} />
  <path d="M34 62h42M34 70h30" fill="none" strokeWidth={2.500} stroke={C.cream} />
</>);
const dice = s(90, 80, <>
  <rect x="8" y="26" width="38" height="38" rx="7" fill={C.white} transform="rotate(-12 27 45)" />
  <circle cx="20" cy="38" r="3.500" fill={C.red} strokeWidth={1.500} /><circle cx="30" cy="48" r="3.500" fill={C.red} strokeWidth={1.500} /><circle cx="22" cy="54" r="3.500" fill={C.red} strokeWidth={1.500} />
  <rect x="48" y="30" width="36" height="36" rx="7" fill={C.white} transform="rotate(14 66 48)" />
  <circle cx="58" cy="42" r="3.500" fill={C.greyD} strokeWidth={1.500} /><circle cx="74" cy="42" r="3.500" fill={C.greyD} strokeWidth={1.500} /><circle cx="66" cy="50" r="3.500" fill={C.greyD} strokeWidth={1.500} /><circle cx="58" cy="58" r="3.500" fill={C.greyD} strokeWidth={1.500} /><circle cx="74" cy="58" r="3.500" fill={C.greyD} strokeWidth={1.500} />
</>);
const fruitplate = s(120, 80, <>
  <ellipse cx="60" cy="58" rx="52" ry="14" fill={C.white} />
  <circle cx="38" cy="40" r="15" fill={C.red} /><circle cx="64" cy="34" r="16" fill={C.orange} /><path d="M80 52q12-24 24-8q-6 18-24 8Z" fill={C.yellow} />
  <path d="M34 28q4-6 10-6M60 20q2-8 8-8" fill="none" strokeWidth={3} stroke={C.greenD} />
  <path d="M30 34q4-6 10-4" fill="none" strokeWidth={3} stroke={C.pink} />
</>);
const maracas = s(100, 100, <>
  <ellipse cx="34" cy="30" rx="20" ry="24" fill={C.red} transform="rotate(-20 34 30)" />
  <ellipse cx="68" cy="30" rx="20" ry="24" fill={C.yellow} transform="rotate(20 68 30)" />
  <path d="M40 50l-12 44M62 50l12 44" fill="none" strokeWidth={7} stroke={C.woodD} />
  <path d="M26 22l8 6M60 22l8 6M30 36l8 4M62 38l8 4" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const glowstick = s(80, 110, <>
  <rect x="26" y="8" width="18" height="94" rx="9" fill={C.greenL} transform="rotate(-18 35 55)" />
  <rect x="44" y="12" width="18" height="90" rx="9" fill={C.pink} transform="rotate(18 53 57)" />
  <path d="M26 30l10-4M30 54l10-4M50 30l10 4M46 54l10 4" fill="none" strokeWidth={2.500} stroke={C.white} />
  <path d="M8 24l8 6M70 14l8-6M72 40l8 2" fill="none" strokeWidth={3} stroke={C.yellow} />
</>);
const tambourine = s(100, 100, <>
  <circle cx="50" cy="50" r="40" fill={C.wood} />
  <circle cx="50" cy="50" r="28" fill={C.cream} />
  <circle cx="50" cy="12" r="6" fill={C.yellow} /><circle cx="88" cy="50" r="6" fill={C.yellow} /><circle cx="50" cy="88" r="6" fill={C.yellow} /><circle cx="12" cy="50" r="6" fill={C.yellow} /><circle cx="23" cy="23" r="5" fill={C.yellow} /><circle cx="77" cy="77" r="5" fill={C.yellow} />
  <path d="M34 44q16-14 32 0M34 58q16 12 32 0" fill="none" strokeWidth={3} stroke={C.red} />
</>);
const micstand = s(70, 130, <>
  <path d="M35 24v90" fill="none" strokeWidth={6} stroke={C.greyD} />
  <path d="M10 118h50l-6-8H16Z" fill={C.grey} />
  <path d="M14 126h42" fill="none" strokeWidth={5} stroke={C.greyD} />
  <path d="M35 24l-14-14" fill="none" strokeWidth={5} stroke={C.greyD} />
  <rect x="10" y="2" width="16" height="20" rx="8" fill={C.red} transform="rotate(-30 18 12)" />
  <circle cx="35" cy="70" r="5" fill={C.yellow} strokeWidth={2.500} />
</>);
const jukebox = s(120, 150, <>
  <path d="M14 142V50q0-38 46-38t46 38v92Z" fill={C.red} />
  <path d="M26 142V52q0-28 34-28t34 28v90Z" fill={C.cream} />
  <path d="M34 52q26-22 52 0v34H34Z" fill={C.blue} />
  <path d="M40 60l10 20M60 56v26M80 60l-10 20" fill="none" strokeWidth={2.500} stroke={C.blueL} />
  <rect x="38" y="98" width="44" height="12" rx="4" fill={C.yellow} /><circle cx="46" cy="122" r="5" fill={C.red} /><circle cx="60" cy="122" r="5" fill={C.green} /><circle cx="74" cy="122" r="5" fill={C.blue} />
</>);
const ktvspeaker = s(90, 130, <>
  <rect x="12" y="8" width="66" height="114" rx="8" fill={C.greyD} />
  <circle cx="45" cy="42" r="14" fill={C.grey} /><circle cx="45" cy="42" r="6" fill={C.greyD} />
  <circle cx="45" cy="88" r="22" fill={C.grey} /><circle cx="45" cy="88" r="10" fill={C.greyD} />
  <circle cx="45" cy="88" r="3" fill={C.red} strokeWidth={1.500} stroke="none" />
</>);
const discoball = s(100, 130, <>
  <path d="M50 4v30" fill="none" strokeWidth={4} stroke={C.greyD} />
  <circle cx="50" cy="76" r="42" fill={C.blueL} />
  <path d="M10 76h80M50 34v84M18 52q32 12 64 0M18 100q32-12 64 0M26 40q-8 36 0 72M74 40q8 36 0 72" fill="none" strokeWidth={2} stroke={C.blue} />
  <path d="M30 56l10-10 8 8-10 10ZM58 84l10-6 4 10-10 6Z" fill={C.white} strokeWidth={2} /><circle cx="72" cy="52" r="5" fill={C.pink} strokeWidth={2} />
</>);
const boothsofa = s(160, 100, <>
  <rect x="8" y="16" width="144" height="46" rx="14" fill={PURPLE.light} />
  <rect x="14" y="52" width="132" height="34" rx="8" fill={PURPLE.dark} />
  <path d="M48 20v34M80 20v34M112 20v34" fill="none" strokeWidth={2.500} stroke={PURPLE.dark} />
  <path d="M20 86v8M140 86v8" fill="none" strokeWidth={6} stroke={C.woodD} />
  <circle cx="30" cy="40" r="3" fill={C.yellow} strokeWidth={1.500} /><circle cx="130" cy="40" r="3" fill={C.yellow} strokeWidth={1.500} />
</>);

// ── Tết Nguyên đán
const hongbao = s(70, 110, <>
  <rect x="8" y="6" width="54" height="98" rx="6" fill={C.red} />
  <path d="M8 6l27 28L62 6" fill={C.redD} />
  <circle cx="35" cy="62" r="16" fill={C.yellow} />
  <path d="M28 62h14M35 52v20M30 56h10M30 68h10" fill="none" strokeWidth={2.500} stroke={C.red} />
  <path d="M16 90h38" fill="none" strokeWidth={3} stroke={C.yellow} />
</>);
const couplets = s(110, 130, <>
  <rect x="8" y="8" width="24" height="112" rx="3" fill={C.red} /><rect x="78" y="8" width="24" height="112" rx="3" fill={C.red} />
  <path d="M14 26h12M14 46h12M14 66h12M14 86h12M84 26h12M84 46h12M84 66h12M84 86h12" fill="none" strokeWidth={5} stroke={C.yellow} />
  <rect x="38" y="8" width="34" height="22" rx="3" fill={C.red} /><path d="M46 19h18" fill="none" strokeWidth={5} stroke={C.yellow} />
  <path d="M20 8v-6M90 8v-6" fill="none" strokeWidth={3} />
</>);
const fuchar = s(100, 100, <>
  <path d="M50 6l44 44-44 44L6 50Z" fill={C.red} />
  <path d="M50 6l44 44-44 44L6 50Z" fill="none" strokeWidth={3} />
  <path d="M34 34h32M50 28v10M36 44h28v22H36ZM36 55h28M50 44v22" fill="none" strokeWidth={4} stroke={C.yellow} />
  <path d="M50 94v8" fill="none" strokeWidth={4} stroke={C.yellow} />
</>);
const firecracker = s(80, 120, <>
  <path d="M40 4v24" fill="none" strokeWidth={4} />
  <rect x="12" y="26" width="18" height="38" rx="5" fill={C.red} /><rect x="32" y="26" width="18" height="38" rx="5" fill={C.red} /><rect x="52" y="26" width="18" height="38" rx="5" fill={C.red} />
  <path d="M12 38h18M32 38h18M52 38h18" fill="none" strokeWidth={4} stroke={C.yellow} />
  <path d="M40 64v14" fill="none" strokeWidth={4} /><rect x="22" y="76" width="18" height="36" rx="5" fill={C.red} /><rect x="42" y="76" width="18" height="36" rx="5" fill={C.red} />
  <path d="M22 88h18M42 88h18" fill="none" strokeWidth={4} stroke={C.yellow} />
</>);
const ricecake = s(110, 70, <>
  <rect x="10" y="22" width="90" height="36" rx="8" fill={C.cream} />
  <rect x="10" y="22" width="90" height="12" rx="6" fill={C.yellow} />
  <path d="M22 44h66" fill="none" strokeWidth={3} stroke={C.woodL} />
  <circle cx="56" cy="28" r="6" fill={C.red} strokeWidth={2} />
  <path d="M10 58h90" fill="none" strokeWidth={3} stroke={C.woodD} />
</>);
const papercuts = s(100, 100, <>
  <circle cx="50" cy="50" r="42" fill={C.red} />
  <path d="M50 16l6 14 14-6-4 14 14 6-14 6 4 14-14-6-6 14-6-14-14 6 4-14-14-6 14-6-4-14 14 6Z" fill={C.cream} />
  <circle cx="50" cy="50" r="8" fill={C.red} />
  <path d="M50 22v8M50 70v8M22 50h8M70 50h8" fill="none" strokeWidth={3} stroke={C.red} />
</>);
const sunflowerseeds = s(100, 80, <>
  <path d="M10 34h80l-8 40H18Z" fill={C.cream} />
  <path d="M14 34q36-30 72 0Z" fill={INK_BROWN} />
  <ellipse cx="32" cy="30" rx="6" ry="3.500" fill={C.greyD} transform="rotate(-20 32 30)" /><ellipse cx="48" cy="22" rx="6" ry="3.500" fill={C.greyD} transform="rotate(10 48 22)" /><ellipse cx="62" cy="28" rx="6" ry="3.500" fill={C.greyD} transform="rotate(-10 62 28)" /><ellipse cx="42" cy="34" rx="6" ry="3.500" fill={C.greyD} />
  <path d="M26 46h48" fill="none" strokeWidth={3} stroke={C.red} />
</>);
const chineseknot = s(80, 130, <>
  <path d="M40 4v20" fill="none" strokeWidth={4} />
  <path d="M40 24l16 16-16 16-16-16Z" fill={C.red} />
  <path d="M40 24l16 16-16 16-16-16Z" fill="none" strokeWidth={3} />
  <path d="M28 36l24 8M52 36l-24 8M40 24v32" fill="none" strokeWidth={3} stroke={C.yellow} />
  <path d="M40 56v6M34 62q6 6 12 0" fill="none" strokeWidth={3} />
  <path d="M30 68l-6 52M38 68l-2 54M46 68l2 54M54 68l6 52" fill="none" strokeWidth={5} stroke={C.red} />
</>);
const roundtable = s(160, 100, <>
  <ellipse cx="80" cy="40" rx="72" ry="26" fill={C.woodD} />
  <ellipse cx="80" cy="36" rx="64" ry="20" fill={C.wood} />
  <ellipse cx="80" cy="36" rx="22" ry="8" fill={C.woodL} />
  <path d="M60 60l-6 34M100 60l6 34M80 62v32" fill="none" strokeWidth={8} stroke={C.woodD} />
  <circle cx="44" cy="36" r="9" fill={C.white} /><circle cx="116" cy="36" r="9" fill={C.white} /><circle cx="80" cy="50" r="9" fill={C.white} />
</>);
const newyearpic = s(110, 130, <>
  <rect x="8" y="8" width="94" height="114" rx="6" fill={C.red} />
  <rect x="16" y="16" width="78" height="98" rx="3" fill={C.cream} />
  <circle cx="55" cy="56" r="20" fill={C.pink} /><path d="M47 52q8-6 16 0M50 64q5 4 10 0" fill="none" strokeWidth={2.500} />
  <path d="M30 100q25-28 50 0Z" fill={C.yellow} /><path d="M40 40q-6-14 6-14M70 40q6-14-6-14" fill="none" strokeWidth={4} stroke={C.red} />
</>);
const kumquat = s(110, 150, <>
  <path d="M30 100h50l-6 44H36Z" fill={C.clay} />
  <path d="M30 100h50" fill="none" strokeWidth={4} /><path d="M36 116h38" fill="none" strokeWidth={3} stroke={C.cream} />
  <path d="M55 100v-30" fill="none" strokeWidth={6} stroke={C.woodD} />
  <circle cx="55" cy="48" r="38" fill={C.green} />
  <circle cx="34" cy="40" r="9" fill={C.orange} /><circle cx="64" cy="30" r="9" fill={C.orange} /><circle cx="76" cy="58" r="9" fill={C.orange} /><circle cx="46" cy="64" r="9" fill={C.orange} /><circle cx="52" cy="40" r="7" fill={C.yellow} />
</>);
const redlantern = s(100, 140, <>
  <path d="M50 4v14" fill="none" strokeWidth={4} />
  <rect x="34" y="16" width="32" height="10" rx="3" fill={C.yellow} />
  <ellipse cx="50" cy="68" rx="44" ry="42" fill={C.red} />
  <path d="M50 26q-26 14-26 42t26 42M50 26q26 14 26 42t-26 42M50 26v84" fill="none" strokeWidth={2.500} stroke={C.redD} />
  <rect x="34" y="106" width="32" height="10" rx="3" fill={C.yellow} />
  <path d="M42 116l-4 20M50 116v22M58 116l4 20" fill="none" strokeWidth={4} stroke={C.yellow} />
  <path d="M38 56h24M50 46v22M42 62h16" fill="none" strokeWidth={3} stroke={C.yellow} />
</>);

export const VENUE15_SPRITES: Record<string, FlatSprite> = {
  ktvmic, songbook, dice, fruitplate, maracas, glowstick, tambourine, micstand, jukebox, ktvspeaker, discoball, boothsofa,
  hongbao, couplets, fuchar, firecracker, ricecake, papercuts, sunflowerseeds, chineseknot, roundtable, newyearpic, kumquat, redlantern,
};
