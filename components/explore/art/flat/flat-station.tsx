import { C, LINE, type FlatSprite } from "./flat-kit";

const train: FlatSprite = {
  w: 130, h: 70,
  node: (
    <g {...LINE}>
      <rect x="4" y="6" width="122" height="46" rx="14" fill={C.blue} />
      <rect x="4" y="34" width="122" height="10" fill={C.red} stroke="none" />
      <rect x="4" y="6" width="122" height="46" rx="14" fill="none" />
      {[16, 48, 80].map((x) => <rect key={x} x={x} y="14" width="24" height="18" rx="4" fill={C.blueL} strokeWidth={2.5} />)}
      <rect x="106" y="14" width="14" height="22" rx="4" fill={C.blueL} strokeWidth={2.5} />
      <circle cx="26" cy="58" r="8" fill={C.greyD} />
      <circle cx="64" cy="58" r="8" fill={C.greyD} />
      <circle cx="104" cy="58" r="8" fill={C.greyD} />
    </g>
  ),
};

const ticket: FlatSprite = {
  w: 60, h: 40,
  node: (
    <g {...LINE}>
      <path d="M4 6h52v10a5 5 0 0 0 0 10v10H4V26a5 5 0 0 0 0-10Z" fill={C.yellow} />
      <rect x="8" y="9" width="44" height="5" rx="2" fill={C.orange} stroke="none" />
      <path d="M40 8v26" strokeDasharray="3 4" fill="none" strokeWidth={2} />
      <path d="M12 16h20M12 24h14" fill="none" strokeWidth={3} />
    </g>
  ),
};

const clock: FlatSprite = {
  w: 56, h: 56,
  node: (
    <g {...LINE}>
      <circle cx="28" cy="28" r="23" fill={C.cream} />
      <circle cx="28" cy="28" r="23" fill="none" stroke={C.red} strokeWidth={5} />
      <circle cx="28" cy="28" r="23" fill="none" />
      <path d="M28 14v14l9 6" fill="none" strokeWidth={3.5} />
      <circle cx="28" cy="28" r="2.5" fill={C.red} strokeWidth={2} />
    </g>
  ),
};

const suitcase: FlatSprite = {
  w: 64, h: 62,
  node: (
    <g {...LINE}>
      <path d="M22 14V8q0-4 4-4h12q4 0 4 4v6" fill="none" strokeWidth={3.5} />
      <rect x="4" y="14" width="56" height="42" rx="8" fill={C.orange} />
      <rect x="4" y="14" width="56" height="12" rx="6" fill={C.yellow} strokeWidth={2.5} />
      <path d="M20 26v30M44 26v30" fill="none" strokeWidth={2.5} />
      <circle cx="16" cy="58" r="3" fill={C.greyD} strokeWidth={2} />
      <circle cx="48" cy="58" r="3" fill={C.greyD} strokeWidth={2} />
    </g>
  ),
};

const map: FlatSprite = {
  w: 64, h: 52,
  node: (
    <g {...LINE}>
      <path d="M4 10l16-6 24 6 16-6v38l-16 6-24-6-16 6Z" fill={C.cream} />
      <path d="M20 4v38M44 10v38" fill="none" strokeWidth={2.5} />
      <path d="M10 24q8-8 14 0t14 2" fill="none" stroke={C.blue} strokeWidth={3} />
      <circle cx="50" cy="22" r="4" fill={C.red} strokeWidth={2.5} />
    </g>
  ),
};

const phone: FlatSprite = {
  w: 34, h: 58,
  node: (
    <g {...LINE}>
      <rect x="4" y="3" width="26" height="52" rx="7" fill={C.greyD} />
      <rect x="8" y="10" width="18" height="34" rx="2" fill={C.blueL} strokeWidth={2} />
      <path d="M12 18h10M12 25h7" fill="none" stroke={C.blue} strokeWidth={3} />
      <circle cx="17" cy="49" r="2.5" fill={C.cream} strokeWidth={2} />
    </g>
  ),
};

const newspaper: FlatSprite = {
  w: 62, h: 48,
  node: (
    <g {...LINE}>
      <rect x="4" y="6" width="54" height="38" rx="4" fill={C.cream} />
      <rect x="10" y="12" width="42" height="8" rx="2" fill={C.grey} strokeWidth={2} />
      <rect x="10" y="26" width="14" height="12" rx="2" fill={C.blueL} strokeWidth={2} />
      <path d="M30 28h22M30 35h22" fill="none" strokeWidth={2.5} />
    </g>
  ),
};

export const STATION_SPRITES: Record<string, FlatSprite> = { train, ticket, clock, suitcase, map, phone, newspaper };
