import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const bookshelf: FlatSprite = {
  w: 110, h: 90,
  node: (
    <g {...LINE}>
      <rect x="6" y="4" width="98" height="82" rx="6" fill={C.woodD} />
      <rect x="12" y="10" width="86" height="70" rx="3" fill={C.brown} strokeWidth={2.5} />
      {[12, 36, 60].map((y) => <rect key={y} x="12" y={y + 18} width="86" height="5" fill={C.woodD} strokeWidth={2} />)}
      {[[16, C.red, 12], [26, C.blue, 12], [36, C.yellow, 12], [46, C.green, 12], [60, C.pink, 12], [72, C.teal, 12], [84, C.orange, 12]].map(([x, f, h], i) => <rect key={`a${i}`} x={x as number} y={10 + 18 - (h as number) + 0} width="8" height={h as number} rx="1.5" fill={f as string} strokeWidth={2} />)}
      {[[18, C.blue], [30, C.red], [42, C.green], [54, C.yellow], [68, C.orange], [80, C.pink]].map(([x, f], i) => <rect key={`b${i}`} x={x as number} y={34} width="8" height="12" rx="1.5" fill={f as string} strokeWidth={2} />)}
      {[[16, C.yellow], [28, C.teal], [40, C.red], [56, C.blue], [70, C.green], [84, C.pink]].map(([x, f], i) => <rect key={`c${i}`} x={x as number} y={58} width="8" height="12" rx="1.5" fill={f as string} strokeWidth={2} />)}
    </g>
  ),
};

const cart: FlatSprite = {
  w: 84, h: 72,
  node: (
    <g {...LINE}>
      <path d="M4 6h14l8 36h42" fill="none" strokeWidth={4} />
      <path d="M18 14h62l-8 28H26Z" fill={C.blueL} />
      <path d="M32 14l3 28M48 14l1 28M64 14l-3 28M22 26h56" fill="none" strokeWidth={2} />
      <circle cx="32" cy="58" r="7" fill={C.greyD} />
      <circle cx="64" cy="58" r="7" fill={C.greyD} />
      <path d="M26 42l4 10h32" fill="none" strokeWidth={3} />
    </g>
  ),
};

const printer: FlatSprite = {
  w: 72, h: 56,
  node: (
    <g {...LINE}>
      <rect x="16" y="3" width="40" height="18" rx="2" fill={C.white} />
      <rect x="4" y="18" width="64" height="30" rx="7" fill={C.grey} />
      <rect x="14" y="40" width="44" height="12" rx="2" fill={C.white} />
      <path d="M20 44h26" fill="none" strokeWidth={2} />
      <circle cx="56" cy="28" r="3" fill={C.green} strokeWidth={2} />
    </g>
  ),
};

const documentSprite: FlatSprite = {
  w: 46, h: 58,
  node: (
    <g {...LINE}>
      <path d="M6 4h24l10 10v40H6Z" fill={C.white} />
      <path d="M30 4v10h10" fill={C.cream} />
      <path d="M12 24h22M12 32h22M12 40h14" fill="none" strokeWidth={2.5} />
      <circle cx="33" cy="46" r="4" fill={C.red} strokeWidth={2} />
    </g>
  ),
};

const boat: FlatSprite = {
  w: 92, h: 62,
  node: (
    <g {...LINE}>
      <path d="M44 4v34" fill="none" strokeWidth={3.5} />
      <path d="M48 6q26 8 28 30H48Z" fill={C.white} />
      <path d="M40 10q-18 6-22 26h22Z" fill={C.yellow} />
      <path d="M6 40h80l-10 16H18Z" fill={C.red} />
      <path d="M10 46h72" fill="none" stroke={C.white} strokeWidth={3} />
    </g>
  ),
};

const shell: FlatSprite = {
  w: 48, h: 42,
  node: (
    <g {...LINE}>
      <path d="M24 4C8 6 2 24 4 36h40c2-12-4-30-20-32Z" fill={C.pink} />
      <path d="M24 6v30M14 10l5 26M34 10l-5 26M8 20l11 16M40 20L29 36" fill="none" strokeWidth={2} />
      <ellipse cx="17" cy="14" rx="3" ry="5" fill={C.white} stroke="none" opacity={0.7} transform="rotate(30 17 14)" />
      <rect x="14" y="34" width="20" height="6" rx="3" fill={C.cream} strokeWidth={2.5} />
    </g>
  ),
};

const crab: FlatSprite = {
  w: 64, h: 46,
  node: (
    <g {...LINE}>
      <path d="M14 34l-8 8M24 38l-4 6M40 38l4 6M50 34l8 8" fill="none" strokeWidth={3} />
      <path d="M12 20q-10-4-8-14q8 0 12 8ZM52 20q10-4 8-14q-8 0-12 8Z" fill={C.red} />
      <ellipse cx="32" cy="26" rx="22" ry="14" fill={C.red} />
      <path d="M26 14v-6M38 14v-6" fill="none" strokeWidth={2.5} />
      <circle cx="26" cy="8" r="3.5" fill={C.white} strokeWidth={2} />
      <circle cx="38" cy="8" r="3.5" fill={C.white} strokeWidth={2} />
      <circle cx="26" cy="8" r="1.2" fill={INK} stroke="none" />
      <circle cx="38" cy="8" r="1.2" fill={INK} stroke="none" />
      <path d="M27 28q5 4 10 0" fill="none" strokeWidth={2} />
    </g>
  ),
};

export const PLACE_SPRITES: Record<string, FlatSprite> = { bookshelf, cart, printer, document: documentSprite, boat, shell, crab };
