import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Tiệm ảnh
const tripod = s(90, 140, <>
  <rect x="26" y="6" width="38" height="24" rx="5" fill={C.greyD} />
  <path d="M45 30v40M45 70L16 134M45 70v64M45 70l29 64" fill="none" strokeWidth={6} stroke={C.grey} />
  <path d="M45 30v40M45 70L16 134M45 70v64M45 70l29 64" fill="none" strokeWidth={2.500} stroke={C.white} />
  <circle cx="45" cy="18" r="6" fill={C.blueL} strokeWidth={2.500} />
</>);
const flash = s(70, 90, <>
  <rect x="12" y="34" width="46" height="52" rx="6" fill={C.greyD} />
  <path d="M16 6h38l6 28H10Z" fill={C.cream} />
  <path d="M22 14h26" fill="none" strokeWidth={3} stroke={C.yellow} />
  <path d="M38 44l-10 16h8l-4 18 14-20h-8Z" fill={C.yellow} strokeWidth={2.500} />
</>);
const lens = s(90, 90, <>
  <circle cx="45" cy="45" r="38" fill={C.greyD} />
  <circle cx="45" cy="45" r="26" fill={C.blue} />
  <circle cx="45" cy="45" r="12" fill="#2c3e57" />
  <path d="M30 34q6-10 18-10" fill="none" strokeWidth={4} stroke={C.white} />
</>);
const film = s(110, 60, <>
  <rect x="6" y="8" width="98" height="44" rx="4" fill="#2c3e57" />
  <path d="M12 14h6M24 14h6M36 14h6M48 14h6M60 14h6M72 14h6M84 14h6M12 46h6M24 46h6M36 46h6M48 46h6M60 46h6M72 46h6M84 46h6" fill="none" strokeWidth={3} stroke={C.cream} />
  <rect x="14" y="22" width="22" height="16" rx="2" fill={C.blueL} strokeWidth={2} /><rect x="44" y="22" width="22" height="16" rx="2" fill={C.greenL} strokeWidth={2} /><rect x="74" y="22" width="22" height="16" rx="2" fill={C.yellow} strokeWidth={2} />
</>);
const album = s(100, 80, <>
  <rect x="6" y="8" width="88" height="66" rx="6" fill={C.red} />
  <rect x="6" y="8" width="14" height="66" rx="4" fill={C.redD} />
  <rect x="32" y="20" width="50" height="38" rx="3" fill={C.cream} />
  <path d="M40 50l10-14 8 8 8-10 10 16Z" fill={C.green} strokeWidth={2.500} />
  <circle cx="68" cy="30" r="4" fill={C.yellow} strokeWidth={2} />
</>);
const backdropcloth = s(130, 120, <>
  <path d="M20 4h90" fill="none" strokeWidth={6} stroke={C.greyD} />
  <path d="M26 4h78v82q-20 10-39 0t-39 0Z" fill={C.blueL} />
  <path d="M40 4v80M65 4v86M90 4v80" fill="none" strokeWidth={2.500} stroke={C.blue} />
  <path d="M14 112h102" fill="none" strokeWidth={5} stroke={C.greyD} />
  <path d="M22 4v108M108 4v108" fill="none" strokeWidth={4} stroke={C.grey} />
</>);
const idphoto = s(70, 90, <>
  <rect x="6" y="6" width="58" height="78" rx="4" fill={C.blue} />
  <circle cx="35" cy="34" r="14" fill={C.cream} />
  <path d="M12 82q4-26 23-26t23 26Z" fill={C.white} />
  <path d="M28 32h4M40 32h4M30 41q5 4 10 0" fill="none" strokeWidth={2.500} />
</>);
const softbox = s(110, 130, <>
  <rect x="14" y="8" width="82" height="62" rx="8" fill={C.cream} />
  <rect x="24" y="18" width="62" height="42" rx="4" fill={C.white} />
  <path d="M55 70v40M55 110L30 126M55 110l25 16M55 110v16" fill="none" strokeWidth={5} stroke={C.greyD} />
  <path d="M36 28l8 10M60 28l8 10M48 24l8 12" fill="none" strokeWidth={2.500} stroke={C.yellow} />
</>);
const reflector = s(110, 120, <>
  <circle cx="55" cy="46" r="40" fill={C.cream} />
  <path d="M55 6a40 40 0 0 1 0 80z" fill={C.yellow} />
  <circle cx="55" cy="46" r="40" fill="none" strokeWidth={4} />
  <path d="M55 86v30M40 116h30" fill="none" strokeWidth={5} stroke={C.greyD} />
</>);
const photopaper = s(100, 60, <>
  <rect x="6" y="22" width="78" height="30" rx="3" fill={C.cream} />
  <rect x="12" y="14" width="78" height="30" rx="3" fill={C.white} />
  <rect x="18" y="6" width="76" height="30" rx="3" fill={C.blueL} />
  <path d="M30 28l12-14 8 8 8-10 14 16Z" fill={C.green} strokeWidth={2.500} />
</>);
const prophat = s(100, 70, <>
  <ellipse cx="50" cy="50" rx="42" ry="12" fill={C.pink} />
  <path d="M26 48q0-34 24-34t24 34Z" fill={C.red} />
  <path d="M28 44h44" fill="none" strokeWidth={4} stroke={C.yellow} />
  <circle cx="50" cy="12" r="6" fill={C.yellow} strokeWidth={2.500} />
</>);

// ── Tiệm may
const needle = s(100, 60, <>
  <path d="M10 48L88 12" fill="none" strokeWidth={5} stroke={C.grey} />
  <path d="M10 48L88 12" fill="none" strokeWidth={2.500} stroke={C.white} />
  <ellipse cx="82" cy="16" rx="3" ry="6" fill={C.cream} transform="rotate(-24 82 16)" />
  <path d="M82 16q-16 10-14 30" fill="none" strokeWidth={3} stroke={C.red} />
</>);
const thread = s(70, 80, <>
  <rect x="12" y="8" width="46" height="10" rx="3" fill={C.woodL} />
  <rect x="12" y="62" width="46" height="10" rx="3" fill={C.woodL} />
  <rect x="16" y="18" width="38" height="44" rx="4" fill={C.red} />
  <path d="M16 28h38M16 38h38M16 48h38" fill="none" strokeWidth={2.500} stroke={C.redD} />
  <path d="M54 30q10 4 8 14" fill="none" strokeWidth={3} stroke={C.red} />
</>);
const fabric = s(110, 80, <>
  <path d="M8 18q30-12 52 0t42-6v50q-26 12-48 0T8 70Z" fill={C.pink} />
  <path d="M26 20v50M46 22v50M66 22v48M86 18v48" fill="none" strokeWidth={2.500} stroke={C.red} />
  <path d="M8 40h94" fill="none" strokeWidth={2.500} stroke={C.red} />
  <path d="M14 26q20-8 40 0" fill="none" strokeWidth={3} stroke={C.white} />
</>);
const button = s(70, 70, <>
  <circle cx="35" cy="35" r="28" fill={C.orange} />
  <circle cx="35" cy="35" r="18" fill="none" strokeWidth={3} stroke={C.orangeD} />
  <circle cx="28" cy="29" r="3.500" fill={C.cream} strokeWidth={2} /><circle cx="42" cy="29" r="3.500" fill={C.cream} strokeWidth={2} /><circle cx="28" cy="42" r="3.500" fill={C.cream} strokeWidth={2} /><circle cx="42" cy="42" r="3.500" fill={C.cream} strokeWidth={2} />
</>);
const zipper = s(60, 120, <>
  <path d="M10 6h40v108H10Z" fill={C.blue} />
  <path d="M30 6v80" fill="none" strokeWidth={4} stroke={C.white} />
  <path d="M22 14h16M22 24h16M22 34h16M22 44h16M22 54h16M22 64h16" fill="none" strokeWidth={3} stroke={C.greyD} />
  <rect x="20" y="82" width="20" height="22" rx="6" fill={C.yellow} />
</>);
const measuretape = s(120, 60, <>
  <path d="M6 30q50-30 108 0v14q-58-30-108 0Z" fill={C.yellow} />
  <path d="M20 26v8M34 22v8M48 20v10M62 20v8M76 22v10M90 24v10M104 28v8" fill="none" strokeWidth={2.500} />
  <path d="M6 44q-4-8 0-14" fill="none" strokeWidth={3} />
  <circle cx="16" cy="42" r="3" fill={C.red} strokeWidth={2} />
</>);
const pattern = s(100, 100, <>
  <path d="M10 10h80v80H10Z" fill={C.cream} />
  <path d="M26 24q24-10 48 0l-4 20q-20 8-40 0Z" fill={C.blueL} strokeWidth={2.500} strokeDasharray="5 4" />
  <path d="M22 60h56M22 74h40" fill="none" strokeWidth={3} stroke={C.greyD} />
  <path d="M26 24v-10M74 24v-10" fill="none" strokeWidth={2.500} />
</>);
const thimble = s(70, 70, <>
  <path d="M14 56q-2-34 21-40 23 6 21 40Z" fill={C.yellow} />
  <path d="M10 56h50" fill="none" strokeWidth={5} />
  <circle cx="26" cy="32" r="2.500" fill={C.orangeD} stroke="none" /><circle cx="38" cy="30" r="2.500" fill={C.orangeD} stroke="none" /><circle cx="32" cy="42" r="2.500" fill={C.orangeD} stroke="none" /><circle cx="44" cy="42" r="2.500" fill={C.orangeD} stroke="none" />
</>);
const mannequin = s(90, 160, <>
  <path d="M30 24q15 6 30 0l12 14-6 40q-6 14-6 20H30q0-6-6-20l-6-40Z" fill={C.wood} />
  <rect x="38" y="6" width="14" height="22" rx="6" fill={C.wood} />
  <path d="M45 98v42M45 140L24 156M45 140l21 16" fill="none" strokeWidth={6} stroke={C.greyD} />
  <path d="M30 52h30M28 72h34" fill="none" strokeWidth={2.500} stroke={C.woodD} />
</>);
const fittingroom = s(110, 150, <>
  <rect x="8" y="6" width="94" height="140" rx="6" fill={C.woodL} />
  <path d="M8 22h94" fill="none" strokeWidth={4} stroke={C.woodD} />
  <path d="M20 34h70v104H20Z" fill={C.green} />
  <path d="M38 34v104M56 34v104M74 34v104" fill="none" strokeWidth={2.500} stroke={C.greenD} />
  <circle cx="84" cy="88" r="4" fill={C.yellow} strokeWidth={2} />
</>);

const sewingbox = s(110, 80, <>
  <rect x="8" y="30" width="94" height="44" rx="8" fill={C.woodD} />
  <path d="M8 40q47-24 94 0v-10q-47-24-94 0Z" fill={C.wood} />
  <path d="M38 22q17-16 34 0" fill="none" strokeWidth={5} stroke={C.brown} />
  <circle cx="30" cy="54" r="7" fill={C.red} strokeWidth={2.500} /><circle cx="55" cy="54" r="7" fill={C.blue} strokeWidth={2.500} /><circle cx="80" cy="54" r="7" fill={C.yellow} strokeWidth={2.500} />
</>);

export const VENUE11_SPRITES: Record<string, FlatSprite> = {
  tripod, flash, lens, film, album, backdropcloth, idphoto, softbox, reflector, photopaper, prophat,
  needle, thread, fabric, button, zipper, measuretape, pattern, thimble, mannequin, fittingroom, sewingbox,
};
