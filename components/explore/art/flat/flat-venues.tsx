import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const fridge: FlatSprite = {
  w: 60, h: 100,
  node: (
    <g {...LINE}>
      <rect x="6" y="4" width="48" height="92" rx="9" fill={C.blueL} />
      <path d="M6 38h48" fill="none" strokeWidth={3} />
      <rect x="40" y="14" width="5" height="18" rx="2.500" fill={C.greyD} strokeWidth={2} />
      <rect x="40" y="48" width="5" height="26" rx="2.500" fill={C.greyD} strokeWidth={2} />
      <rect x="14" y="14" width="14" height="10" rx="3" fill={C.yellow} strokeWidth={2} />
    </g>
  ),
};

const pot: FlatSprite = {
  w: 80, h: 56,
  node: (
    <g {...LINE}>
      <rect x="2" y="18" width="14" height="8" rx="4" fill={C.greyD} strokeWidth={2.500} />
      <rect x="64" y="18" width="14" height="8" rx="4" fill={C.greyD} strokeWidth={2.500} />
      <path d="M10 14h60v26q0 12-12 12H22Q10 52 10 40Z" fill={C.grey} />
      <ellipse cx="40" cy="14" rx="30" ry="6" fill={C.greyD} />
      <path d="M26 6q-4-6 0-10M40 6q-4-6 0-10M54 6q-4-6 0-10" fill="none" strokeWidth={2.500} stroke={C.white} />
    </g>
  ),
};

const painting: FlatSprite = {
  w: 90, h: 76,
  node: (
    <g {...LINE}>
      <rect x="4" y="4" width="82" height="68" rx="5" fill={C.woodD} />
      <rect x="12" y="12" width="66" height="52" rx="2" fill={C.blueL} strokeWidth={2.500} />
      <path d="M12 50q16-14 30-4t36-6v24H12Z" fill={C.green} strokeWidth={2.500} />
      <circle cx="62" cy="26" r="8" fill={C.yellow} strokeWidth={2.500} />
      <path d="M26 34l5-8 5 8Z" fill={C.red} strokeWidth={2} />
    </g>
  ),
};

const vase: FlatSprite = {
  w: 50, h: 84,
  node: (
    <g {...LINE}>
      <path d="M17 6h16l-2 12q16 6 16 30q0 30-21 30T4 48q0-24 16-30Z" fill={C.teal} />
      <ellipse cx="25" cy="6" rx="10" ry="3.500" fill={C.greyD} strokeWidth={2.500} />
      <path d="M12 42q13-8 26 0M12 54q13-8 26 0" fill="none" stroke={C.cream} strokeWidth={3} />
      <circle cx="18" cy="30" r="2.500" fill={C.yellow} strokeWidth={2} />
    </g>
  ),
};

const statue: FlatSprite = {
  w: 60, h: 110,
  node: (
    <g {...LINE}>
      <rect x="6" y="88" width="48" height="18" rx="4" fill={C.grey} />
      <rect x="12" y="76" width="36" height="14" rx="3" fill={C.greyD} />
      <path d="M18 76q-4-30 2-44h20q6 14 2 44Z" fill={C.cream} />
      <circle cx="30" cy="22" r="14" fill={C.cream} />
      <path d="M22 30q8 7 16 0" fill="none" strokeWidth={2.500} />
      <circle cx="25" cy="21" r="1.800" fill={INK} stroke="none" />
      <circle cx="35" cy="21" r="1.800" fill={INK} stroke="none" />
    </g>
  ),
};

const goal: FlatSprite = {
  w: 120, h: 70,
  node: (
    <g {...LINE}>
      <path d="M8 66V8h104v58" fill="none" strokeWidth={5} stroke={C.white} />
      <path d="M8 66V8h104v58" fill="none" />
      <rect x="4" y="4" width="112" height="8" rx="4" fill={C.white} />
      <rect x="4" y="12" width="8" height="56" rx="3" fill={C.white} />
      <rect x="108" y="12" width="8" height="56" rx="3" fill={C.white} />
      <path d="M20 14v52M36 14v52M52 14v52M68 14v52M84 14v52M100 14v52M14 26h92M14 44h92" fill="none" strokeWidth={1.800} opacity={0.6} />
    </g>
  ),
};

const trophy: FlatSprite = {
  w: 56, h: 74,
  node: (
    <g {...LINE}>
      <path d="M12 12q-10 0-8 12t14 12M44 12q10 0 8 12t-14 12" fill="none" strokeWidth={4} />
      <path d="M12 6h32v18q0 16-16 18Q12 40 12 24Z" fill={C.yellow} />
      <rect x="24" y="40" width="8" height="14" fill={C.yellow} />
      <rect x="14" y="54" width="28" height="8" rx="3" fill={C.orange} />
      <rect x="10" y="62" width="36" height="8" rx="3" fill={C.brown} />
      <path d="M24 14l4 6 4-6" fill="none" strokeWidth={2} />
    </g>
  ),
};

export const VENUE_SPRITES: Record<string, FlatSprite> = { fridge, pot, painting, vase, statue, goal, trophy };
