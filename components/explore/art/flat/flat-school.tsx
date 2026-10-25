import { C, LINE, type FlatSprite } from "./flat-kit";

const blackboard: FlatSprite = {
  w: 120, h: 70,
  node: (
    <g {...LINE}>
      <rect x="4" y="4" width="112" height="58" rx="6" fill={C.wood} />
      <rect x="11" y="11" width="98" height="44" rx="3" fill={C.greenD} />
      <path d="M22 26h40M22 36h56M22 46h30" fill="none" stroke={C.white} strokeWidth={4} />
      <rect x="82" y="44" width="22" height="7" rx="2" fill={C.cream} strokeWidth={2.5} />
      <rect x="16" y="62" width="88" height="6" rx="3" fill={C.woodD} />
    </g>
  ),
};

const schoolbag: FlatSprite = {
  w: 56, h: 64,
  node: (
    <g {...LINE}>
      <path d="M18 14q0-10 10-10t10 10" fill="none" strokeWidth={3.5} />
      <rect x="4" y="12" width="48" height="48" rx="12" fill={C.blue} />
      <rect x="12" y="34" width="32" height="20" rx="6" fill={C.blueL} strokeWidth={2.5} />
      <path d="M28 34v8" fill="none" strokeWidth={2.5} />
      <circle cx="28" cy="44" r="3" fill={C.yellow} strokeWidth={2} />
    </g>
  ),
};

const ruler: FlatSprite = {
  w: 74, h: 24,
  node: (
    <g {...LINE}>
      <rect x="4" y="4" width="66" height="16" rx="3" fill={C.yellow} />
      <rect x="4" y="4" width="12" height="16" rx="3" fill={C.orange} strokeWidth={2.5} />
      <path d="M24 4v7M34 4v5M44 4v7M54 4v5M64 4v7" fill="none" strokeWidth={2.5} />
      <circle cx="10" cy="12" r="2" fill={C.cream} strokeWidth={2} />
    </g>
  ),
};

export const SCHOOL_SPRITES: Record<string, FlatSprite> = { blackboard, schoolbag, ruler };
