import type { ReactNode } from "react";
import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const s = (w: number, h: number, node: ReactNode): FlatSprite => ({ w, h, node: <g {...LINE}>{node}</g> });

// ── Trung tâm dữ liệu
const server = s(80, 100, <>
  <rect x="8" y="6" width="64" height="88" rx="6" fill={C.greyD} />
  <rect x="14" y="14" width="52" height="18" rx="3" fill={C.grey} /><rect x="14" y="38" width="52" height="18" rx="3" fill={C.grey} /><rect x="14" y="62" width="52" height="18" rx="3" fill={C.grey} />
  <circle cx="22" cy="23" r="3" fill={C.greenL} strokeWidth={1.500} /><circle cx="22" cy="47" r="3" fill={C.greenL} strokeWidth={1.500} /><circle cx="22" cy="71" r="3" fill={C.red} strokeWidth={1.500} />
  <path d="M34 23h24M34 47h24M34 71h24" fill="none" stroke={C.cream} strokeWidth={3} />
</>);
const harddisk = s(90, 70, <>
  <rect x="6" y="8" width="78" height="54" rx="8" fill={C.grey} />
  <circle cx="40" cy="35" r="20" fill={C.cream} />
  <circle cx="40" cy="35" r="6" fill={C.greyD} strokeWidth={2.500} />
  <path d="M40 35l16-14" fill="none" strokeWidth={4} />
  <rect x="66" y="14" width="12" height="8" rx="2" fill={C.green} strokeWidth={2} />
</>);
const firewall = s(90, 80, <>
  <rect x="6" y="40" width="78" height="38" rx="4" fill={C.redD} />
  <path d="M6 54h78M6 66h78M28 40v14M56 40v14M42 54v12" fill="none" strokeWidth={2.500} stroke={C.cream} />
  <path d="M45 6q14 14 6 24 8-2 8-10 10 10 0 22H32q-8-12 4-22 0 6 6 6-4-10 3-20Z" fill={C.orange} />
  <path d="M43 34q4-8 6-2 4 2 0 8h-8q-2-4 2-6Z" fill={C.yellow} strokeWidth={2} />
</>);
const netswitch = s(110, 50, <>
  <rect x="4" y="8" width="102" height="34" rx="6" fill={C.blue} />
  <rect x="12" y="16" width="14" height="14" rx="2" fill={C.greyD} strokeWidth={2} /><rect x="30" y="16" width="14" height="14" rx="2" fill={C.greyD} strokeWidth={2} /><rect x="48" y="16" width="14" height="14" rx="2" fill={C.greyD} strokeWidth={2} /><rect x="66" y="16" width="14" height="14" rx="2" fill={C.greyD} strokeWidth={2} />
  <circle cx="92" cy="22" r="4" fill={C.greenL} strokeWidth={2} />
  <path d="M10 36h60" fill="none" stroke={C.blueL} strokeWidth={3} />
</>);
const rack = s(90, 140, <>
  <rect x="6" y="6" width="78" height="128" rx="6" fill={C.greyD} />
  <rect x="12" y="12" width="66" height="22" rx="3" fill={C.grey} /><rect x="12" y="40" width="66" height="22" rx="3" fill={C.grey} /><rect x="12" y="68" width="66" height="22" rx="3" fill={C.grey} /><rect x="12" y="96" width="66" height="30" rx="3" fill={C.blueL} />
  <circle cx="22" cy="23" r="3" fill={C.greenL} strokeWidth={1.500} /><circle cx="22" cy="51" r="3" fill={C.greenL} strokeWidth={1.500} /><circle cx="22" cy="79" r="3" fill={C.yellow} strokeWidth={1.500} />
  <path d="M34 23h36M34 51h36M34 79h36" fill="none" stroke={C.cream} strokeWidth={3} />
</>);
const aircon = s(120, 60, <>
  <rect x="4" y="6" width="112" height="40" rx="10" fill={C.white} />
  <path d="M14 34h92" fill="none" strokeWidth={4} />
  <rect x="14" y="14" width="40" height="8" rx="3" fill={C.blueL} strokeWidth={2} />
  <circle cx="98" cy="18" r="4" fill={C.greenL} strokeWidth={2} />
  <path d="M20 50q-2 6 0 10M60 50q-2 6 0 10M100 50q-2 6 0 10" fill="none" stroke={C.blue} strokeWidth={3} />
</>);
const fan = s(90, 100, <>
  <circle cx="45" cy="38" r="32" fill={C.blueL} />
  <path d="M45 38q-6-24 6-28 12 4 0 28ZM45 38q24-6 28 6-4 12-28-6ZM45 38q6 24-6 28-12-4 0-28ZM45 38q-24 6-28-6 4-12 28 6Z" fill={C.blue} strokeWidth={2.500} />
  <circle cx="45" cy="38" r="6" fill={C.cream} strokeWidth={2.500} />
  <rect x="38" y="68" width="14" height="22" rx="3" fill={C.greyD} /><rect x="22" y="88" width="46" height="8" rx="4" fill={C.greyD} />
</>);

// ── Công ty phần mềm
const code = s(100, 80, <>
  <rect x="4" y="6" width="92" height="68" rx="8" fill={C.greyD} />
  <path d="M32 26L16 40l16 14M68 26l16 14-16 14" fill="none" stroke={C.greenL} strokeWidth={6} />
  <path d="M56 22L44 58" fill="none" stroke={C.yellow} strokeWidth={5} />
</>);
const bug = s(80, 80, <>
  <ellipse cx="40" cy="46" rx="22" ry="26" fill={C.red} />
  <circle cx="40" cy="18" r="11" fill={C.redD} />
  <path d="M40 30v40M18 36l-14-6M18 52l-14 6M62 36l14-6M62 52l14 6M34 8l-6-6M46 8l6-6" fill="none" strokeWidth={4} />
  <circle cx="30" cy="40" r="4" fill={INK} stroke="none" /><circle cx="50" cy="52" r="4" fill={INK} stroke="none" />
</>);
const versiontag = s(90, 70, <>
  <path d="M6 12h46l32 24-32 24H6Z" fill={C.green} />
  <circle cx="20" cy="36" r="6" fill={C.cream} strokeWidth={2.500} />
  <path d="M32 28h26M32 38h20M32 48h14" fill="none" stroke={C.cream} strokeWidth={4} />
</>);
const testcheck = s(80, 90, <>
  <rect x="8" y="6" width="64" height="78" rx="6" fill={C.white} />
  <path d="M18 24l6 6 10-12M18 44l6 6 10-12M18 64l6 6 10-12" fill="none" stroke={C.green} strokeWidth={5} />
  <path d="M42 26h22M42 46h22M42 66h22" fill="none" strokeWidth={4} />
</>);

// ── Phòng thí nghiệm AI
const algorithm = s(100, 90, <>
  <rect x="34" y="4" width="32" height="18" rx="9" fill={C.blueL} />
  <path d="M50 22v10" fill="none" strokeWidth={4} />
  <path d="M50 32l24 14-24 14-24-14Z" fill={C.yellow} />
  <path d="M26 46H10v22M74 46h16v22" fill="none" strokeWidth={4} />
  <rect x="2" y="68" width="30" height="18" rx="4" fill={C.green} /><rect x="68" y="68" width="30" height="18" rx="4" fill={C.pink} />
</>);
const neuralmodel = s(110, 90, <>
  <path d="M20 22L55 45 20 68M20 22L55 22M20 68L55 68M55 22L90 45M55 68L90 45M55 22L55 68M20 45L55 22M20 45L55 68" fill="none" strokeWidth={2.500} />
  <circle cx="20" cy="22" r="9" fill={C.blue} /><circle cx="20" cy="45" r="9" fill={C.blue} /><circle cx="20" cy="68" r="9" fill={C.blue} />
  <circle cx="55" cy="22" r="9" fill={C.yellow} /><circle cx="55" cy="45" r="9" fill={C.yellow} /><circle cx="55" cy="68" r="9" fill={C.yellow} />
  <circle cx="90" cy="45" r="10" fill={C.green} />
</>);
const databars = s(100, 80, <>
  <rect x="6" y="4" width="88" height="72" rx="6" fill={C.white} />
  <rect x="16" y="44" width="14" height="24" fill={C.blue} /><rect x="36" y="28" width="14" height="40" fill={C.green} /><rect x="56" y="36" width="14" height="32" fill={C.yellow} /><rect x="76" y="16" width="12" height="52" fill={C.red} />
  <path d="M12 70h82" fill="none" strokeWidth={3} />
</>);
const chip = s(90, 90, <>
  <rect x="20" y="20" width="50" height="50" rx="6" fill={C.greyD} />
  <path d="M30 20v-12M45 20v-12M60 20v-12M30 70v12M45 70v12M60 70v12M20 30h-12M20 45h-12M20 60h-12M70 30h12M70 45h12M70 60h12" fill="none" strokeWidth={5} />
  <rect x="32" y="32" width="26" height="26" rx="4" fill={C.teal} />
  <circle cx="45" cy="45" r="5" fill={C.cream} strokeWidth={2} />
</>);
const graphicscard = s(120, 70, <>
  <rect x="4" y="8" width="112" height="44" rx="6" fill={C.greyD} />
  <circle cx="38" cy="30" r="16" fill={C.grey} /><circle cx="84" cy="30" r="16" fill={C.grey} />
  <circle cx="38" cy="30" r="6" fill={C.cream} strokeWidth={2.500} /><circle cx="84" cy="30" r="6" fill={C.cream} strokeWidth={2.500} />
  <rect x="14" y="52" width="70" height="8" rx="2" fill={C.yellow} />
</>);
const webcam = s(70, 90, <>
  <circle cx="35" cy="32" r="26" fill={C.greyD} />
  <circle cx="35" cy="32" r="14" fill={C.blueL} /><circle cx="35" cy="32" r="6" fill={INK} stroke="none" />
  <path d="M30 22q4-4 8-2" fill="none" stroke={C.white} strokeWidth={3} opacity={0.8} />
  <rect x="28" y="58" width="14" height="14" fill={C.grey} /><rect x="14" y="72" width="42" height="10" rx="5" fill={C.greyD} />
</>);
const prompt = s(110, 80, <>
  <path d="M10 8h90q6 0 6 6v36q0 6-6 6H46L28 72V56H10q-6 0-6-6V14q0-6 6-6Z" fill={C.cream} />
  <path d="M18 22h40M18 34h60" fill="none" strokeWidth={4} />
  <path d="M84 20l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill={C.yellow} strokeWidth={2} />
</>);
const dronebot = s(130, 80, <>
  <ellipse cx="65" cy="46" rx="26" ry="14" fill={C.greyD} />
  <path d="M40 40L14 26M90 40l26-14" fill="none" strokeWidth={5} />
  <ellipse cx="14" cy="20" rx="14" ry="5" fill={C.blueL} /><ellipse cx="116" cy="20" rx="14" ry="5" fill={C.blueL} />
  <circle cx="65" cy="52" r="7" fill={C.blue} strokeWidth={2.500} />
  <path d="M52 66l-6 10M78 66l6 10" fill="none" strokeWidth={4} />
</>);
const roboticarm = s(120, 110, <>
  <rect x="10" y="90" width="60" height="16" rx="6" fill={C.greyD} />
  <path d="M40 90V56l32-30" fill="none" strokeWidth={16} stroke={INK} /><path d="M40 90V56l32-30" fill="none" strokeWidth={9} stroke={C.orange} />
  <circle cx="40" cy="56" r="10" fill={C.yellow} /><circle cx="72" cy="26" r="10" fill={C.yellow} />
  <path d="M76 22l22-6M80 34l20 8" fill="none" strokeWidth={6} />
</>);
const sensor = s(70, 80, <>
  <rect x="10" y="30" width="50" height="40" rx="8" fill={C.blue} />
  <circle cx="35" cy="50" r="12" fill={C.cream} /><circle cx="35" cy="50" r="5" fill={C.red} strokeWidth={2} />
  <path d="M16 20q19-18 38 0M24 26q11-9 22 0" fill="none" strokeWidth={4} />
</>);

// ── Cảng xuất nhập khẩu
const container = s(150, 80, <>
  <rect x="6" y="6" width="138" height="68" rx="3" fill={C.red} />
  <path d="M28 6v68M50 6v68M72 6v68M94 6v68M116 6v68" fill="none" stroke={C.redD} strokeWidth={4} />
  <rect x="6" y="6" width="138" height="8" fill={C.redD} stroke="none" /><rect x="6" y="66" width="138" height="8" fill={C.redD} stroke="none" />
</>);
const crane = s(160, 150, <>
  <path d="M20 146L40 40M80 146L60 40M30 100h40M24 128h52" fill="none" strokeWidth={7} />
  <rect x="6" y="28" width="140" height="14" rx="3" fill={C.yellow} />
  <path d="M96 42v44" fill="none" strokeWidth={3} />
  <rect x="82" y="86" width="30" height="20" rx="2" fill={C.blue} />
  <rect x="34" y="14" width="26" height="16" rx="3" fill={C.orange} />
</>);
const forklift = s(130, 110, <>
  <rect x="36" y="46" width="62" height="42" rx="6" fill={C.orange} />
  <path d="M46 46l10-26h30l12 26" fill={C.blueL} strokeWidth={3} />
  <rect x="6" y="20" width="10" height="80" rx="3" fill={C.greyD} />
  <path d="M10 92h36M10 70h30" fill="none" strokeWidth={6} />
  <circle cx="50" cy="94" r="14" fill={INK} /><circle cx="94" cy="94" r="14" fill={INK} />
  <circle cx="50" cy="94" r="5" fill={C.grey} strokeWidth={2} /><circle cx="94" cy="94" r="5" fill={C.grey} strokeWidth={2} />
</>);
const wharf = s(180, 90, <>
  <rect x="6" y="20" width="168" height="26" rx="4" fill={C.woodD} />
  <path d="M26 46v36M70 46v36M114 46v36M154 46v36" fill="none" strokeWidth={8} />
  <path d="M6 32h168" fill="none" stroke={C.woodL} strokeWidth={3} />
  <path d="M6 72q22-8 44 0t44 0 44 0 36 0" fill="none" stroke={C.blue} strokeWidth={4} />
  <circle cx="30" cy="14" r="6" fill={C.grey} strokeWidth={2.500} />
</>);

// ── Nhà kính
const tomato = s(70, 70, <>
  <circle cx="35" cy="42" r="26" fill={C.red} />
  <path d="M20 22q15 8 30 0-6 10-15 6-9 4-15-6Z" fill={C.green} />
  <path d="M35 8v12" fill="none" strokeWidth={4} />
  <path d="M22 36q2-6 8-8" fill="none" stroke={C.white} strokeWidth={3} opacity={0.7} />
</>);
const cucumber = s(110, 60, <>
  <path d="M10 40q0-22 30-26l56-4q10 4 6 18-4 14-24 18L30 56q-20 2-20-16Z" fill={C.green} />
  <path d="M30 24l4 4M48 20l4 4M66 18l4 4M84 22l4 4M44 38l4 4M62 34l4 4" fill="none" stroke={C.greenD} strokeWidth={4} />
</>);
const seedling = s(70, 90, <>
  <path d="M10 56h50l-6 30H16Z" fill={C.clay} />
  <path d="M35 56V30" fill="none" strokeWidth={5} />
  <path d="M35 36q-24-2-26-22 22 0 26 22ZM35 30q22-4 26-22-22 2-26 22Z" fill={C.green} />
</>);
const fertilizer = s(70, 100, <>
  <path d="M10 14q25-8 50 0l4 78q-29 8-58 0Z" fill={C.cream} />
  <rect x="18" y="38" width="34" height="30" rx="4" fill={C.green} />
  <path d="M26 54h18M35 46v16" fill="none" stroke={C.cream} strokeWidth={4} />
  <path d="M10 14q25 6 50 0" fill="none" strokeWidth={3} />
</>);
const seedtray = s(130, 70, <>
  <path d="M6 32h118l-12 34H18Z" fill={C.brown} />
  <path d="M34 32v34M62 32v34M90 32v34" fill="none" stroke={C.woodD} strokeWidth={3} />
  <path d="M20 30q4-20 10 0M48 30q4-20 10 0M76 30q4-20 10 0M102 30q4-20 10 0" fill="none" stroke={C.green} strokeWidth={6} />
</>);
const shadenet = s(130, 80, <>
  <rect x="6" y="10" width="118" height="56" rx="4" fill={C.greenD} opacity={0.85} />
  <path d="M6 24h118M6 38h118M6 52h118M30 10v56M54 10v56M78 10v56M102 10v56" fill="none" strokeWidth={2} stroke={C.green} />
  <path d="M10 70v8M120 70v8" fill="none" strokeWidth={5} />
</>);
const dripline = s(140, 60, <>
  <path d="M6 24h128" fill="none" strokeWidth={10} stroke={INK} /><path d="M6 24h128" fill="none" strokeWidth={5} stroke={C.greyD} />
  <path d="M26 34v10M58 34v10M90 34v10M120 34v10" fill="none" stroke={C.blue} strokeWidth={5} />
  <circle cx="26" cy="50" r="3" fill={C.blue} stroke="none" /><circle cx="90" cy="50" r="3" fill={C.blue} stroke="none" />
</>);
const veggiebed = s(160, 70, <>
  <path d="M6 30h148l-10 36H16Z" fill={C.brown} />
  <path d="M26 30q4-22 12 0M56 30q4-22 12 0M86 30q4-22 12 0M116 30q4-22 12 0" fill="none" stroke={C.green} strokeWidth={7} />
  <path d="M6 30h148" fill="none" stroke={C.woodD} strokeWidth={4} />
</>);

export const VENUE8_SPRITES: Record<string, FlatSprite> = {
  server, harddisk, firewall, netswitch, rack, aircon, fan,
  code, bug, versiontag, testcheck,
  algorithm, neuralmodel, databars, chip, graphicscard, webcam, prompt, dronebot, roboticarm, sensor,
  container, crane, forklift, wharf,
  tomato, cucumber, seedling, fertilizer, seedtray, shadenet, dripline, veggiebed,
};
