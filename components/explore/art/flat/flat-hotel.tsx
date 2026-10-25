import { C, LINE, type FlatSprite } from "./flat-kit";

const key: FlatSprite = {
  w: 56, h: 30,
  node: (
    <g {...LINE}>
      <circle cx="14" cy="15" r="10" fill={C.yellow} />
      <circle cx="14" cy="15" r="3.5" fill={C.cream} strokeWidth={2} />
      <path d="M24 15h28M44 15v8M36 15v6" fill="none" strokeWidth={5} />
      <path d="M24 15h28M44 15v8M36 15v6" fill="none" stroke={C.yellow} strokeWidth={2} />
    </g>
  ),
};

const towel: FlatSprite = {
  w: 56, h: 50,
  node: (
    <g {...LINE}>
      <path d="M6 8h40q4 0 4 4v26q0 4-4 4H10q-4 0-4-4Z" fill={C.blueL} />
      <rect x="6" y="14" width="44" height="7" fill={C.blue} stroke="none" />
      <rect x="6" y="28" width="44" height="7" fill={C.blue} stroke="none" />
      <path d="M6 8h40q4 0 4 4v26q0 4-4 4H10q-4 0-4-4Z" fill="none" />
      <path d="M12 42v5M20 42v5M28 42v5M36 42v5M44 42v5" fill="none" strokeWidth={2.500} />
    </g>
  ),
};

const duck: FlatSprite = {
  w: 80, h: 100,
  node: (
    <g {...LINE}>
      <rect x="22" y="86" width="12" height="10" rx="3" fill={C.orange} />
      <rect x="46" y="86" width="12" height="10" rx="3" fill={C.orange} />
      <ellipse cx="40" cy="64" rx="26" ry="26" fill={C.yellow} />
      <ellipse cx="40" cy="70" rx="15" ry="16" fill={C.cream} strokeWidth={2.500} />
      <circle cx="40" cy="30" r="22" fill={C.yellow} />
      <path d="M26 38q14 10 28 0q-2 10-14 10t-14-10Z" fill={C.orange} />
      <circle cx="31" cy="26" r="3" fill={C.white} strokeWidth={2.500} />
      <circle cx="49" cy="26" r="3" fill={C.white} strokeWidth={2.500} />
      <path d="M32 8q8-8 16 0" fill="none" strokeWidth={3} />
    </g>
  ),
};

export const HOTEL_SPRITES: Record<string, FlatSprite> = { key, towel, duck };
