import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Tiệm hoa
const rose = s(50, 100, <>
  <path d="M25 40v56" fill="none" stroke={C.green} strokeWidth={5} />
  <path d="M25 70q-12-4-14-14 12 0 14 14ZM25 80q12-4 14-14-12 0-14 14Z" fill={C.green} strokeWidth={2.500} />
  <circle cx="25" cy="28" r="20" fill={C.red} />
  <path d="M25 28q-8 0-8-8t8-8 8 8-8 8Z" fill={C.redD} strokeWidth={2.500} />
  <path d="M12 26q2-10 12-12" fill="none" stroke={C.white} strokeWidth={2.500} opacity={0.6} />
</>);
const tulip = s(46, 100, <>
  <path d="M23 44v52" fill="none" stroke={C.green} strokeWidth={5} />
  <path d="M23 90q-14-6-16-24 14 4 16 24Z" fill={C.green} strokeWidth={2.500} />
  <path d="M6 14q0 32 17 32t17-32l-9 8-8-10-8 10Z" fill={C.pink} />
  <path d="M23 12v32" fill="none" strokeWidth={2.500} />
</>);
const sunflower = s(64, 100, <>
  <path d="M32 50v46" fill="none" stroke={C.green} strokeWidth={5} />
  <path d="M32 80q-14-2-18-14 14-2 18 14Z" fill={C.green} strokeWidth={2.500} />
  <circle cx="32" cy="30" r="26" fill={C.yellow} />
  <path d="M32 4v14M32 42v14M6 30h14M44 30h14M14 12l10 10M40 38l10 10M50 12L40 22M24 38L14 48" fill="none" stroke={C.orange} strokeWidth={3} />
  <circle cx="32" cy="30" r="12" fill={C.brown} />
  <circle cx="28" cy="26" r="2.500" fill={C.woodD} stroke="none" />
</>);
const lily = s(60, 100, <>
  <path d="M30 50v46" fill="none" stroke={C.green} strokeWidth={5} />
  <path d="M30 28q-26-4-26-24 18 4 26 24ZM30 28q26-4 26-24-18 4-26 24ZM30 28q-8-14 0-26 8 12 0 26Z" fill={C.white} />
  <path d="M30 28v-10M24 26l-2-8M36 26l2-8" fill="none" stroke={C.orange} strokeWidth={3} />
  <circle cx="30" cy="30" r="4" fill={C.yellow} strokeWidth={2} />
</>);
const bouquet = s(84, 100, <>
  <path d="M42 94L16 40h52Z" fill={C.cream} />
  <path d="M42 94L30 40M42 94l12-54" fill="none" strokeWidth={2.500} />
  <circle cx="26" cy="30" r="13" fill={C.pink} />
  <circle cx="58" cy="30" r="13" fill={C.yellow} />
  <circle cx="42" cy="16" r="14" fill={C.red} />
  <path d="M30 42q12 8 24 0" fill={C.red} stroke="none" opacity={0} />
  <path d="M22 52l40 0" fill="none" stroke={C.red} strokeWidth={5} />
</>);
const flowerpot = s(70, 74, <>
  <path d="M10 30h50l-6 40q-1 4-5 4H21q-4 0-5-4Z" fill={C.clay} />
  <rect x="6" y="22" width="58" height="12" rx="4" fill={C.orangeD} />
  <path d="M35 22q-10-14 0-20 10 6 0 20Z" fill={C.green} strokeWidth={2.500} />
  <path d="M22 44q4-4 8 0" fill="none" stroke={C.woodL} strokeWidth={3} />
</>);
const seeds = s(60, 76, <>
  <path d="M8 18h44l4 54q0 4-4 4H8q-4 0-4-4Z" fill={C.cream} />
  <rect x="12" y="30" width="36" height="24" rx="3" fill={C.green} strokeWidth={2.500} />
  <circle cx="22" cy="42" r="3" fill={C.yellow} strokeWidth={2} />
  <circle cx="30" cy="42" r="3" fill={C.yellow} strokeWidth={2} />
  <circle cx="38" cy="42" r="3" fill={C.yellow} strokeWidth={2} />
  <path d="M8 18l4-10h36l4 10" fill={C.woodL} />
</>);
const wateringcan = s(100, 74, <>
  <path d="M14 22h46l4 40q0 6-6 6H18q-6 0-6-6Z" fill={C.blue} />
  <path d="M60 36l30-18" fill="none" strokeWidth={9} />
  <path d="M60 36l30-18" fill="none" stroke={C.blue} strokeWidth={4.500} />
  <path d="M84 8l12 6-8 14Z" fill={C.greyD} />
  <path d="M14 34q-14 0-12 16t14 10" fill="none" strokeWidth={5} />
  <path d="M22 28q6-4 14-2" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const ribbon = s(70, 70, <>
  <path d="M35 36q-26-24-28-4t28 8Z" fill={C.red} />
  <path d="M35 36q26-24 28-4t-28 8Z" fill={C.red} />
  <path d="M35 40l-14 26 10-4 4 8ZM35 40l14 26-10-4-4 8Z" fill={C.redD} />
  <circle cx="35" cy="38" r="7" fill={C.red} strokeWidth={3} />
</>);
const cactus = s(70, 100, <>
  <path d="M10 70h50l-5 24q-1 4-5 4H20q-4 0-5-4Z" fill={C.clay} />
  <rect x="24" y="14" width="22" height="62" rx="11" fill={C.green} />
  <path d="M24 44h-8q-8 0-8-10v-8" fill="none" strokeWidth={10} />
  <path d="M24 44h-8q-8 0-8-10v-8" fill="none" stroke={C.green} strokeWidth={5} />
  <path d="M46 50h8q8 0 8-10v-6" fill="none" strokeWidth={10} />
  <path d="M46 50h8q8 0 8-10v-6" fill="none" stroke={C.green} strokeWidth={5} />
  <path d="M35 22v40M30 30l-3-2M40 38l3-2M30 52l-3-2" fill="none" stroke={C.greenL} strokeWidth={2} />
</>);
const trowel = s(50, 100, <>
  <path d="M25 4q-14 24-12 44h24q2-20-12-44Z" fill={C.grey} />
  <path d="M25 18v30" fill="none" strokeWidth={2.500} />
  <rect x="21" y="48" width="8" height="12" rx="2" fill={C.greyD} />
  <rect x="17" y="60" width="16" height="36" rx="7" fill={C.wood} />
</>);

// ── Tiệm sửa xe
const tire = s(80, 80, <>
  <circle cx="40" cy="40" r="34" fill={INK} />
  <circle cx="40" cy="40" r="20" fill={C.grey} />
  <circle cx="40" cy="40" r="7" fill={C.greyD} strokeWidth={2.500} />
  <path d="M40 22v-6M40 58v6M22 40h-6M58 40h6" fill="none" stroke={C.cream} strokeWidth={4} />
  <path d="M14 22q4-8 12-12" fill="none" stroke={C.grey} strokeWidth={3} opacity={0.6} />
</>);
const wrench = s(100, 46, <>
  <path d="M30 20H10Q2 20 2 11t10-8l8 8h14Z" fill={C.grey} />
  <path d="M30 14h58l8 9-8 9H30Z" fill={C.grey} />
  <circle cx="88" cy="23" r="4" fill={C.greyD} strokeWidth={2.500} />
  <path d="M40 20h30" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);
const jack = s(80, 80, <>
  <path d="M8 70h64v8H8Z" fill={C.greyD} />
  <path d="M14 70L40 28l26 42Z" fill={C.red} />
  <rect x="26" y="14" width="28" height="14" rx="4" fill={C.grey} />
  <path d="M40 28v34" fill="none" strokeWidth={3} />
  <path d="M70 56h8v-14" fill="none" strokeWidth={5} />
</>);
const screwdriver = s(40, 100, <>
  <rect x="12" y="4" width="16" height="44" rx="8" fill={C.red} />
  <path d="M14 18h12M14 30h12" fill="none" stroke={C.redD} strokeWidth={3} />
  <rect x="17" y="48" width="6" height="40" fill={C.grey} />
  <path d="M15 88h10l-5 10Z" fill={C.greyD} />
</>);
const motoroil = s(56, 84, <>
  <path d="M8 24h36v52q0 6-6 6H14q-6 0-6-6Z" fill={C.yellow} />
  <rect x="14" y="4" width="24" height="12" rx="4" fill={C.greyD} />
  <path d="M38 24l10-6" fill="none" strokeWidth={5} />
  <path d="M14 44h24v20H14Z" fill={C.cream} strokeWidth={2.500} />
  <path d="M26 48q-5 6 0 10 5-4 0-10Z" fill={C.orange} strokeWidth={2} />
</>);
const car = s(120, 70, <>
  <path d="M6 48q0-14 16-16l16-18h40l18 18q18 2 18 16v10H6Z" fill={C.red} />
  <path d="M42 18h18v14H32ZM66 18h12l14 14H66Z" fill={C.blueL} strokeWidth={2.500} />
  <circle cx="34" cy="60" r="12" fill={INK} />
  <circle cx="92" cy="60" r="12" fill={INK} />
  <circle cx="34" cy="60" r="5" fill={C.grey} strokeWidth={2} />
  <circle cx="92" cy="60" r="5" fill={C.grey} strokeWidth={2} />
  <rect x="106" y="40" width="10" height="8" rx="2" fill={C.yellow} strokeWidth={2.500} />
</>);
const steeringwheel = s(80, 80, <>
  <circle cx="40" cy="40" r="32" fill="none" strokeWidth={11} />
  <circle cx="40" cy="40" r="32" fill="none" stroke={C.greyD} strokeWidth={5.500} />
  <path d="M10 44h24l6 22M70 44H46" fill="none" strokeWidth={9} />
  <path d="M10 44h24l6 22M70 44H46" fill="none" stroke={C.greyD} strokeWidth={4.500} />
  <circle cx="40" cy="42" r="9" fill={C.red} strokeWidth={3} />
</>);
const helmet = s(80, 70, <>
  <path d="M6 54q0-46 34-46t34 46Z" fill={C.yellow} />
  <path d="M6 54h68v8H6Z" fill={C.orange} />
  <path d="M40 8v28M20 18q6 10 6 22M60 18q-6 10-6 22" fill="none" strokeWidth={2.500} />
  <circle cx="22" cy="26" r="3" fill={C.white} stroke="none" opacity={0.7} />
</>);
const toolbox = s(90, 70, <>
  <rect x="6" y="22" width="78" height="44" rx="6" fill={C.red} />
  <path d="M30 22V12q0-6 6-6h18q6 0 6 6v10" fill="none" strokeWidth={5} />
  <rect x="6" y="38" width="78" height="6" fill={C.redD} strokeWidth={2.500} />
  <rect x="38" y="34" width="14" height="14" rx="3" fill={C.yellow} strokeWidth={2.500} />
</>);
const screw = s(40, 84, <>
  <path d="M6 6h28l-4 14H10Z" fill={C.grey} />
  <path d="M12 10h16" fill="none" strokeWidth={2.500} />
  <path d="M12 20h16v50l-8 12-8-12Z" fill={C.grey} />
  <path d="M12 34h16M12 46h16M12 58h16" fill="none" stroke={C.greyD} strokeWidth={3} />
</>);
const hammer = s(80, 96, <>
  <rect x="34" y="30" width="12" height="62" rx="5" fill={C.wood} />
  <rect x="8" y="6" width="64" height="26" rx="6" fill={C.grey} />
  <path d="M8 14H2l4 10h2" fill={C.greyD} />
  <path d="M16 14h40" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);
const pliers = s(60, 100, <>
  <path d="M30 40L14 8q-4 -4 -8 4l8 26 8 14ZM30 40l16-32q4-4 8 4l-8 26-8 14Z" fill={C.grey} />
  <path d="M22 46l-8 48q4 6 10 0l6-40Z" fill={C.blue} />
  <path d="M38 46l8 48q-4 6-10 0l-6-40Z" fill={C.blue} />
  <circle cx="30" cy="44" r="4" fill={C.greyD} strokeWidth={2.500} />
</>);

// ── Quán trà sữa
const milktea = s(54, 100, <>
  <path d="M10 20h34l-4 74q0 4-4 4H18q-4 0-4-4Z" fill={C.woodL} />
  <rect x="6" y="14" width="42" height="10" rx="4" fill={C.white} />
  <path d="M30 14l8-12" fill="none" strokeWidth={5} />
  <circle cx="22" cy="86" r="4" fill={INK} stroke="none" />
  <circle cx="32" cy="86" r="4" fill={INK} stroke="none" />
  <circle cx="27" cy="78" r="4" fill={INK} stroke="none" />
  <path d="M16 36q-2 16 0 26" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);
const pearls = s(80, 60, <>
  <ellipse cx="40" cy="44" rx="32" ry="12" fill={C.greyD} />
  <circle cx="22" cy="38" r="9" fill={INK} />
  <circle cx="40" cy="30" r="9" fill={INK} />
  <circle cx="58" cy="38" r="9" fill={INK} />
  <circle cx="19" cy="35" r="2.500" fill={C.grey} stroke="none" />
  <circle cx="37" cy="27" r="2.500" fill={C.grey} stroke="none" />
</>);
const straw = s(40, 100, <>
  <path d="M26 6l-8 24v62" fill="none" strokeWidth={13} />
  <path d="M26 6l-8 24v62" fill="none" stroke={C.pink} strokeWidth={7} />
  <path d="M20 40l2-6M19 60l2-6M19 80l2-6" fill="none" stroke={C.white} strokeWidth={3} />
  <circle cx="26" cy="8" r="3" fill={C.pink} strokeWidth={2.500} />
</>);
const bobacup = s(54, 76, <>
  <path d="M6 14h42l-5 54q-1 6-7 6H18q-6 0-7-6Z" fill={C.blueL} />
  <path d="M10 14q17-12 34 0" fill={C.white} />
  <rect x="12" y="46" width="30" height="20" rx="3" fill={C.woodL} strokeWidth={2.500} />
  <circle cx="22" cy="58" r="3" fill={INK} stroke="none" />
  <circle cx="32" cy="58" r="3" fill={INK} stroke="none" />
</>);
const sugar = s(60, 70, <>
  <rect x="8" y="22" width="44" height="46" rx="8" fill={C.white} />
  <rect x="4" y="10" width="52" height="14" rx="5" fill={C.pink} />
  <rect x="14" y="36" width="32" height="18" rx="3" fill={C.cream} strokeWidth={2.500} />
  <path d="M22 45h16M30 40v10" fill="none" strokeWidth={2.500} />
</>);
const icecubes = s(70, 60, <>
  <rect x="6" y="26" width="26" height="26" rx="6" fill={C.blueL} transform="rotate(-8 19 39)" />
  <rect x="34" y="20" width="26" height="26" rx="6" fill={C.blueL} transform="rotate(10 47 33)" />
  <rect x="22" y="4" width="22" height="22" rx="5" fill={C.white} />
  <path d="M12 32l8-3M40 28l8 3" fill="none" stroke={C.white} strokeWidth={3} />
</>);
const lemon = s(70, 56, <>
  <path d="M6 28q4-18 29-18t29 18q-4 18-29 18T6 28Z" fill={C.yellow} />
  <path d="M6 28l-4-2M64 28l4-2" fill="none" strokeWidth={4} />
  <path d="M20 22q8-6 18-4" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
  <path d="M46 10q8-6 12 0" fill="none" stroke={C.green} strokeWidth={4} />
</>);
const mango = s(70, 70, <>
  <path d="M10 40q0-30 28-30 24 0 24 28 0 26-26 26-26 0-26-24Z" fill={C.orange} />
  <path d="M40 10q8-8 16-2-6 8-16 2Z" fill={C.green} strokeWidth={2.500} />
  <path d="M18 34q4-12 16-14" fill="none" stroke={C.yellow} strokeWidth={4} />
  <circle cx="26" cy="46" r="2" fill={C.orangeD} stroke="none" />
</>);
const strawberry = s(60, 70, <>
  <path d="M30 64q-24-10-24-34Q6 14 30 14t24 16q0 24-24 34Z" fill={C.red} />
  <path d="M16 16q14-12 28 0-14-2-28 0Z" fill={C.green} strokeWidth={2.500} />
  <path d="M22 28v3M34 26v3M40 38v3M26 42v3M32 52v3M20 38v3" fill="none" stroke={C.yellow} strokeWidth={3} />
  <path d="M20 24q4-4 10-4" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
  <circle cx="30" cy="12" r="2.500" fill={C.greenL} strokeWidth={2} />
</>);
const shaker = s(50, 100, <>
  <path d="M10 28h30l-3 62q0 4-4 4H17q-4 0-4-4Z" fill={C.grey} />
  <path d="M12 28l4-14h18l4 14Z" fill={C.greyD} />
  <rect x="18" y="4" width="14" height="10" rx="4" fill={C.grey} />
  <path d="M16 44h18M16 62h18" fill="none" stroke={C.greyD} strokeWidth={3} />
  <path d="M18 34q-2 20 0 36" fill="none" stroke={C.white} strokeWidth={3} opacity={0.6} />
</>);

export const VENUE4_SHOP_SPRITES: Record<string, FlatSprite> = {
  rose, tulip, sunflower, lily, bouquet, flowerpot, seeds, wateringcan, ribbon, cactus, trowel,
  tire, wrench, jack, screwdriver, motoroil, car, steeringwheel, helmet, toolbox, screw, hammer, pliers,
  milktea, pearls, straw, bobacup, sugar, icecubes, lemon, mango, strawberry, shaker,
};
