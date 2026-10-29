import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

/** Màu mực đen của thư pháp (đậm hơn viền mực nâu của app để chữ viết nổi bật). */
const INK_BLACK = "#2b2118";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Phòng khám Đông y
const ginseng = s(80, 110, <>
  <path d="M40 8q-18 2-18 14t18 14q18-2 18-14T40 8Z" fill={C.cream} />
  <path d="M30 34q-12 24-4 52M40 36v62M50 34q10 20 6 50M34 52q-14 8-18 22M46 56q12 6 16 18" fill="none" strokeWidth={6} stroke={C.woodL} />
  <path d="M30 34q-12 24-4 52M40 36v62M50 34q10 20 6 50" fill="none" strokeWidth={2} stroke={C.woodD} />
  <path d="M40 8q-2-6 4-8M30 12q-8-4-8-10M50 12q8-4 10-10" fill="none" strokeWidth={3} stroke={C.green} />
</>);
const goji = s(100, 70, <>
  <path d="M12 34h76q-4 28-38 32Q16 62 12 34Z" fill={C.white} />
  <ellipse cx="50" cy="34" rx="38" ry="8" fill={C.cream} />
  <ellipse cx="34" cy="30" rx="6" ry="8" fill={C.red} transform="rotate(30 34 30)" /><ellipse cx="50" cy="26" rx="6" ry="8" fill={C.redD} transform="rotate(-20 50 26)" /><ellipse cx="66" cy="30" rx="6" ry="8" fill={C.red} transform="rotate(20 66 30)" />
  <ellipse cx="42" cy="20" rx="6" ry="7" fill={C.red} transform="rotate(-10 42 20)" /><ellipse cx="58" cy="18" rx="6" ry="7" fill={C.red} transform="rotate(10 58 18)" />
</>);
const herbs = s(100, 80, <>
  <path d="M8 66l18-32 16 22 14-36 12 28 18-18 6 36Z" fill={C.green} />
  <path d="M8 66h86" fill="none" strokeWidth={4} stroke={C.woodD} />
  <path d="M30 32l-2 34M60 18l-2 48M86 36l-2 30" fill="none" strokeWidth={2.500} stroke={C.greenD} />
  <path d="M44 66l-4 10M62 66l2 10" fill="none" strokeWidth={3} stroke={C.woodD} />
</>);
const acuneedle = s(120, 70, <>
  <rect x="6" y="10" width="108" height="48" rx="8" fill={C.cream} />
  <path d="M20 16v36M36 16v36M52 16v36M68 16v36M84 16v36M100 16v36" fill="none" strokeWidth={2} stroke={C.woodL} />
  <path d="M16 34h88" fill="none" strokeWidth={2} stroke={C.greyD} />
  <path d="M20 34h8M36 34h8M52 34h8M68 34h8M84 34h8" fill="none" strokeWidth={6} stroke={C.grey} />
  <rect x="10" y="48" width="100" height="8" rx="3" fill={C.red} />
</>);
const moxa = s(110, 60, <>
  <rect x="12" y="22" width="70" height="20" rx="10" fill={C.cream} />
  <path d="M24 22v20M36 22v20M48 22v20M60 22v20" fill="none" strokeWidth={2} stroke={C.grey} />
  <path d="M82 28q14-2 18 4q-4 8-18 8Z" fill={C.red} />
  <path d="M96 24q-4-8 2-14M104 28q6-8 0-14" fill="none" strokeWidth={3} stroke={C.grey} />
</>);
const cupping = s(90, 80, <>
  <path d="M14 20h62q4 44-30 52Q10 64 14 20Z" fill={C.blueL} />
  <path d="M20 26q2 24 10 34" fill="none" strokeWidth={3} stroke={C.white} />
  <rect x="10" y="12" width="70" height="12" rx="5" fill={C.red} />
  <ellipse cx="45" cy="72" rx="24" ry="4" fill={C.redD} stroke="none" opacity={0.4} />
</>);
const pulsepillow = s(110, 60, <>
  <rect x="8" y="16" width="94" height="36" rx="16" fill={C.red} />
  <path d="M18 22q36-8 74 0" fill="none" strokeWidth={4} stroke={C.pink} />
  <path d="M30 34l8 6 8-6M60 34l8 6 8-6" fill="none" strokeWidth={2.500} stroke={C.yellow} />
  <path d="M8 34h-4M102 34h4" fill="none" strokeWidth={4} stroke={C.yellow} />
</>);
const herbscale = s(120, 110, <>
  <path d="M60 10v76M30 94h60" fill="none" strokeWidth={6} stroke={C.woodD} />
  <path d="M14 30h92" fill="none" strokeWidth={5} stroke={C.wood} />
  <path d="M14 30l-6 36h24Z" fill={C.cream} /><path d="M106 30l6 36H88Z" fill={C.cream} />
  <circle cx="60" cy="14" r="6" fill={C.red} /><path d="M20 30v-4M100 30v-4" fill="none" strokeWidth={3} />
</>);
const herbpot = s(100, 90, <>
  <path d="M16 36h60q10 34-20 46q-12 2-26 0Q10 70 16 36Z" fill={C.clay} />
  <rect x="20" y="26" width="52" height="12" rx="6" fill={C.orangeD} /><circle cx="46" cy="22" r="5" fill={C.orangeD} />
  <path d="M76 44q20-2 20 14q-2 10-18 8" fill="none" strokeWidth={6} stroke={C.clay} />
  <path d="M28 52q8-8 20-8" fill="none" strokeWidth={3} stroke={C.cream} />
  <path d="M34 16q-6-10 2-14M58 16q6-10-2-14" fill="none" strokeWidth={3} stroke={C.grey} />
</>);
const herbstove = s(120, 120, <>
  <path d="M20 50h80l8 62H12Z" fill={C.greyD} />
  <rect x="34" y="68" width="52" height="30" rx="6" fill={C.red} />
  <path d="M44 90q6-18 16-6q4-14 14 4" fill="none" strokeWidth={4} stroke={C.yellow} />
  <path d="M16 50h88" fill="none" strokeWidth={6} stroke={C.grey} />
  <path d="M30 36q30-20 60 0v10H30Z" fill={C.clay} /><path d="M50 22q-6-12 2-18" fill="none" strokeWidth={3} stroke={C.grey} />
</>);
const meridianchart = s(100, 140, <>
  <rect x="8" y="8" width="84" height="124" rx="6" fill={C.cream} />
  <circle cx="50" cy="32" r="12" fill={C.woodL} />
  <path d="M50 44v44M50 52l-24 24M50 52l24 24M50 88l-14 32M50 88l14 32" fill="none" strokeWidth={7} stroke={C.woodL} />
  <path d="M50 44v44M50 52l-24 24M50 52l24 24M50 88l-14 32M50 88l14 32" fill="none" strokeWidth={2} stroke={C.red} />
  <circle cx="50" cy="60" r="3" fill={C.red} strokeWidth={1.500} /><circle cx="38" cy="66" r="3" fill={C.red} strokeWidth={1.500} /><circle cx="62" cy="66" r="3" fill={C.red} strokeWidth={1.500} /><circle cx="50" cy="80" r="3" fill={C.red} strokeWidth={1.500} />
</>);
const diagdesk = s(150, 100, <>
  <rect x="8" y="22" width="134" height="22" rx="8" fill={C.woodD} />
  <rect x="14" y="26" width="122" height="10" rx="4" fill={C.wood} />
  <path d="M22 44l-4 50M128 44l4 50" fill="none" strokeWidth={7} stroke={C.woodD} />
  <rect x="86" y="44" width="40" height="36" rx="4" fill={C.wood} /><path d="M92 62h28" fill="none" strokeWidth={3} stroke={C.woodD} />
  <rect x="26" y="12" width="30" height="12" rx="4" fill={C.white} /><path d="M70 22l16-12" fill="none" strokeWidth={4} stroke={C.red} />
</>);

// ── Lớp thư pháp
const brush = s(40, 130, <>
  <rect x="15" y="6" width="10" height="82" rx="5" fill={C.woodD} />
  <path d="M12 88q-2 20 8 36q10-16 8-36Z" fill={C.cream} />
  <path d="M16 100q4 14 4 22M24 100q-4 14-4 22" fill="none" strokeWidth={2} stroke={C.greyD} />
  <rect x="13" y="78" width="14" height="14" rx="3" fill={C.red} />
</>);
const inkstick = s(110, 60, <>
  <rect x="10" y="14" width="86" height="34" rx="6" fill={C.greyD} />
  <path d="M10 14l8-8h86l-8 8Z" fill={C.grey} /><path d="M96 14l8-8v34l-8 8Z" fill={C.greyD} />
  <path d="M30 26h40M30 36h28" fill="none" strokeWidth={4} stroke={C.yellow} />
  <circle cx="82" cy="30" r="5" fill={C.red} strokeWidth={2} />
</>);
const ricepaper = s(120, 90, <>
  <path d="M10 70l8-56h92l-8 56Z" fill={C.cream} />
  <path d="M10 70l8-56 8 4-8 56Z" fill={C.woodL} />
  <path d="M44 28q16-6 32 0M48 44q14 6 30-2M40 56q22 6 44 0" fill="none" strokeWidth={4} stroke={C.greyD} />
  <rect x="96" y="22" width="12" height="12" rx="2" fill={C.red} strokeWidth={2} />
  <path d="M104 78l-6 6" fill="none" strokeWidth={3} />
</>);
const inkstone = s(110, 70, <>
  <rect x="8" y="16" width="94" height="44" rx="14" fill={C.greyD} />
  <path d="M20 30q0-8 12-8h44q14 0 14 12v8q0 10-14 10H34q-14 0-14-10Z" fill={C.grey} />
  <path d="M26 46q14-14 36-8t30 8" fill="none" strokeWidth={3} stroke={C.greyD} />
  <ellipse cx="42" cy="46" rx="18" ry="6" fill={INK_BLACK} />
</>);
const paperweight = s(120, 50, <>
  <rect x="8" y="14" width="104" height="28" rx="8" fill={C.greyD} />
  <path d="M16 20h88" fill="none" strokeWidth={4} stroke={C.grey} />
  <circle cx="60" cy="28" r="6" fill={C.yellow} strokeWidth={2} />
  <path d="M8 36h104" fill="none" strokeWidth={2.500} />
</>);
const brushpot = s(90, 110, <>
  <path d="M20 40h50l-4 62H24Z" fill={C.teal} />
  <path d="M20 40h50" fill="none" strokeWidth={4} /><path d="M26 58h38M26 80h38" fill="none" strokeWidth={3} stroke={C.white} />
  <path d="M30 40l-6-32M42 40l-2-36M54 40l4-34M64 40l12-26" fill="none" strokeWidth={4} stroke={C.woodD} />
  <path d="M24 8l-4-6M40 4l-2-4M58 6l2-6" fill="none" strokeWidth={5} stroke={C.cream} />
</>);
const brushrest = s(110, 60, <>
  <path d="M12 44l12-28 14 20 16-26 14 22 16-18 14 30Z" fill={C.green} />
  <path d="M12 44h90" fill="none" strokeWidth={5} stroke={C.greenD} />
  <path d="M30 44l-4 8M52 44v8M76 44l4 8" fill="none" strokeWidth={4} stroke={C.greenD} />
  <path d="M26 16q4-8 12-4" fill="none" strokeWidth={2.500} stroke={C.greenL} />
</>);
const copybook = s(110, 90, <>
  <path d="M8 20l47 8v56L8 76Z" fill={C.cream} /><path d="M102 20l-47 8v56l47-8Z" fill={C.cream} />
  <path d="M55 28v56" fill="none" strokeWidth={3} />
  <rect x="18" y="32" width="24" height="24" rx="2" fill="none" strokeWidth={2.500} stroke={C.red} /><path d="M30 32v24M18 44h24" fill="none" strokeWidth={1.500} stroke={C.red} />
  <rect x="66" y="34" width="24" height="24" rx="2" fill="none" strokeWidth={2.500} stroke={C.red} /><path d="M78 34v24M66 46h24" fill="none" strokeWidth={1.500} stroke={C.red} />
  <path d="M24 38q8-4 12 8M72 40q10 2 12 12" fill="none" strokeWidth={4} stroke={INK_BLACK} />
</>);
const calltable = s(150, 100, <>
  <rect x="8" y="24" width="134" height="22" rx="8" fill={C.woodD} />
  <rect x="14" y="28" width="122" height="10" rx="4" fill={C.wood} />
  <path d="M22 46l-4 48M128 46l4 48" fill="none" strokeWidth={7} stroke={C.woodD} />
  <path d="M34 18l22-4 12 10H34Z" fill={C.cream} /><path d="M44 18q8-2 14 2" fill="none" strokeWidth={2.500} stroke={C.greyD} />
  <rect x="94" y="14" width="30" height="12" rx="4" fill={C.greyD} />
</>);
const scrollbanner = s(70, 160, <>
  <rect x="6" y="6" width="58" height="8" rx="4" fill={C.woodD} />
  <path d="M12 14h46v120H12Z" fill={C.cream} />
  <path d="M12 14h46v120H12Z" fill="none" strokeWidth={3} />
  <path d="M26 32q10-4 18 2M28 52q8 6 16-2M26 74q10-6 20 2M30 98q8 4 14-2" fill="none" strokeWidth={6} stroke={INK_BLACK} />
  <rect x="6" y="134" width="58" height="8" rx="4" fill={C.woodD} /><path d="M35 142v12" fill="none" strokeWidth={4} stroke={C.red} />
</>);
const feltmat = s(150, 60, <>
  <rect x="6" y="14" width="138" height="34" rx="6" fill={C.greyD} />
  <rect x="12" y="20" width="126" height="22" rx="3" fill={C.grey} />
  <path d="M24 28h40M24 36h60M90 28h40" fill="none" strokeWidth={3} stroke={C.cream} />
  <path d="M12 42l4 6h118l4-6" fill="none" strokeWidth={2.500} />
</>);
const floorcushion = s(100, 70, <>
  <ellipse cx="50" cy="46" rx="42" ry="20" fill={C.red} />
  <ellipse cx="50" cy="38" rx="34" ry="14" fill={C.redD} />
  <path d="M34 34q16-8 32 0" fill="none" strokeWidth={3} stroke={C.yellow} />
  <circle cx="50" cy="40" r="4" fill={C.yellow} strokeWidth={2} />
</>);

// ── Trạm chuyển phát
const carton = s(100, 90, <>
  <path d="M10 30l40-14 40 14v48l-40 12-40-12Z" fill={C.wood} />
  <path d="M10 30l40 14 40-14M50 44v46" fill="none" strokeWidth={3} />
  <path d="M10 30l40 14v46L10 78Z" fill={C.woodD} stroke="none" opacity={0.35} />
  <path d="M38 34l24 8v12l-24-8Z" fill={C.cream} strokeWidth={2.500} />
  <path d="M46 14l8 14" fill="none" strokeWidth={4} stroke={C.cream} />
</>);
const shipslip = s(90, 100, <>
  <rect x="12" y="8" width="66" height="84" rx="4" fill={C.white} />
  <rect x="20" y="16" width="50" height="14" rx="2" fill={C.red} />
  <path d="M22 40h46M22 50h30M22 60h38" fill="none" strokeWidth={3} stroke={C.grey} />
  <path d="M24 72v12M30 72v12M34 72v12M42 72v12M46 72v12M56 72v12M62 72v12" fill="none" strokeWidth={2.500} />
</>);
const barcode = s(110, 70, <>
  <rect x="8" y="8" width="94" height="54" rx="4" fill={C.white} />
  <path d="M20 18v28M26 18v28M32 18v28M40 18v28M46 18v28M56 18v28M62 18v28M68 18v28M78 18v28M84 18v28" fill="none" strokeWidth={3} />
  <path d="M20 54h64" fill="none" strokeWidth={3} stroke={C.grey} />
  <rect x="8" y="8" width="94" height="10" rx="4" fill={C.red} />
</>);
const scangun = s(110, 110, <>
  <path d="M10 22h64q8 0 8 10v10H18q-8 0-8-8Z" fill={C.blue} />
  <path d="M60 42h24l-6 58H56Z" fill={C.greyD} />
  <rect x="6" y="26" width="16" height="10" rx="3" fill={C.red} />
  <path d="M10 31H0M10 28l-8-8M10 34l-8 8" fill="none" strokeWidth={2.500} stroke={C.red} />
  <circle cx="68" cy="34" r="4" fill={C.yellow} strokeWidth={2} />
  <rect x="60" y="62" width="16" height="10" rx="3" fill={C.grey} />
</>);
const courierbag = s(100, 100, <>
  <path d="M18 24h64l8 68H10Z" fill={C.green} />
  <path d="M18 24q32 16 64 0" fill="none" strokeWidth={3} />
  <path d="M26 14q24-12 48 0v10H26Z" fill={C.greenD} />
  <rect x="32" y="48" width="36" height="24" rx="4" fill={C.cream} /><path d="M38 56h24M38 64h16" fill="none" strokeWidth={2.500} stroke={C.green} />
</>);
const foam = s(110, 80, <>
  <path d="M10 50q-2-22 22-24q8-12 24-6q14-8 26 6q22 2 18 24q-4 18-24 16H34Q14 66 10 50Z" fill={C.white} />
  <circle cx="34" cy="48" r="5" fill={C.blueL} strokeWidth={2} /><circle cx="56" cy="40" r="5" fill={C.blueL} strokeWidth={2} /><circle cx="76" cy="50" r="5" fill={C.blueL} strokeWidth={2} /><circle cx="52" cy="58" r="5" fill={C.blueL} strokeWidth={2} />
</>);
const sealtape = s(100, 70, <>
  <circle cx="42" cy="36" r="28" fill={C.yellow} />
  <circle cx="42" cy="36" r="12" fill={C.cream} />
  <path d="M66 46h28v12H48" fill="none" strokeWidth={5} stroke={C.orange} />
  <path d="M24 22q10-8 22-6" fill="none" strokeWidth={3} stroke={C.white} />
  <path d="M72 52h6M82 52h6" fill="none" strokeWidth={2} stroke={C.red} />
</>);
const logbook = s(100, 90, <>
  <rect x="12" y="10" width="68" height="76" rx="5" fill={C.blue} />
  <rect x="12" y="10" width="14" height="76" rx="4" fill={C.greyD} />
  <rect x="34" y="20" width="38" height="20" rx="3" fill={C.cream} />
  <path d="M38 28h28M38 34h20" fill="none" strokeWidth={2.500} />
  <path d="M60 54l24-20 8 8-24 20-10 3Z" fill={C.yellow} />
</>);
const parcellocker = s(150, 140, <>
  <rect x="10" y="10" width="130" height="122" rx="8" fill={C.orange} />
  <rect x="18" y="18" width="38" height="32" rx="3" fill={C.cream} /><rect x="62" y="18" width="38" height="32" rx="3" fill={C.cream} /><rect x="106" y="18" width="26" height="32" rx="3" fill={C.cream} />
  <rect x="18" y="58" width="38" height="32" rx="3" fill={C.cream} /><rect x="62" y="58" width="38" height="32" rx="3" fill={C.cream} /><rect x="106" y="58" width="26" height="32" rx="3" fill={C.blueL} />
  <rect x="18" y="98" width="82" height="26" rx="3" fill={C.cream} /><circle cx="118" cy="108" r="7" fill={C.yellow} />
</>);
const digitalscale = s(110, 80, <>
  <path d="M10 52h90v16H10Z" fill={C.greyD} />
  <path d="M18 52l8-16h58l8 16Z" fill={C.grey} />
  <rect x="38" y="6" width="34" height="22" rx="4" fill={C.greyD} /><rect x="42" y="10" width="26" height="12" rx="2" fill={C.greenL} />
  <path d="M55 28v8" fill="none" strokeWidth={4} stroke={C.greyD} /><path d="M46 16h14" fill="none" strokeWidth={2.500} />
</>);
const sortingtable = s(150, 100, <>
  <rect x="8" y="24" width="134" height="20" rx="6" fill={C.grey} />
  <path d="M20 44l-4 48M130 44l4 48M75 44v48" fill="none" strokeWidth={6} stroke={C.greyD} />
  <rect x="22" y="8" width="26" height="16" rx="3" fill={C.wood} /><rect x="56" y="12" width="20" height="12" rx="3" fill={C.woodL} /><rect x="96" y="6" width="30" height="18" rx="3" fill={C.wood} />
  <path d="M10 62h130" fill="none" strokeWidth={4} stroke={C.woodD} />
  <rect x="20" y="64" width="34" height="20" rx="3" fill={C.red} /><rect x="96" y="64" width="34" height="20" rx="3" fill={C.blue} />
</>);
const totebox = s(110, 80, <>
  <path d="M10 22h90l-8 56H18Z" fill={C.blue} />
  <path d="M10 22h90" fill="none" strokeWidth={4} />
  <rect x="32" y="12" width="46" height="12" rx="6" fill={C.blueL} />
  <path d="M22 38h66M24 52h62" fill="none" strokeWidth={3} stroke={C.white} />
  <rect x="46" y="56" width="18" height="10" rx="3" fill={C.blueL} strokeWidth={2} />
</>);

export const VENUE14_SPRITES: Record<string, FlatSprite> = {
  ginseng, goji, herbs, acuneedle, moxa, cupping, pulsepillow, herbscale, herbpot, herbstove, meridianchart, diagdesk,
  brush, inkstick, ricepaper, inkstone, paperweight, brushpot, brushrest, copybook, calltable, scrollbanner, feltmat, floorcushion,
  carton, shipslip, barcode, scangun, courierbag, foam, sealtape, logbook, parcellocker, digitalscale, sortingtable, totebox,
};
