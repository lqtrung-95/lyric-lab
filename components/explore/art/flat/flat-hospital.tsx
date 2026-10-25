import { C, LINE, type FlatSprite } from "./flat-kit";

const medicine: FlatSprite = {
  w: 40, h: 54,
  node: (
    <g {...LINE}>
      <rect x="6" y="4" width="28" height="10" rx="3" fill={C.red} />
      <rect x="4" y="14" width="32" height="38" rx="8" fill={C.white} />
      <path d="M20 24v16M12 32h16" fill="none" stroke={C.red} strokeWidth={5} />
      <rect x="4" y="14" width="32" height="38" rx="8" fill="none" />
    </g>
  ),
};

const thermometer: FlatSprite = {
  w: 60, h: 28,
  node: (
    <g {...LINE}>
      <rect x="4" y="8" width="50" height="12" rx="6" fill={C.cream} />
      <rect x="8" y="12" width="28" height="4" rx="2" fill={C.red} stroke="none" />
      <circle cx="46" cy="14" r="6" fill={C.red} strokeWidth={2.5} />
      <path d="M38 8v4M30 8v3M22 8v4" fill="none" strokeWidth={2} />
    </g>
  ),
};

const mask: FlatSprite = {
  w: 60, h: 40,
  node: (
    <g {...LINE}>
      <path d="M4 14q-2-8 4-8M56 14q2-8-4-8" fill="none" strokeWidth={3} />
      <rect x="8" y="6" width="44" height="28" rx="9" fill={C.blueL} />
      <path d="M12 14h36M12 20h36" fill="none" strokeWidth={2} />
      <rect x="8" y="24" width="44" height="6" rx="3" fill={C.blue} strokeWidth={2} />
    </g>
  ),
};

const glasses: FlatSprite = {
  w: 64, h: 32,
  node: (
    <g {...LINE}>
      <circle cx="18" cy="18" r="11" fill={C.blueL} />
      <circle cx="46" cy="18" r="11" fill={C.blueL} />
      <path d="M29 17q3-3 6 0M7 16L2 8M57 16l5-8" fill="none" strokeWidth={3} />
      <path d="M12 14q3-3 7-2" fill="none" stroke={C.white} strokeWidth={2.5} />
    </g>
  ),
};

export const HOSPITAL_SPRITES: Record<string, FlatSprite> = { medicine, thermometer, mask, glasses };
