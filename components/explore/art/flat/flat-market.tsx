import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const banana: FlatSprite = {
  w: 60, h: 48,
  node: (
    <g {...LINE}>
      <path d="M6 12q6 30 36 30q10 0 14-6q-4 4-14 2Q18 34 14 8Z" fill={C.yellow} />
      <path d="M6 12q-2-6 4-8l5 6" fill={C.brown} />
      <path d="M14 8q5 20 24 28" fill="none" stroke={C.orange} strokeWidth={2.5} />
      <path d="M52 34l4 2" fill="none" strokeWidth={4} />
    </g>
  ),
};

const watermelon: FlatSprite = {
  w: 64, h: 44,
  node: (
    <g {...LINE}>
      <path d="M4 6h56a28 28 0 0 1-56 0Z" fill={C.green} />
      <path d="M9 6h46a23 23 0 0 1-46 0Z" fill={C.red} strokeWidth={2.5} />
      <path d="M4 6h56" strokeWidth={3} />
      {[[22, 16], [32, 22], [42, 16], [32, 12]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="2" ry="3" fill={INK} stroke="none" />)}
    </g>
  ),
};

const meat: FlatSprite = {
  w: 60, h: 48,
  node: (
    <g {...LINE}>
      <path d="M6 24q0-16 20-18q22-2 28 12q4 14-14 20Q8 44 6 24Z" fill={C.pink} />
      <path d="M16 24q8-10 22-6" fill="none" stroke={C.white} strokeWidth={4} />
      <circle cx="40" cy="30" r="7" fill={C.cream} strokeWidth={2.5} />
      <circle cx="40" cy="30" r="2.5" fill={C.redD} stroke="none" />
    </g>
  ),
};

const basket: FlatSprite = {
  w: 64, h: 52,
  node: (
    <g {...LINE}>
      <path d="M14 22q0-18 18-18t18 18" fill="none" strokeWidth={4} />
      <path d="M4 20h56l-6 28q-1 3-5 3H15q-4 0-5-3Z" fill={C.wood} />
      <rect x="2" y="18" width="60" height="6" rx="3" fill={C.woodD} />
      <path d="M8 32h48M11 42h42M24 20l3 31M40 20l-3 31" fill="none" strokeWidth={2} />
    </g>
  ),
};

const bag: FlatSprite = {
  w: 50, h: 56,
  node: (
    <g {...LINE}>
      <path d="M16 18q0-14 9-14t9 14" fill="none" strokeWidth={3.5} />
      <path d="M6 18h38l3 32q0 4-4 4H7q-4 0-4-4Z" fill={C.teal} />
      <path d="M6 18h38l.6 6H5.400Z" fill={C.green} strokeWidth={2.5} />
      <circle cx="25" cy="38" r="6" fill={C.cream} strokeWidth={2.5} />
    </g>
  ),
};

export const MARKET_SPRITES: Record<string, FlatSprite> = { banana, watermelon, meat, basket, bag };
