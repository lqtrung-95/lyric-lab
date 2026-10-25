import { C, LINE, type FlatSprite } from "./flat-kit";

const bed: FlatSprite = {
  w: 120, h: 86,
  node: (
    <g {...LINE}>
      <rect x="8" y="4" width="104" height="50" rx="10" fill={C.woodD} />
      <rect x="15" y="11" width="90" height="34" rx="6" fill={C.wood} strokeWidth={2} />
      <rect x="16" y="26" width="40" height="22" rx="10" fill={C.white} />
      <rect x="64" y="26" width="40" height="22" rx="10" fill={C.white} />
      <rect x="10" y="76" width="14" height="9" rx="3" fill={C.woodD} />
      <rect x="96" y="76" width="14" height="9" rx="3" fill={C.woodD} />
      <rect x="4" y="42" width="112" height="36" rx="9" fill={C.wood} />
      <rect x="4" y="46" width="112" height="28" rx="9" fill={C.green} />
      <rect x="4" y="46" width="112" height="11" rx="5.5" fill={C.greenL} />
      {[[24, 66], [48, 68], [72, 65], [96, 68], [36, 72], [84, 72]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill={C.greenD} stroke="none" />)}
    </g>
  ),
};

const table: FlatSprite = {
  w: 120, h: 76,
  node: (
    <g {...LINE}>
      <rect x="14" y="30" width="12" height="44" rx="3" fill={C.woodD} />
      <rect x="94" y="30" width="12" height="44" rx="3" fill={C.woodD} />
      <rect x="26" y="46" width="68" height="7" rx="3" fill={C.wood} />
      <rect x="4" y="8" width="112" height="26" rx="8" fill={C.wood} />
      <rect x="4" y="8" width="112" height="16" rx="8" fill={C.woodL} />
    </g>
  ),
};

const chair: FlatSprite = {
  w: 56, h: 80,
  node: (
    <g {...LINE}>
      <rect x="6" y="44" width="9" height="34" rx="3" fill={C.woodD} />
      <rect x="41" y="44" width="9" height="34" rx="3" fill={C.woodD} />
      <rect x="8" y="2" width="40" height="38" rx="9" fill={C.wood} />
      <path d="M20 9V32M28 9V32M36 9V32" strokeWidth={2.5} fill="none" />
      <rect x="2" y="36" width="52" height="14" rx="6" fill={C.woodL} />
    </g>
  ),
};

const door: FlatSprite = {
  w: 70, h: 110,
  node: (
    <g {...LINE}>
      <path d="M6 108V42a29 29 0 0 1 58 0V108Z" fill={C.woodD} />
      <path d="M14 108V43a21 21 0 0 1 42 0V108Z" fill={C.wood} />
      <circle cx="35" cy="42" r="9" fill={C.blueL} />
      <rect x="21" y="58" width="28" height="20" rx="5" fill={C.woodL} strokeWidth={2.5} />
      <rect x="21" y="84" width="28" height="20" rx="5" fill={C.woodL} strokeWidth={2.5} />
      <circle cx="50" cy="81" r="4" fill={C.yellow} strokeWidth={2.5} />
    </g>
  ),
};

const windowSprite: FlatSprite = {
  w: 90, h: 90,
  node: (
    <g {...LINE}>
      <rect x="4" y="4" width="82" height="76" rx="10" fill={C.wood} />
      <rect x="12" y="12" width="66" height="60" rx="5" fill={C.blueL} />
      <circle cx="60" cy="27" r="7" fill={C.yellow} strokeWidth={2.5} />
      <path d="M45 12V72M12 42H78" strokeWidth={5} fill="none" />
      <path d="M12 12h16q-3 30 0 60H12Z" fill={C.green} strokeWidth={2.5} />
      <path d="M78 12H62q3 30 0 60h16Z" fill={C.green} strokeWidth={2.5} />
      <rect x="0" y="76" width="90" height="12" rx="5" fill={C.woodL} />
    </g>
  ),
};

const lamp: FlatSprite = {
  w: 50, h: 120,
  node: (
    <g {...LINE}>
      <rect x="22" y="44" width="6" height="62" rx="3" fill={C.woodD} />
      <path d="M12 4h26l9 40H3Z" fill={C.cream} />
      <path d="M17 10h6l-3 28h-6Z" fill={C.white} stroke="none" opacity={0.8} />
      <rect x="6" y="102" width="38" height="14" rx="7" fill={C.wood} />
    </g>
  ),
};

const tv: FlatSprite = {
  w: 100, h: 84,
  node: (
    <g {...LINE}>
      <path d="M38 14L26 2M62 14L76 2" fill="none" />
      <rect x="16" y="72" width="10" height="10" rx="3" fill={C.woodD} />
      <rect x="74" y="72" width="10" height="10" rx="3" fill={C.woodD} />
      <rect x="4" y="14" width="92" height="60" rx="12" fill={C.wood} />
      <rect x="12" y="22" width="60" height="44" rx="8" fill={C.blueL} />
      <path d="M20 32q8-4 16-2" stroke={C.white} strokeWidth={4} fill="none" />
      <circle cx="84" cy="32" r="5" fill={C.yellow} strokeWidth={2.5} />
      <circle cx="84" cy="48" r="5" fill={C.orange} strokeWidth={2.5} />
      <path d="M79 60h10M79 65h10" strokeWidth={2} fill="none" />
    </g>
  ),
};

export const FURNITURE_SPRITES: Record<string, FlatSprite> = { bed, table, chair, door, window: windowSprite, lamp, tv };
