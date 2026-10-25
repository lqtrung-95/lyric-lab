import { C, LINE, type FlatSprite } from "./flat-kit";

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

const dog: FlatSprite = {
  w: 86, h: 66,
  node: (
    <g {...LINE}>
      <path d="M74 26q10-8 8-16" fill="none" strokeWidth={5} />
      <rect x="14" y="48" width="9" height="15" rx="3" fill={C.clay} />
      <rect x="54" y="48" width="9" height="15" rx="3" fill={C.clay} />
      <ellipse cx="46" cy="38" rx="30" ry="18" fill={C.wood} />
      <rect x="26" y="48" width="9" height="15" rx="3" fill={C.clay} />
      <rect x="62" y="48" width="9" height="15" rx="3" fill={C.clay} />
      <circle cx="22" cy="22" r="16" fill={C.wood} />
      <path d="M10 10l-4 18 10-4Z" fill={C.clay} />
      <circle cx="18" cy="21" r="2.5" fill={C.brown} strokeWidth={2} />
      <ellipse cx="12" cy="28" rx="5" ry="4" fill={C.brown} strokeWidth={2} />
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
