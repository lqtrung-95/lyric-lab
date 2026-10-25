import { C, LINE, type FlatSprite } from "./flat-kit";

// Đồ ăn thức uống của cảnh Quán ăn (phong cách phẳng, viền mực, nhìn chính diện).

const tea: FlatSprite = {
  w: 80, h: 56,
  node: (
    <g {...LINE}>
      <path d="M52 36q12 0 14-14" fill="none" strokeWidth={9} />
      <path d="M52 36q12 0 14-14" fill="none" stroke={C.green} strokeWidth={4} />
      <path d="M12 30q-14 2-6 14 4 4 12 0" fill="none" strokeWidth={4} />
      <ellipse cx="32" cy="38" rx="23" ry="16" fill={C.green} />
      <ellipse cx="32" cy="22" rx="13" ry="5" fill={C.greenL} />
      <circle cx="32" cy="15" r="3.5" fill={C.greenD} strokeWidth={2.500} />
      <path d="M58 40h18v6q0 8-9 8t-9-8Z" fill={C.white} />
      <path d="M58 44h18" stroke={C.blue} strokeWidth={3} />
    </g>
  ),
};

const bowl = (fill: string, band: string) => (
  <>
    <rect x="28" y="50" width="24" height="5" rx="2" fill={C.white} />
    <path d="M6 30h68q0 22-34 22T6 30Z" fill={fill} />
    <path d="M10 38h60" stroke={band} strokeWidth={4} fill="none" />
  </>
);

const rice: FlatSprite = {
  w: 80, h: 58,
  node: (
    <g {...LINE}>
      <ellipse cx="40" cy="26" rx="29" ry="14" fill={C.white} />
      <circle cx="30" cy="22" r="1.800" fill={C.grey} stroke="none" /><circle cx="42" cy="18" r="1.800" fill={C.grey} stroke="none" /><circle cx="50" cy="26" r="1.800" fill={C.grey} stroke="none" /><circle cx="36" cy="30" r="1.800" fill={C.grey} stroke="none" />
      {bowl(C.white, C.blue)}
    </g>
  ),
};

const noodles: FlatSprite = {
  w: 80, h: 62,
  node: (
    <g {...LINE}>
      <path d="M52 22L70 2M58 26L76 8" strokeWidth={4} stroke={C.woodD} fill="none" />
      <path d="M14 30q6-14 14-4t14-4 14 4 12-2" fill="none" stroke={C.yellow} strokeWidth={6} />
      <path d="M14 30q6-14 14-4t14-4 14 4 12-2" fill="none" strokeWidth={2.500} />
      <circle cx="38" cy="20" r="4" fill={C.green} strokeWidth={2.500} />
      {bowl(C.red, C.yellow)}
    </g>
  ),
};

const fish: FlatSprite = {
  w: 80, h: 56,
  node: (
    <g {...LINE}>
      <ellipse cx="40" cy="44" rx="36" ry="10" fill={C.white} />
      <path d="M58 30l16-10v20Z" fill={C.orangeD} />
      <ellipse cx="38" cy="30" rx="24" ry="13" fill={C.orange} />
      <path d="M30 22q-4 8 0 16M40 20q-4 10 0 20" fill="none" strokeWidth={2.500} stroke={C.orangeD} />
      <circle cx="21" cy="27" r="3" fill={C.white} strokeWidth={2} /><circle cx="21" cy="27" r="1.200" fill="#4a2e1b" stroke="none" />
    </g>
  ),
};

const egg: FlatSprite = {
  w: 44, h: 56,
  node: (
    <g {...LINE}>
      <path d="M22 4C36 4 42 26 42 36c0 11-8 17-20 17S2 47 2 36C2 26 8 4 22 4Z" fill={C.cream} />
      <ellipse cx="14" cy="22" rx="3" ry="6" fill={C.white} stroke="none" transform="rotate(15 14 22)" />
      <circle cx="28" cy="38" r="1.500" fill={C.grey} stroke="none" /><circle cx="18" cy="44" r="1.500" fill={C.grey} stroke="none" />
    </g>
  ),
};

const milk: FlatSprite = {
  w: 44, h: 62,
  node: (
    <g {...LINE}>
      <path d="M8 18L22 4l14 14Z" fill={C.blueL} />
      <rect x="8" y="18" width="28" height="40" rx="3" fill={C.white} />
      <rect x="8" y="30" width="28" height="14" fill={C.blue} stroke="none" />
      <path d="M22 33q-4 5 0 8 4-3 0-8Z" fill={C.white} strokeWidth={2} />
      <rect x="8" y="18" width="28" height="40" rx="3" fill="none" />
    </g>
  ),
};

const coffee: FlatSprite = {
  w: 60, h: 58,
  node: (
    <g {...LINE}>
      <path d="M20 14q-5-5 0-10M30 14q-5-5 0-10M40 14q-5-5 0-10" fill="none" strokeWidth={2.500} stroke={C.grey} />
      <path d="M42 24h6q8 0 8 9t-8 9h-6" fill="none" strokeWidth={5} />
      <path d="M8 18h36v18q0 12-18 12T8 36Z" fill={C.white} />
      <ellipse cx="26" cy="18" rx="18" ry="4.500" fill={C.brown} />
      <ellipse cx="30" cy="54" rx="26" ry="4" fill={C.woodL} />
    </g>
  ),
};

const bread: FlatSprite = {
  w: 74, h: 46,
  node: (
    <g {...LINE}>
      <path d="M8 22q0-16 29-16t29 16q0 18-8 18H16q-8 0-8-18Z" fill={C.wood} />
      <path d="M12 22q0-10 25-10" fill="none" stroke={C.woodL} strokeWidth={4} />
      <ellipse cx="37" cy="38" rx="26" ry="3" fill={C.woodD} stroke="none" opacity={0.5} />
      <path d="M26 12l6 14M40 11l6 14M54 14l5 12" fill="none" strokeWidth={2.500} stroke={C.woodD} />
    </g>
  ),
};

const fruit: FlatSprite = {
  w: 80, h: 58,
  node: (
    <g {...LINE}>
      <circle cx="26" cy="24" r="12" fill={C.red} />
      <circle cx="46" cy="20" r="12" fill={C.orange} />
      <ellipse cx="58" cy="26" rx="10" ry="12" fill={C.greenL} />
      <path d="M26 12q0-5 4-7" fill="none" strokeWidth={2.500} />
      <path d="M6 30h68q0 22-34 22T6 30Z" fill={C.woodD} />
      <path d="M12 38h56" stroke={C.wood} strokeWidth={3} fill="none" />
    </g>
  ),
};

const veg: FlatSprite = {
  w: 80, h: 50,
  node: (
    <g {...LINE}>
      <ellipse cx="40" cy="38" rx="37" ry="10" fill={C.white} />
      <ellipse cx="22" cy="26" rx="13" ry="9" fill={C.green} transform="rotate(-20 22 26)" />
      <ellipse cx="40" cy="22" rx="13" ry="10" fill={C.greenL} />
      <ellipse cx="58" cy="27" rx="13" ry="9" fill={C.green} transform="rotate(20 58 27)" />
      <path d="M40 14v14M22 20l5 12M58 22l-5 12" fill="none" strokeWidth={2} stroke={C.greenD} />
      <circle cx="30" cy="34" r="3.500" fill={C.red} strokeWidth={2} />
    </g>
  ),
};

const chopsticks: FlatSprite = {
  w: 70, h: 36,
  node: (
    <g {...LINE}>
      <rect x="4" y="10" width="62" height="6" rx="3" fill={C.woodD} transform="rotate(8 35 13)" />
      <rect x="4" y="22" width="62" height="6" rx="3" fill={C.wood} transform="rotate(12 35 25)" />
      <rect x="4" y="10" width="14" height="6" rx="3" fill={C.red} transform="rotate(8 35 13)" strokeWidth={2.500} />
      <rect x="4" y="22" width="14" height="6" rx="3" fill={C.red} transform="rotate(12 35 25)" strokeWidth={2.500} />
    </g>
  ),
};

const coin: FlatSprite = {
  w: 50, h: 44,
  node: (
    <g {...LINE}>
      <ellipse cx="25" cy="34" rx="20" ry="7" fill={C.yellow} />
      <ellipse cx="25" cy="27" rx="20" ry="7" fill={C.yellow} />
      <ellipse cx="25" cy="20" rx="20" ry="7" fill={C.yellow} />
      <rect x="20" y="15" width="10" height="10" rx="1.500" fill={C.cream} strokeWidth={2.500} transform="rotate(8 25 20)" />
    </g>
  ),
};

const menu: FlatSprite = {
  w: 44, h: 62,
  node: (
    <g {...LINE}>
      <path d="M8 56l4 4h20l4-4" fill="none" strokeWidth={4} />
      <rect x="6" y="4" width="32" height="52" rx="4" fill={C.cream} />
      <rect x="6" y="4" width="32" height="14" rx="4" fill={C.red} />
      <path d="M12 26h20M12 34h20M12 42h14" stroke={C.grey} strokeWidth={3} fill="none" />
    </g>
  ),
};

const soup: FlatSprite = {
  w: 80, h: 60,
  node: (
    <g {...LINE}>
      <path d="M30 12q-5-5 0-10M42 12q-5-5 0-10M54 12q-5-5 0-10" fill="none" strokeWidth={2.500} stroke={C.grey} />
      <path d="M58 30L74 8" strokeWidth={5} fill="none" />
      <ellipse cx="76" cy="6" rx="6" ry="4" fill={C.woodL} />
      <ellipse cx="40" cy="30" rx="34" ry="7" fill={C.orange} />
      {bowl(C.blue, C.blueL)}
    </g>
  ),
};

export const FOOD_SPRITES: Record<string, FlatSprite> = { tea, rice, noodles, fish, egg, milk, coffee, bread, fruit, veg, chopsticks, coin, menu, soup };
