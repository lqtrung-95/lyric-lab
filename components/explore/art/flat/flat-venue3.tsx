import type { ReactNode } from "react";
import { C, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// Từ của bốn cảnh mới: Bưu điện, Hiệu thuốc, Cửa hàng điện thoại, Quán lẩu.

// ── Bưu điện
const envelope = s(80, 56, <>
  <rect x="4" y="6" width="72" height="44" rx="5" fill={C.cream} />
  <path d="M4 10l36 26 36-26" fill="none" />
  <path d="M4 48l26-20M76 48L50 28" fill="none" strokeWidth={2.5} />
  <rect x="56" y="12" width="14" height="12" rx="2" fill={C.pink} strokeWidth={2.5} />
</>);
const postage = s(48, 56, <>
  <path d="M4 4h6l3 4 4-4 4 4 4-4 4 4 4-4h6l-4 6 4 6-4 6 4 6-4 6 4 6-4 6H4Z" fill={C.cream} strokeWidth={2.5} />
  <rect x="12" y="14" width="24" height="26" rx="2" fill={C.blue} strokeWidth={2.5} />
  <circle cx="24" cy="24" r="5" fill={C.yellow} strokeWidth={2} />
  <path d="M14 38l8-8 6 6 6-6" fill="none" stroke={C.cream} strokeWidth={2.5} />
</>);
const parcel = s(80, 70, <>
  <rect x="4" y="14" width="72" height="52" rx="4" fill={C.wood} />
  <path d="M4 26h72" fill="none" strokeWidth={2.5} />
  <rect x="32" y="14" width="16" height="52" fill={C.woodL} strokeWidth={2.5} />
  <rect x="50" y="36" width="20" height="14" rx="2" fill={C.cream} strokeWidth={2.5} />
  <path d="M10 20h10" fill="none" stroke={C.woodL} strokeWidth={3} />
</>);
const mailbox = s(64, 110, <>
  <rect x="6" y="4" width="52" height="72" rx="22" fill={C.red} />
  <rect x="14" y="30" width="36" height="8" rx="3" fill={C.redD} strokeWidth={2.5} />
  <rect x="26" y="74" width="12" height="32" rx="3" fill={C.greyD} />
  <path d="M14 52q4-8 12-8" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
  <circle cx="32" cy="18" r="4" fill={C.yellow} strokeWidth={2} />
</>);
const postcard = s(80, 56, <>
  <rect x="4" y="6" width="72" height="44" rx="4" fill={C.cream} />
  <rect x="10" y="12" width="34" height="32" rx="3" fill={C.blueL} strokeWidth={2.5} />
  <path d="M10 40l10-12 8 8 6-6 10 10" fill={C.green} strokeWidth={2.5} />
  <path d="M52 20h18M52 28h18M52 36h12" fill="none" strokeWidth={2.5} />
</>);
const tape = s(60, 56, <>
  <ellipse cx="30" cy="30" rx="24" ry="22" fill={C.yellow} />
  <ellipse cx="30" cy="30" rx="10" ry="9" fill={C.cream} strokeWidth={2.5} />
  <path d="M46 44l10 8-12 2" fill={C.yellow} strokeWidth={2.5} />
  <path d="M14 20q4-8 12-9" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const mailbag = s(76, 84, <>
  <path d="M10 22h56l6 56q0 4-4 4H8q-4 0-4-4Z" fill={C.blue} />
  <rect x="8" y="12" width="60" height="14" rx="5" fill={C.blueL} />
  <path d="M26 12q0-8 12-8t12 8" fill="none" />
  <rect x="26" y="42" width="24" height="20" rx="3" fill={C.cream} strokeWidth={2.5} />
  <path d="M30 50h16" fill="none" strokeWidth={2.5} />
</>);

// ── Hiệu thuốc
const pills = s(56, 70, <>
  <rect x="8" y="16" width="40" height="50" rx="8" fill={C.white} />
  <rect x="6" y="6" width="44" height="14" rx="5" fill={C.red} />
  <rect x="14" y="30" width="28" height="16" rx="3" fill={C.greenL} strokeWidth={2.5} />
  <path d="M28 34v8M24 38h8" fill="none" stroke={C.green} strokeWidth={3} />
</>);
const syrup = s(54, 84, <>
  <rect x="16" y="4" width="22" height="14" rx="4" fill={C.blue} />
  <rect x="8" y="16" width="38" height="64" rx="10" fill={C.pink} />
  <rect x="12" y="34" width="30" height="26" rx="3" fill={C.cream} strokeWidth={2.5} />
  <path d="M18 44h18M18 51h12" fill="none" strokeWidth={2.5} />
  <path d="M14 24q2-4 6-5" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const bandaid = s(80, 40, <>
  <rect x="4" y="8" width="72" height="24" rx="12" fill={C.woodL} />
  <rect x="28" y="8" width="24" height="24" fill={C.cream} strokeWidth={2.5} />
  <circle cx="14" cy="20" r="1.8" fill={C.woodD} stroke="none" />
  <circle cx="66" cy="20" r="1.8" fill={C.woodD} stroke="none" />
  <path d="M34 15h12M34 25h12" fill="none" stroke={C.woodD} strokeWidth={2} />
</>);
const swab = s(70, 40, <>
  <path d="M12 20h46" fill="none" strokeWidth={6} />
  <path d="M12 20h46" fill="none" stroke={C.cream} strokeWidth={2.5} />
  <circle cx="10" cy="20" r="8" fill={C.white} />
  <circle cx="60" cy="20" r="8" fill={C.white} />
  <path d="M5 16q2-3 5-3" fill="none" strokeWidth={2} />
</>);
const ointment = s(40, 100, <>
  <path d="M8 6h24l-2 14H10Z" fill={C.grey} />
  <path d="M10 20h20l2 74q0 4-4 4H12q-4 0-4-4Z" fill={C.green} />
  <rect x="12" y="46" width="16" height="30" rx="2" fill={C.cream} strokeWidth={2.5} />
  <path d="M10 14h20" fill="none" strokeWidth={2} />
  <path d="M14 30l2 6" fill="none" stroke={C.greenL} strokeWidth={3} />
</>);
const eyedrops = s(40, 76, <>
  <path d="M14 4h12l2 10H12Z" fill={C.blue} />
  <rect x="10" y="14" width="20" height="56" rx="6" fill={C.blueL} />
  <rect x="13" y="32" width="14" height="24" rx="2" fill={C.cream} strokeWidth={2.5} />
  <path d="M20 8v4" fill="none" stroke={C.white} strokeWidth={2.5} />
  <circle cx="20" cy="43" r="3" fill={C.blue} strokeWidth={2} />
</>);
const firstaid = s(84, 70, <>
  <path d="M28 14q0-10 14-10t14 10" fill="none" strokeWidth={5} />
  <rect x="6" y="14" width="72" height="52" rx="9" fill={C.red} />
  <rect x="32" y="22" width="20" height="36" rx="3" fill={C.white} strokeWidth={2.5} />
  <rect x="24" y="30" width="36" height="20" rx="3" fill={C.white} strokeWidth={2.5} />
  <path d="M42 30v20M32 40h20" fill="none" stroke={C.red} strokeWidth={5} />
</>);

// ── Cửa hàng điện thoại
const charger = s(60, 76, <>
  <rect x="8" y="6" width="44" height="46" rx="8" fill={C.white} />
  <rect x="20" y="52" width="8" height="18" rx="2" fill={C.greyD} strokeWidth={2.5} />
  <rect x="34" y="52" width="8" height="18" rx="2" fill={C.greyD} strokeWidth={2.5} />
  <path d="M34 14l-8 14h8l-6 12" fill="none" stroke={C.yellow} strokeWidth={4} />
</>);
const phonecase = s(50, 90, <>
  <rect x="6" y="4" width="38" height="82" rx="10" fill={C.teal} />
  <rect x="12" y="10" width="14" height="14" rx="4" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="19" cy="17" r="3" fill={C.blueL} strokeWidth={2} />
  <path d="M34 56q4 6 0 12" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const cable = s(90, 70, <>
  <path d="M10 56q0-44 34-44t34 44" fill="none" strokeWidth={9} />
  <path d="M10 56q0-44 34-44t34 44" fill="none" stroke={C.cream} strokeWidth={3.5} />
  <rect x="2" y="54" width="16" height="14" rx="3" fill={C.greyD} />
  <rect x="70" y="54" width="16" height="14" rx="3" fill={C.greyD} />
</>);
const battery = s(74, 40, <>
  <rect x="4" y="6" width="58" height="28" rx="6" fill={C.green} />
  <rect x="62" y="14" width="8" height="12" rx="2" fill={C.greyD} />
  <rect x="10" y="12" width="14" height="16" rx="2" fill={C.greenL} strokeWidth={2} />
  <rect x="28" y="12" width="14" height="16" rx="2" fill={C.greenL} strokeWidth={2} />
</>);
const tablet = s(96, 70, <>
  <rect x="4" y="4" width="88" height="62" rx="9" fill={C.greyD} />
  <rect x="12" y="11" width="72" height="48" rx="3" fill={C.blueL} strokeWidth={2.5} />
  <circle cx="86" cy="35" r="2.5" fill={C.cream} strokeWidth={1.5} />
  <path d="M20 46l14-14 10 10 8-6 14 12" fill={C.green} strokeWidth={2.5} />
</>);
const smartwatch = s(60, 100, <>
  <path d="M16 4h28l-2 24H18Z" fill={C.clay} />
  <path d="M18 72h24l2 24H16Z" fill={C.clay} />
  <rect x="8" y="26" width="44" height="48" rx="13" fill={C.greyD} />
  <rect x="14" y="32" width="32" height="36" rx="8" fill={C.blueL} strokeWidth={2.5} />
  <path d="M30 42v8l6 4" fill="none" strokeWidth={3} />
</>);
const speaker = s(66, 94, <>
  <rect x="6" y="4" width="54" height="86" rx="10" fill={C.greyD} />
  <circle cx="33" cy="30" r="10" fill={C.grey} strokeWidth={2.5} />
  <circle cx="33" cy="64" r="16" fill={C.grey} strokeWidth={2.5} />
  <circle cx="33" cy="64" r="6" fill={C.greyD} strokeWidth={2.5} />
  <circle cx="33" cy="30" r="3" fill={C.greyD} strokeWidth={2} />
</>);
const socket = s(64, 64, <>
  <rect x="6" y="6" width="52" height="52" rx="10" fill={C.white} />
  <circle cx="32" cy="32" r="18" fill={C.cream} strokeWidth={2.5} />
  <rect x="22" y="26" width="5" height="12" rx="2" fill={C.greyD} stroke="none" />
  <rect x="37" y="26" width="5" height="12" rx="2" fill={C.greyD} stroke="none" />
</>);
const router = s(90, 80, <>
  <path d="M22 40L14 6M68 40l8-34" fill="none" strokeWidth={5} />
  <rect x="4" y="38" width="82" height="32" rx="9" fill={C.blue} />
  <circle cx="22" cy="54" r="3.5" fill={C.greenL} strokeWidth={2} />
  <circle cx="36" cy="54" r="3.5" fill={C.yellow} strokeWidth={2} />
  <path d="M52 54h26" fill="none" stroke={C.blueL} strokeWidth={3} />
</>);
const microphone = s(40, 100, <>
  <rect x="8" y="4" width="24" height="44" rx="12" fill={C.greyD} />
  <path d="M8 22h24M8 32h24" fill="none" stroke={C.grey} strokeWidth={2.5} />
  <rect x="16" y="48" width="8" height="40" rx="3" fill={C.grey} />
  <path d="M6 94h28" fill="none" strokeWidth={6} />
</>);

// ── Quán lẩu
const hotpot = s(110, 80, <>
  <path d="M10 28h90q0 38-30 40H40Q10 66 10 28Z" fill={C.redD} />
  <ellipse cx="55" cy="28" rx="46" ry="9" fill={C.red} />
  <path d="M10 26q-8 0-8 8M100 26q8 0 8 8" fill="none" strokeWidth={5} />
  <rect x="38" y="68" width="34" height="10" rx="3" fill={C.greyD} />
  <path d="M30 22q0-8 6-8M62 22q0-8 6-8" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
</>);
const meatslice = s(90, 54, <>
  <ellipse cx="45" cy="30" rx="40" ry="20" fill={C.white} />
  <path d="M14 30q14-18 30-6t30-4" fill={C.pink} strokeWidth={3} />
  <path d="M22 36q16 8 34 0t14 2" fill={C.red} strokeWidth={3} />
  <path d="M30 28q6-3 12 0" fill="none" stroke={C.white} strokeWidth={2.5} />
</>);
const mushroom = s(60, 64, <>
  <path d="M6 34q0-28 24-28t24 28Z" fill={C.woodD} />
  <rect x="22" y="32" width="16" height="28" rx="6" fill={C.cream} />
  <circle cx="20" cy="22" r="3" fill={C.woodL} stroke="none" />
  <circle cx="34" cy="16" r="3" fill={C.woodL} stroke="none" />
  <circle cx="42" cy="26" r="2.5" fill={C.woodL} stroke="none" />
</>);
const cabbage = s(70, 70, <>
  <path d="M6 40q0-34 29-34t29 34q0 24-29 24T6 40Z" fill={C.greenL} />
  <path d="M35 8q-10 24 0 54M35 8q10 24 0 54" fill="none" strokeWidth={2.5} />
  <path d="M10 28q12 6 25 4M60 28q-12 6-25 4" fill="none" stroke={C.green} strokeWidth={3} />
  <path d="M22 18q4-4 10-4" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const meatball = s(60, 54, <>
  <circle cx="20" cy="36" r="14" fill={C.woodD} />
  <circle cx="42" cy="36" r="14" fill={C.woodD} />
  <circle cx="31" cy="18" r="14" fill={C.woodD} />
  <circle cx="26" cy="13" r="3" fill={C.woodL} stroke="none" />
  <circle cx="15" cy="31" r="2.5" fill={C.woodL} stroke="none" />
</>);
const vermicelli = s(80, 60, <>
  <rect x="4" y="30" width="72" height="26" rx="8" fill={C.cream} />
  <path d="M12 32q10-26 20-4t18-22 22 24" fill="none" strokeWidth={3} />
  <path d="M14 34q8-16 18-2t18-16 18 16" fill="none" stroke={C.white} strokeWidth={3} />
  <path d="M8 44h64" fill="none" strokeWidth={2.5} />
</>);
const strainer = s(60, 100, <>
  <path d="M6 28h48q0 24-24 26Q6 52 6 28Z" fill={C.grey} />
  <path d="M16 36h2M26 38h2M36 36h2M44 34h2M22 44h2M32 46h2" fill="none" strokeWidth={3} />
  <rect x="27" y="54" width="7" height="42" rx="3" fill={C.woodD} />
  <path d="M6 28q24-14 48 0" fill="none" />
</>);
const beer = s(50, 76, <>
  <path d="M8 18h28l-2 52q0 4-4 4H14q-4 0-4-4Z" fill={C.yellow} />
  <path d="M36 28h8q6 0 6 8v12q0 8-6 8h-8" fill="none" strokeWidth={5} />
  <path d="M6 18q0-10 12-8 6-8 16 0 4 4 2 8Z" fill={C.white} />
  <path d="M16 30v34" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const shrimp = s(80, 64, <>
  <path d="M10 34q0-26 32-26 24 0 28 22 2 14-8 22l-6-6q8-8 2-14-6-8-18-6-14 2-14 18Z" fill={C.orange} />
  <path d="M34 12v24M46 12v24M58 18v18" fill="none" strokeWidth={2.5} />
  <circle cx="14" cy="42" r="2" fill={C.cream} strokeWidth={1.5} />
  <path d="M8 36q-6-8 0-16M10 44q-8 2-6 10" fill="none" strokeWidth={2.5} />
</>);
const corn = s(46, 100, <>
  <path d="M10 28q0-24 13-24t13 24v44q0 8-13 8t-13-8Z" fill={C.yellow} />
  <path d="M10 70q0 24 10 26 0-14 3-26M36 70q0 24-10 26 0-14-3-26" fill={C.greenL} />
  <path d="M16 16h14M14 30h18M14 44h18M14 58h18" fill="none" stroke={C.orange} strokeWidth={2} />
  <circle cx="17" cy="20" r="2.5" fill={C.cream} stroke="none" opacity={0.8} />
</>);

export const VENUE3_SPRITES: Record<string, FlatSprite> = {
  envelope, postage, parcel, mailbox, postcard, tape, mailbag,
  pills, syrup, bandaid, swab, ointment, eyedrops, firstaid,
  charger, phonecase, cable, battery, tablet, smartwatch, speaker, socket, router, microphone,
  hotpot, meatslice, mushroom, cabbage, meatball, vermicelli, strainer, beer, shrimp, corn,
};
