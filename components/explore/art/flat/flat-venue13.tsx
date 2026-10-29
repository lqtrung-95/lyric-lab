import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Quán điểm tâm
const baozi = s(100, 80, <>
  <path d="M8 62q0-48 42-48t42 48q-4 10-42 10T8 62Z" fill={C.white} />
  <path d="M50 16q-4 10-14 14M50 16q4 10 14 14M50 16v14M50 16q-18 4-26 20M50 16q18 4 26 20" fill="none" strokeWidth={2.500} />
  <path d="M18 56q4-18 20-26" fill="none" strokeWidth={3} stroke={C.cream} />
  <ellipse cx="50" cy="72" rx="34" ry="5" fill={C.cream} />
</>);
const mantou = s(100, 70, <>
  <path d="M6 56q2-42 44-42t44 42q-8 10-44 10T6 56Z" fill={C.cream} />
  <path d="M24 38q8-14 24-16" fill="none" strokeWidth={4} stroke={C.white} />
  <path d="M60 24q12 4 18 16" fill="none" strokeWidth={2.500} />
  <ellipse cx="50" cy="63" rx="38" ry="4" fill={C.woodL} />
</>);
const soymilk = s(70, 100, <>
  <path d="M12 26h46l-4 66q-19 6-38 0Z" fill={C.white} />
  <path d="M15 40h40l-2 46q-18 5-36 0Z" fill={C.cream} stroke="none" />
  <rect x="8" y="18" width="54" height="10" rx="5" fill={C.blueL} />
  <path d="M44 20l8-14h8" fill="none" strokeWidth={5} stroke={C.red} />
  <path d="M20 46q2 18 4 28" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const youtiao = s(120, 70, <>
  <path d="M10 22q50-14 100 0v16q-50 14-100 0Z" fill={C.yellow} />
  <path d="M12 42q50-12 98 2v16q-48 12-98-2Z" fill={C.orange} />
  <path d="M30 24l6 12M54 22l6 14M80 24l6 12M34 46l6 12M64 44l6 12M90 46l6 12" fill="none" strokeWidth={2.500} stroke={C.orangeD} />
  <path d="M16 26q20-6 44-6" fill="none" strokeWidth={3} stroke={C.woodL} />
</>);
const congee = s(100, 80, <>
  <path d="M8 36h84q-2 34-42 38Q10 70 8 36Z" fill={C.white} />
  <path d="M10 44h80q-4 26-40 30Q14 70 10 44Z" fill={C.clay} stroke="none" opacity={0.3} />
  <ellipse cx="50" cy="36" rx="42" ry="9" fill={C.cream} />
  <circle cx="38" cy="35" r="3" fill={C.green} strokeWidth={2} /><circle cx="56" cy="38" r="3" fill={C.green} strokeWidth={2} /><circle cx="68" cy="34" r="2.500" fill={C.orange} strokeWidth={2} />
  <path d="M66 14l22 14" fill="none" strokeWidth={5} stroke={C.woodD} />
</>);
const pickles = s(80, 90, <>
  <rect x="14" y="10" width="52" height="12" rx="4" fill={C.red} />
  <path d="M16 22h48l4 60q-28 8-56 0Z" fill={C.blueL} />
  <path d="M26 40q10-8 16 2t14-6M24 58q12-8 18 2t14-6M30 72q8-6 14 0" fill="none" strokeWidth={5} stroke={C.green} />
  <path d="M22 28q-2 24 0 40" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const teaegg = s(90, 70, <>
  <ellipse cx="32" cy="38" rx="24" ry="28" fill={C.clay} transform="rotate(-12 32 38)" />
  <path d="M18 28l8 8-6 8 8 6M34 18l-4 10 10 6-4 10M44 34l8 4" fill="none" strokeWidth={2.500} stroke={C.cream} />
  <ellipse cx="66" cy="46" rx="18" ry="22" fill={C.white} transform="rotate(14 66 46)" />
  <ellipse cx="66" cy="50" rx="8" ry="9" fill={C.yellow} strokeWidth={2.500} />
</>);
const papernapkin = s(80, 80, <>
  <rect x="14" y="26" width="52" height="44" rx="4" fill={C.white} />
  <path d="M14 36h52M14 46h52" fill="none" strokeWidth={2} stroke={C.grey} />
  <path d="M30 26l8-14 14 14Z" fill={C.cream} />
  <rect x="14" y="58" width="52" height="12" rx="4" fill={C.red} />
</>);
const steamer = s(120, 130, <>
  <path d="M10 102h100v12q-50 10-100 0Z" fill={C.woodD} />
  <rect x="12" y="76" width="96" height="26" rx="6" fill={C.wood} /><rect x="12" y="52" width="96" height="26" rx="6" fill={C.woodL} />
  <path d="M26 76v26M44 76v26M62 76v26M80 76v26M98 76v26M26 52v26M44 52v26M62 52v26M80 52v26M98 52v26" fill="none" strokeWidth={2} stroke={C.woodD} />
  <path d="M16 52q44-44 88 0Z" fill={C.wood} /><circle cx="60" cy="22" r="6" fill={C.woodD} />
  <path d="M30 12q-6-8 0-14M90 14q6-8 0-14" fill="none" strokeWidth={3} stroke={C.blueL} />
</>);
const soymachine = s(110, 130, <>
  <rect x="18" y="52" width="74" height="70" rx="8" fill={C.blue} />
  <rect x="28" y="62" width="54" height="30" rx="4" fill={C.blueL} />
  <path d="M30 14h50l6 40H24Z" fill={C.white} /><path d="M34 22h42M32 34h46" fill="none" strokeWidth={2} stroke={C.grey} />
  <rect x="44" y="6" width="22" height="10" rx="4" fill={C.red} />
  <circle cx="36" cy="106" r="5" fill={C.yellow} /><rect x="58" y="100" width="22" height="12" rx="3" fill={C.greyD} />
</>);
const fryer = s(120, 100, <>
  <path d="M8 34h104q-4 40-52 46Q12 74 8 34Z" fill={C.greyD} />
  <ellipse cx="60" cy="34" rx="52" ry="12" fill={C.yellow} />
  <path d="M26 30q34-14 62-2v8q-30 8-62 0Z" fill={C.orange} /><path d="M38 28l4 8M56 26l4 9M74 28l4 8" fill="none" strokeWidth={2} stroke={C.orangeD} />
  <path d="M14 22q-12 0-12 8" fill="none" strokeWidth={5} stroke={C.woodD} />
  <path d="M30 96h60l-8-14H38Z" fill={C.grey} /><path d="M44 80q-4-8 2-14M70 80q4-8-2-14" fill="none" strokeWidth={3} stroke={C.red} />
</>);
const jianbing = s(120, 100, <>
  <ellipse cx="60" cy="62" rx="52" ry="20" fill={C.greyD} />
  <ellipse cx="60" cy="56" rx="46" ry="16" fill={C.grey} />
  <path d="M24 56q36-34 72 0q-36 14-72 0Z" fill={C.yellow} />
  <path d="M34 52q26-18 52 0" fill="none" strokeWidth={3} stroke={C.orange} />
  <circle cx="60" cy="48" r="6" fill={C.white} strokeWidth={2.500} /><circle cx="60" cy="48" r="2.500" fill={C.orange} stroke="none" />
  <path d="M88 64l22 22" fill="none" strokeWidth={6} stroke={C.woodD} /><rect x="14" y="82" width="92" height="10" rx="5" fill={C.red} />
</>);

// ── Chợ đêm
const skewer = s(110, 80, <>
  <path d="M8 66L100 12" fill="none" strokeWidth={4} stroke={C.woodD} />
  <rect x="22" y="38" width="20" height="18" rx="5" fill={C.clay} transform="rotate(-30 32 47)" />
  <rect x="42" y="30" width="20" height="18" rx="5" fill={C.redD} transform="rotate(-30 52 39)" />
  <rect x="62" y="22" width="20" height="18" rx="5" fill={C.clay} transform="rotate(-30 72 31)" />
  <path d="M26 42l6 4M46 34l6 4M66 26l6 4" fill="none" strokeWidth={2} stroke={C.yellow} />
</>);
const stinkytofu = s(100, 80, <>
  <path d="M10 34h80l-8 40H18Z" fill={C.cream} />
  <rect x="22" y="22" width="24" height="22" rx="3" fill={C.orange} /><rect x="52" y="20" width="24" height="22" rx="3" fill={C.orangeD} />
  <rect x="38" y="30" width="24" height="22" rx="3" fill={C.yellow} />
  <path d="M30 52q6-6 12 0M56 54q6-6 12 0" fill="none" strokeWidth={3} stroke={C.green} />
  <path d="M30 12q-6-8 0-12M62 12q6-8 0-12" fill="none" strokeWidth={2.500} />
</>);
const tanghulu = s(70, 110, <>
  <path d="M35 6v100" fill="none" strokeWidth={5} stroke={C.woodD} />
  <circle cx="35" cy="22" r="14" fill={C.red} /><circle cx="35" cy="46" r="14" fill={C.red} /><circle cx="35" cy="70" r="14" fill={C.red} /><circle cx="35" cy="94" r="14" fill={C.red} />
  <path d="M26 16q4-6 10-6M26 40q4-6 10-6M26 64q4-6 10-6M26 88q4-6 10-6" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const friednoodle = s(110, 80, <>
  <path d="M8 40h94q-2 30-46 36Q10 72 8 40Z" fill={C.white} />
  <path d="M14 38q16-26 42-22t42 22q-40 14-84 0Z" fill={C.woodL} />
  <path d="M26 34q10-6 20 0t24 0t14 2M30 26q12-8 24 0t22 4" fill="none" strokeWidth={3} stroke={C.orange} />
  <circle cx="40" cy="30" r="3.500" fill={C.green} strokeWidth={2} /><circle cx="72" cy="28" r="3.500" fill={C.red} strokeWidth={2} />
  <path d="M84 10l16-6M90 16l16-4" fill="none" strokeWidth={4} stroke={C.woodD} />
</>);
const sweetpotato = s(110, 70, <>
  <path d="M8 40q12-26 50-26t44 24q-8 22-48 22T8 40Z" fill={C.clay} />
  <path d="M20 36q18-14 40-12M70 34q12 0 22 6" fill="none" strokeWidth={3} stroke={C.cream} />
  <path d="M88 36q8 4 10 14" fill="none" strokeWidth={2.500} />
  <path d="M40 8q-4-8 0-12M62 8q4-8 0-12" fill="none" strokeWidth={2.500} stroke={C.grey} />
  <ellipse cx="60" cy="58" rx="22" ry="5" fill={C.orange} stroke="none" opacity={0.4} />
</>);
const squid = s(120, 80, <>
  <path d="M12 40q0-26 40-26h30q30 0 26 26t-30 24q-26 0-30-10Q12 58 12 40Z" fill={C.pink} />
  <path d="M30 30l14 8M52 24l14 10M74 26l14 8" fill="none" strokeWidth={3} stroke={C.redD} />
  <path d="M86 54l14 16M76 58l8 18M64 56l2 20M52 52l-6 20" fill="none" strokeWidth={5} stroke={C.pink} />
  <circle cx="32" cy="32" r="4" fill={C.white} strokeWidth={2.500} /><circle cx="33" cy="33" r="1.800" fill={C.greyD} stroke="none" />
  <path d="M6 70L112 10" fill="none" strokeWidth={3} stroke={C.woodD} />
</>);
const chickencutlet = s(110, 90, <>
  <path d="M10 62q-4-36 30-42q40-8 56 20q12 24-18 34q-36 10-68-12Z" fill={C.orange} />
  <path d="M24 56q-2-22 18-26q26-6 38 10" fill="none" strokeWidth={3} stroke={C.yellow} />
  <circle cx="44" cy="46" r="3" fill={C.yellow} strokeWidth={2} /><circle cx="64" cy="44" r="3" fill={C.yellow} strokeWidth={2} /><circle cx="54" cy="60" r="3" fill={C.yellow} strokeWidth={2} />
  <path d="M20 76h72l-6 12H26Z" fill={C.cream} />
</>);
const grilledcorn = s(110, 60, <>
  <rect x="10" y="14" width="86" height="32" rx="16" fill={C.yellow} />
  <path d="M24 14v32M38 14v32M52 14v32M66 14v32M80 14v32M12 30h82" fill="none" strokeWidth={2} stroke={C.orangeD} />
  <path d="M30 20q6 4 4 10M58 36q6 4 4 8" fill="none" strokeWidth={3} stroke={C.clay} />
  <path d="M96 30l12 0" fill="none" strokeWidth={6} stroke={C.woodD} /><path d="M10 44q18 14 38 4" fill="none" strokeWidth={4} stroke={C.green} />
</>);
const bbqgrill = s(130, 100, <>
  <rect x="8" y="30" width="114" height="22" rx="6" fill={C.greyD} />
  <rect x="14" y="34" width="102" height="10" rx="3" fill={C.red} />
  <path d="M22 28h86" fill="none" strokeWidth={4} stroke={C.grey} />
  <path d="M30 24l70 0" fill="none" strokeWidth={3} />
  <path d="M26 52l-10 42M104 52l10 42" fill="none" strokeWidth={6} stroke={C.greyD} />
  <path d="M44 20q-6-10 2-16M72 18q6-10-2-16M92 20q4-8-2-12" fill="none" strokeWidth={3} stroke={C.grey} />
</>);
const pushcart = s(140, 110, <>
  <rect x="14" y="34" width="104" height="44" rx="6" fill={C.red} />
  <path d="M8 34h116l-8-18H16Z" fill={C.yellow} /><path d="M30 34v-18M62 34v-18M94 34v-18" fill="none" strokeWidth={2.500} />
  <rect x="28" y="46" width="76" height="20" rx="3" fill={C.cream} />
  <circle cx="36" cy="92" r="14" fill={C.greyD} /><circle cx="100" cy="92" r="14" fill={C.greyD} /><circle cx="36" cy="92" r="5" fill={C.grey} /><circle cx="100" cy="92" r="5" fill={C.grey} />
  <path d="M118 44l14-12" fill="none" strokeWidth={6} stroke={C.woodD} />
</>);
const stringlights = s(140, 60, <>
  <path d="M4 12q66 30 132 0" fill="none" strokeWidth={3} />
  <circle cx="22" cy="24" r="8" fill={C.red} /><circle cx="46" cy="32" r="8" fill={C.yellow} /><circle cx="70" cy="35" r="8" fill={C.green} /><circle cx="94" cy="32" r="8" fill={C.blue} /><circle cx="118" cy="24" r="8" fill={C.pink} />
  <path d="M19 21l3-3M43 29l3-3M67 32l3-3M91 29l3-3M115 21l3-3" fill="none" strokeWidth={2} stroke={C.white} />
</>);
const plasticstool = s(80, 90, <>
  <ellipse cx="40" cy="26" rx="30" ry="10" fill={C.red} />
  <path d="M10 26v10q30 14 60 0V26" fill={C.redD} />
  <path d="M18 40l-6 46M62 40l6 46M40 44v42" fill="none" strokeWidth={6} stroke={C.red} />
  <ellipse cx="40" cy="25" rx="20" ry="5" fill={C.pink} strokeWidth={2} />
</>);

// ── Trà quán
const tealeaves = s(90, 80, <>
  <path d="M10 62q2-34 34-40t40 20q-8 24-34 28T10 62Z" fill={C.greenD} />
  <path d="M24 56q10-18 36-22M34 64q18-12 38-12" fill="none" strokeWidth={2.500} stroke={C.greenL} />
  <path d="M62 14q12-6 22 4q-8 8-18 6" fill={C.green} /><path d="M66 18l12 4" fill="none" strokeWidth={2} />
  <ellipse cx="42" cy="68" rx="30" ry="5" fill={C.woodL} />
</>);
const gongfucup = s(80, 60, <>
  <path d="M10 14h60q0 36-30 40Q10 50 10 14Z" fill={C.white} />
  <path d="M14 20h52" fill="none" strokeWidth={5} stroke={C.green} />
  <path d="M10 14h60" fill="none" strokeWidth={3.500} />
  <path d="M20 30q4 12 14 16" fill="none" strokeWidth={3} stroke={C.blueL} />
  <path d="M30 56h20" fill="none" strokeWidth={4} stroke={C.woodD} />
</>);
const teatray = s(120, 60, <>
  <rect x="6" y="20" width="108" height="24" rx="8" fill={C.woodD} />
  <rect x="12" y="24" width="96" height="10" rx="4" fill={C.wood} />
  <path d="M30 28h20M70 28h20" fill="none" strokeWidth={3} stroke={C.woodL} />
  <path d="M16 44v10M104 44v10" fill="none" strokeWidth={6} stroke={C.woodD} />
  <circle cx="60" cy="14" r="6" fill={C.white} />
</>);
const yixingpot = s(110, 80, <>
  <path d="M26 24h52q16 12 6 36q-10 14-32 14t-32-14Q10 36 26 24Z" fill={C.clay} />
  <rect x="38" y="12" width="28" height="12" rx="6" fill={C.orangeD} /><circle cx="52" cy="10" r="4" fill={C.orangeD} />
  <path d="M84 34q22-2 20 14q-2 10-16 8" fill="none" strokeWidth={6} stroke={C.clay} />
  <path d="M20 38q-16-6-14-16" fill="none" strokeWidth={6} stroke={C.clay} />
  <path d="M28 40q8-10 22-10" fill="none" strokeWidth={3} stroke={C.cream} />
</>);
const teapet = s(80, 70, <>
  <ellipse cx="40" cy="46" rx="26" ry="18" fill={C.clay} />
  <path d="M18 34q-10-12 6-16q6 8 10 12M62 34q10-12-6-16q-6 8-10 12" fill={C.orangeD} />
  <circle cx="30" cy="42" r="3" fill={C.cream} strokeWidth={2} /><circle cx="50" cy="42" r="3" fill={C.cream} strokeWidth={2} />
  <path d="M34 52q6 6 12 0" fill="none" strokeWidth={2.500} />
  <path d="M22 62h36" fill="none" strokeWidth={4} stroke={C.woodD} />
</>);
const teacaddy = s(70, 100, <>
  <rect x="12" y="24" width="46" height="68" rx="10" fill={C.red} />
  <rect x="8" y="12" width="54" height="16" rx="7" fill={C.yellow} />
  <rect x="20" y="42" width="30" height="26" rx="4" fill={C.cream} />
  <path d="M26 52h18M26 60h12" fill="none" strokeWidth={3} stroke={C.redD} />
</>);
const teasnack = s(110, 70, <>
  <ellipse cx="55" cy="48" rx="46" ry="16" fill={C.white} />
  <ellipse cx="55" cy="44" rx="36" ry="10" fill={C.cream} stroke="none" />
  <path d="M24 38q8-18 22-12t4 16Z" fill={C.yellow} /><circle cx="68" cy="32" r="13" fill={C.pink} /><path d="M60 30q8-6 16 0" fill="none" strokeWidth={2.500} stroke={C.white} />
  <rect x="72" y="36" width="22" height="12" rx="4" fill={C.green} />
</>);
const fanbamboo = s(90, 110, <>
  <path d="M45 8q40 4 40 42q0 28-40 38q-40-10-40-38Q5 12 45 8Z" fill={C.cream} />
  <path d="M45 8v80M24 14l12 72M66 14l-12 72" fill="none" strokeWidth={2} stroke={C.woodL} />
  <rect x="40" y="88" width="10" height="20" rx="5" fill={C.woodD} />
  <path d="M45 8q40 4 40 42" fill="none" strokeWidth={4} stroke={C.wood} />
</>);
const teatable = s(150, 100, <>
  <rect x="8" y="22" width="134" height="22" rx="8" fill={C.woodD} />
  <rect x="14" y="26" width="122" height="10" rx="4" fill={C.wood} />
  <path d="M22 44l-4 50M128 44l4 50M75 44v50" fill="none" strokeWidth={7} stroke={C.woodD} />
  <path d="M30 14h22q0 10-11 10T30 14ZM98 14h22q0 10-11 10T98 14Z" fill={C.white} />
</>);
const teascreen = s(130, 140, <>
  <rect x="10" y="10" width="34" height="118" rx="4" fill={C.woodD} /><rect x="48" y="10" width="34" height="118" rx="4" fill={C.woodD} /><rect x="86" y="10" width="34" height="118" rx="4" fill={C.woodD} />
  <rect x="15" y="16" width="24" height="106" rx="2" fill={C.cream} /><rect x="53" y="16" width="24" height="106" rx="2" fill={C.cream} /><rect x="91" y="16" width="24" height="106" rx="2" fill={C.cream} />
  <path d="M20 100q6-30 14-40M58 104q6-20 14-30M96 98q6-28 14-44" fill="none" strokeWidth={3} stroke={C.green} />
  <circle cx="30" cy="40" r="6" fill={C.red} /><circle cx="68" cy="52" r="6" fill={C.red} /><circle cx="106" cy="36" r="6" fill={C.red} />
</>);
const teafurnace = s(100, 120, <>
  <path d="M30 56h40l8 50H22Z" fill={C.greyD} />
  <path d="M20 106h60v8H20Z" fill={C.grey} />
  <path d="M36 74h28v18H36Z" fill={C.red} /><path d="M44 82q6-12 12 0" fill="none" strokeWidth={3} stroke={C.yellow} />
  <path d="M22 44h56q-6 16-28 16T22 44Z" fill={C.clay} /><rect x="36" y="30" width="28" height="14" rx="6" fill={C.orangeD} />
  <path d="M38 18q-6-10 2-14M62 18q6-10-2-14" fill="none" strokeWidth={3} stroke={C.blueL} />
</>);
const guqin = s(150, 80, <>
  <path d="M6 28q70-18 140 4v26q-70 16-140-2Z" fill={C.woodD} />
  <path d="M14 34q62-14 124 2" fill="none" strokeWidth={2} stroke={C.cream} />
  <path d="M14 40q62-12 124 2M14 46q62-10 124 2" fill="none" strokeWidth={2} stroke={C.cream} />
  <circle cx="40" cy="36" r="3" fill={C.cream} strokeWidth={2} /><circle cx="70" cy="34" r="3" fill={C.cream} strokeWidth={2} /><circle cx="100" cy="35" r="3" fill={C.cream} strokeWidth={2} />
  <path d="M120 60v10M30 54v12" fill="none" strokeWidth={5} stroke={C.red} />
</>);

export const VENUE13_SPRITES: Record<string, FlatSprite> = {
  baozi, mantou, soymilk, youtiao, congee, pickles, teaegg, papernapkin, steamer, soymachine, fryer, jianbing,
  skewer, stinkytofu, tanghulu, friednoodle, sweetpotato, squid, chickencutlet, grilledcorn, bbqgrill, pushcart, stringlights, plasticstool,
  tealeaves, gongfucup, teatray, yixingpot, teapet, teacaddy, teasnack, fanbamboo, teatable, teascreen, teafurnace, guqin,
};
