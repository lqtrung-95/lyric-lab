import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const cat: FlatSprite = {
  w: 84, h: 92,
  node: (
    <g {...LINE}>
      <path d="M62 80C84 80 84 54 70 52" fill="none" strokeWidth={13} />
      <path d="M62 80C84 80 84 54 70 52" fill="none" stroke={C.orange} strokeWidth={7} />
      <ellipse cx="40" cy="66" rx="24" ry="24" fill={C.orange} />
      <ellipse cx="40" cy="72" rx="13" ry="16" fill={C.cream} strokeWidth={2.500} />
      <path d="M19 24L21 4l15 11Z" fill={C.orange} />
      <path d="M61 24L59 4 44 15Z" fill={C.orange} />
      <path d="M23 18l1-8 7 5ZM57 18l-1-8-7 5Z" fill={C.pink} stroke="none" />
      <ellipse cx="40" cy="36" rx="25" ry="21" fill={C.orange} />
      <path d="M28 28l2 4M40 24v5M52 28l-2 4" strokeWidth={2.500} stroke={C.orangeD} fill="none" />
      <ellipse cx="30" cy="38" rx="3.200" ry="4.600" fill={INK} stroke="none" />
      <ellipse cx="50" cy="38" rx="3.200" ry="4.600" fill={INK} stroke="none" />
      <circle cx="31" cy="36" r="1.200" fill={C.white} stroke="none" />
      <circle cx="51" cy="36" r="1.200" fill={C.white} stroke="none" />
      <path d="M37 44h6l-3 3.500Z" fill={C.pink} strokeWidth={2} />
      <path d="M40 47.500q-3 4-6 2M40 47.500q3 4 6 2" strokeWidth={2} fill="none" />
      <ellipse cx="31" cy="88" rx="9" ry="4.500" fill={C.cream} strokeWidth={2.500} />
      <ellipse cx="49" cy="88" rx="9" ry="4.500" fill={C.cream} strokeWidth={2.500} />
    </g>
  ),
};

/** Gấu Trúc đỏ dẫn đường: đeo ba lô xanh ngọc, má kem, đuôi sọc. */
const guide: FlatSprite = {
  w: 88, h: 100,
  node: (
    <g {...LINE}>
      <path d="M14 82C-4 82-2 58 12 60" fill="none" strokeWidth={15} />
      <path d="M14 82C-4 82-2 58 12 60" fill="none" stroke={C.clay} strokeWidth={9} />
      <rect x="52" y="44" width="24" height="36" rx="9" fill={C.teal} />
      <ellipse cx="40" cy="72" rx="24" ry="25" fill={C.clay} />
      <ellipse cx="40" cy="78" rx="13" ry="15" fill={C.brown} strokeWidth={2.500} />
      <circle cx="17" cy="23" r="10" fill={C.clay} />
      <circle cx="63" cy="23" r="10" fill={C.clay} />
      <circle cx="17" cy="24" r="5" fill={C.cream} stroke="none" />
      <circle cx="63" cy="24" r="5" fill={C.cream} stroke="none" />
      <ellipse cx="40" cy="40" rx="27" ry="22" fill={C.clay} />
      <ellipse cx="27" cy="46" rx="10" ry="8" fill={C.cream} strokeWidth={2.500} />
      <ellipse cx="53" cy="46" rx="10" ry="8" fill={C.cream} strokeWidth={2.500} />
      <ellipse cx="29" cy="39" rx="3.200" ry="4.600" fill={INK} stroke="none" />
      <ellipse cx="51" cy="39" rx="3.200" ry="4.600" fill={INK} stroke="none" />
      <circle cx="30" cy="37" r="1.200" fill={C.white} stroke="none" />
      <circle cx="52" cy="37" r="1.200" fill={C.white} stroke="none" />
      <ellipse cx="40" cy="46" rx="4.500" ry="3.500" fill={INK} stroke="none" />
      <path d="M40 49.500q-3 4-6 2M40 49.500q3 4 6 2" strokeWidth={2} fill="none" />
      <path d="M52 62q10 2 12 12" strokeWidth={2.500} stroke={C.brown} fill="none" />
      <ellipse cx="29" cy="96" rx="9" ry="4" fill={C.brown} strokeWidth={2.500} />
      <ellipse cx="51" cy="96" rx="9" ry="4" fill={C.brown} strokeWidth={2.500} />
    </g>
  ),
};

export const CHARACTER_SPRITES: Record<string, FlatSprite> = { cat, guide };
