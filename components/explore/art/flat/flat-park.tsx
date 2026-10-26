import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const tree: FlatSprite = {
  w: 90, h: 130,
  node: (
    <g {...LINE}>
      <rect x="36" y="70" width="18" height="56" rx="4" fill={C.brown} />
      <circle cx="45" cy="40" r="34" fill={C.green} />
      <circle cx="24" cy="58" r="22" fill={C.green} />
      <circle cx="66" cy="58" r="22" fill={C.green} />
      <circle cx="45" cy="52" r="26" fill={C.green} stroke="none" />
      <circle cx="34" cy="30" r="7" fill={C.greenL} stroke="none" />
      <circle cx="58" cy="62" r="4" fill={C.red} strokeWidth={2} />
    </g>
  ),
};

const bench: FlatSprite = {
  w: 110, h: 64,
  node: (
    <g {...LINE}>
      <rect x="10" y="30" width="8" height="30" rx="2" fill={C.woodD} />
      <rect x="92" y="30" width="8" height="30" rx="2" fill={C.woodD} />
      <rect x="4" y="4" width="102" height="10" rx="4" fill={C.wood} />
      <rect x="4" y="17" width="102" height="10" rx="4" fill={C.wood} />
      <rect x="2" y="32" width="106" height="12" rx="5" fill={C.woodL} />
    </g>
  ),
};

const bird: FlatSprite = {
  w: 50, h: 44,
  node: (
    <g {...LINE}>
      <path d="M4 18l8-2" fill="none" strokeWidth={3} />
      <path d="M4 18l-2 4 8 0Z" fill={C.orange} strokeWidth={2} />
      <ellipse cx="26" cy="24" rx="19" ry="15" fill={C.blue} />
      <path d="M18 24q10 14 24 2q-6-8-12-8Z" fill={C.blueL} strokeWidth={2.5} />
      <circle cx="16" cy="18" r="2.5" fill={C.white} strokeWidth={2} />
      <path d="M20 40v3M30 40v3" fill="none" strokeWidth={2.5} />
    </g>
  ),
};

/** Chó con nhìn thẳng (dùng làm NPC và vật trong công viên): đầu to tròn, tai cụp nâu, mắt to long lanh, mõm kem, lưỡi hồng, vòng cổ đỏ có thẻ vàng, đuôi vẫy. */
const dog: FlatSprite = {
  w: 84, h: 96,
  node: (
    <g {...LINE}>
      <path d="M62 80q18-2 14-22" fill="none" strokeWidth={10} />
      <path d="M62 80q18-2 14-22" fill="none" stroke={C.wood} strokeWidth={5} />
      <ellipse cx="42" cy="72" rx="22" ry="21" fill={C.wood} />
      <ellipse cx="42" cy="77" rx="12" ry="13" fill={C.cream} strokeWidth={2.5} />
      <ellipse cx="30" cy="91" rx="9" ry="5" fill={C.cream} />
      <ellipse cx="54" cy="91" rx="9" ry="5" fill={C.cream} />
      <path d="M30 88v3M54 88v3" fill="none" strokeWidth={2} />
      <ellipse cx="13" cy="36" rx="9" ry="17" fill={C.brown} transform="rotate(14 13 36)" />
      <ellipse cx="71" cy="36" rx="9" ry="17" fill={C.brown} transform="rotate(-14 71 36)" />
      <ellipse cx="42" cy="36" rx="28" ry="25" fill={C.wood} />
      <ellipse cx="42" cy="47" rx="15" ry="11" fill={C.cream} strokeWidth={2.5} />
      <circle cx="31" cy="32" r="5" fill={INK} stroke="none" />
      <circle cx="53" cy="32" r="5" fill={INK} stroke="none" />
      <circle cx="32.800" cy="30" r="1.900" fill={C.white} stroke="none" />
      <circle cx="54.800" cy="30" r="1.900" fill={C.white} stroke="none" />
      <path d="M26 24q5-4 10-1M48 23q5-3 10 1" fill="none" strokeWidth={2.500} />
      <ellipse cx="42" cy="42" rx="5.500" ry="4" fill={INK} stroke="none" />
      <ellipse cx="40.500" cy="40.500" rx="1.800" ry="1.100" fill={C.white} stroke="none" />
      <path d="M42 46v3M42 49q-5 5-9 1M42 49q5 5 9 1" fill="none" strokeWidth={2.200} />
      <ellipse cx="42" cy="55" rx="4" ry="5" fill={C.pink} strokeWidth={2.200} />
      <ellipse cx="22" cy="46" rx="4.500" ry="3" fill={C.pink} stroke="none" opacity={0.85} />
      <ellipse cx="62" cy="46" rx="4.500" ry="3" fill={C.pink} stroke="none" opacity={0.85} />
      <path d="M26 59q16 8 32 0l1 6q-17 9-34 0Z" fill={C.red} strokeWidth={2.500} />
      <circle cx="42" cy="68" r="4.500" fill={C.yellow} strokeWidth={2.500} />
    </g>
  ),
};

const ball: FlatSprite = {
  w: 46, h: 46,
  node: (
    <g {...LINE}>
      <circle cx="23" cy="23" r="19" fill={C.red} />
      <path d="M5 23h36" fill="none" strokeWidth={4} stroke={C.white} />
      <circle cx="23" cy="23" r="19" fill="none" />
      <circle cx="23" cy="23" r="6" fill={C.white} strokeWidth={2.5} />
    </g>
  ),
};

const bicycle: FlatSprite = {
  w: 96, h: 64,
  node: (
    <g {...LINE}>
      <circle cx="20" cy="42" r="16" fill="none" strokeWidth={4} />
      <circle cx="76" cy="42" r="16" fill="none" strokeWidth={4} />
      <path d="M20 42l22-22h22l12 22M42 20l-6 22h28" fill="none" stroke={C.red} strokeWidth={4.5} />
      <path d="M20 42l22-22h22l12 22M42 20l-6 22h28" fill="none" />
      <path d="M30 14h14M64 20l-4-10h8" fill="none" strokeWidth={4} />
      <circle cx="20" cy="42" r="3" fill={C.grey} strokeWidth={2} />
      <circle cx="76" cy="42" r="3" fill={C.grey} strokeWidth={2} />
    </g>
  ),
};

const kite: FlatSprite = {
  w: 56, h: 90,
  node: (
    <g {...LINE}>
      <path d="M28 4l22 24-22 36L6 28Z" fill={C.yellow} />
      <path d="M28 4v60M6 28h44" fill="none" strokeWidth={2.5} />
      <path d="M28 4l22 24H28Z" fill={C.red} strokeWidth={2.5} />
      <path d="M28 64q-8 6 0 12t0 12" fill="none" strokeWidth={2.5} />
    </g>
  ),
};

const sun: FlatSprite = {
  w: 80, h: 80,
  node: (
    <g {...LINE}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <path key={i} d={`M${(40 + 26 * Math.cos(a)).toFixed(1)} ${(40 + 26 * Math.sin(a)).toFixed(1)}L${(40 + 36 * Math.cos(a)).toFixed(1)} ${(40 + 36 * Math.sin(a)).toFixed(1)}`} fill="none" strokeWidth={5} stroke={C.orange} />;
      })}
      <circle cx="40" cy="40" r="22" fill={C.yellow} />
      <circle cx="33" cy="33" r="6" fill={C.cream} stroke="none" opacity={0.7} />
    </g>
  ),
};

const umbrella: FlatSprite = {
  w: 76, h: 74,
  node: (
    <g {...LINE}>
      <path d="M38 30v34q0 8-8 8" fill="none" strokeWidth={4} />
      <path d="M4 34Q8 6 38 4t34 30q-8-8-17 0-8-8-17 0-9-8-17 0-9-8-17 0Z" fill={C.red} />
      <path d="M38 4q-12 14-17 30M38 4q12 14 17 30" fill="none" strokeWidth={2.5} />
      <circle cx="38" cy="4" r="3" fill={C.yellow} strokeWidth={2} />
    </g>
  ),
};

export const PARK_SPRITES: Record<string, FlatSprite> = { tree, bench, bird, dog, ball, bicycle, kite, sun, umbrella };
