import { C, LINE, type FlatSprite } from "./flat-kit";

const plane: FlatSprite = {
  w: 140, h: 60,
  node: (
    <g {...LINE}>
      <path d="M8 26q0-14 20-14h82q26 0 26 16t-26 16H28Q8 44 8 26Z" fill={C.white} />
      <path d="M50 22L74 4h14L74 24ZM50 34L74 52h14L74 32Z" fill={C.blue} />
      <path d="M8 26q0-8 8-12" fill="none" />
      <path d="M110 22h18v8h-18Z" fill={C.blueL} strokeWidth={2.500} />
      {[30, 44, 58, 90].map((x) => <circle key={x} cx={x} cy="26" r="3.5" fill={C.blueL} strokeWidth={2} />)}
      <path d="M8 34h130" fill="none" stroke={C.red} strokeWidth={3} />
    </g>
  ),
};

const passport: FlatSprite = {
  w: 42, h: 56,
  node: (
    <g {...LINE}>
      <rect x="4" y="3" width="34" height="50" rx="5" fill={C.red} />
      <circle cx="21" cy="22" r="9" fill="none" stroke={C.yellow} strokeWidth={3} />
      <path d="M12 22h18M21 13v18" fill="none" stroke={C.yellow} strokeWidth={2} />
      <path d="M11 42h20" fill="none" stroke={C.yellow} strokeWidth={3.500} />
    </g>
  ),
};

const pig: FlatSprite = {
  w: 84, h: 100,
  node: (
    <g {...LINE}>
      <rect x="22" y="86" width="14" height="10" rx="3" fill={C.pink} />
      <rect x="48" y="86" width="14" height="10" rx="3" fill={C.pink} />
      <ellipse cx="42" cy="64" rx="27" ry="26" fill={C.pink} />
      <path d="M24 56h36v24H24Z" fill={C.blue} stroke="none" />
      <path d="M24 56h36v24H24Z" fill="none" />
      <circle cx="42" cy="30" r="23" fill={C.pink} />
      <path d="M22 14l-4-10 14 6ZM62 14l4-10-14 6Z" fill={C.pink} />
      <ellipse cx="42" cy="38" rx="11" ry="8" fill={C.clay} strokeWidth={2.500} />
      <circle cx="38" cy="38" r="1.8" fill={C.brown} stroke="none" />
      <circle cx="46" cy="38" r="1.8" fill={C.brown} stroke="none" />
      <circle cx="32" cy="24" r="3" fill={C.white} strokeWidth={2.500} />
      <circle cx="52" cy="24" r="3" fill={C.white} strokeWidth={2.500} />
    </g>
  ),
};

export const AIRPORT_SPRITES: Record<string, FlatSprite> = { plane, passport, pig };
