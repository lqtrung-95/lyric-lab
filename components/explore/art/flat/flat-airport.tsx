import { C, INK, LINE, type FlatSprite } from "./flat-kit";

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
      <path d="M66 78q12-2 10 8t-10 2" fill="none" strokeWidth={9} />
      <path d="M66 78q12-2 10 8t-10 2" fill="none" stroke={C.pink} strokeWidth={4.5} />
      <ellipse cx="42" cy="73" rx="23" ry="22" fill={C.pink} />
      <path d="M26 66q16 9 32 0l2 20q-18 8-36 0Z" fill={C.blue} strokeWidth={2.500} />
      <path d="M36 70h12v5H36Z" fill={C.yellow} strokeWidth={2} />
      <ellipse cx="30" cy="94" rx="9" ry="5" fill={C.clay} />
      <ellipse cx="54" cy="94" rx="9" ry="5" fill={C.clay} />
      <path d="M30 91v3M54 91v3" fill="none" strokeWidth={2} />
      <path d="M17 26q-12-10-8-20 11-1 20 10Z" fill={C.pink} />
      <path d="M67 26q12-10 8-20-11-1-20 10Z" fill={C.pink} />
      <path d="M17 22q-6-6-4-12 6 1 11 7ZM67 22q6-6 4-12-6 1-11 7Z" fill={C.clay} stroke="none" opacity={0.7} />
      <ellipse cx="42" cy="38" rx="29" ry="26" fill={C.pink} />
      <circle cx="30" cy="31" r="5.500" fill={INK} stroke="none" />
      <circle cx="54" cy="31" r="5.500" fill={INK} stroke="none" />
      <circle cx="32" cy="29" r="2.100" fill={C.white} stroke="none" />
      <circle cx="56" cy="29" r="2.100" fill={C.white} stroke="none" />
      <circle cx="28.500" cy="33" r="1" fill={C.white} stroke="none" />
      <circle cx="52.500" cy="33" r="1" fill={C.white} stroke="none" />
      <path d="M24 22q5-4 10-1M50 21q5-3 10 1" fill="none" strokeWidth={2.500} />
      <ellipse cx="18" cy="44" rx="5" ry="3.200" fill={C.red} stroke="none" opacity={0.35} />
      <ellipse cx="66" cy="44" rx="5" ry="3.200" fill={C.red} stroke="none" opacity={0.35} />
      <ellipse cx="42" cy="45" rx="13" ry="9.500" fill={C.clay} strokeWidth={2.500} />
      <ellipse cx="42" cy="43" rx="9" ry="3" fill={C.pink} stroke="none" opacity={0.45} />
      <ellipse cx="37" cy="45" rx="2.300" ry="3.200" fill={C.brown} stroke="none" />
      <ellipse cx="47" cy="45" rx="2.300" ry="3.200" fill={C.brown} stroke="none" />
      <path d="M35 55q7 5 14 0" fill="none" strokeWidth={2.200} />
    </g>
  ),
};

export const AIRPORT_SPRITES: Record<string, FlatSprite> = { plane, passport, pig };
