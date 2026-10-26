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

/** Gấu Trúc thám tử: đầu to tròn (dễ thương), mắt to long lanh sau cặp kính tròn viền vàng (thông minh), khăn đỏ, ba lô xanh ngọc, tay cầm kính lúp. */
const guide: FlatSprite = {
  w: 88, h: 100,
  node: (
    <g {...LINE}>
      <rect x="4" y="58" width="20" height="30" rx="9" fill={C.teal} />
      <ellipse cx="44" cy="78" rx="21" ry="18" fill={C.white} />
      <ellipse cx="22" cy="76" rx="7" ry="11" fill={INK} transform="rotate(12 22 76)" />
      <ellipse cx="29" cy="94" rx="10" ry="6" fill={INK} />
      <ellipse cx="59" cy="94" rx="10" ry="6" fill={INK} />
      <path d="M30 63q14 8 28 0l2 7q-16 9-32 0Z" fill={C.red} strokeWidth={2.500} />
      <circle cx="16" cy="15" r="11" fill={INK} />
      <circle cx="72" cy="15" r="11" fill={INK} />
      <circle cx="16" cy="16" r="4.500" fill={C.pink} stroke="none" />
      <circle cx="72" cy="16" r="4.500" fill={C.pink} stroke="none" />
      <ellipse cx="44" cy="39" rx="34" ry="28" fill={C.white} />
      <ellipse cx="28" cy="41" rx="9" ry="11.500" fill={INK} transform="rotate(22 28 41)" />
      <ellipse cx="60" cy="41" rx="9" ry="11.500" fill={INK} transform="rotate(-22 60 41)" />
      <circle cx="29" cy="40" r="5.600" fill={C.white} stroke="none" />
      <circle cx="59" cy="40" r="5.600" fill={C.white} stroke="none" />
      <circle cx="30" cy="41" r="3.600" fill={INK} stroke="none" />
      <circle cx="58" cy="41" r="3.600" fill={INK} stroke="none" />
      <circle cx="31.500" cy="39.500" r="1.500" fill={C.white} stroke="none" />
      <circle cx="59.500" cy="39.500" r="1.500" fill={C.white} stroke="none" />
      <circle cx="29" cy="40" r="10" fill={C.blueL} fillOpacity={0.3} stroke={C.yellow} strokeWidth={2.600} />
      <circle cx="59" cy="40" r="10" fill={C.blueL} fillOpacity={0.3} stroke={C.yellow} strokeWidth={2.600} />
      <path d="M39 38q5-3 10 0" fill="none" stroke={C.yellow} strokeWidth={2.600} />
      <ellipse cx="44" cy="50" rx="4.500" ry="3" fill={INK} stroke="none" />
      <path d="M44 53q-3 4.500-6.500 2M44 53q3 4.500 6.500 2" strokeWidth={2} fill="none" />
      <ellipse cx="17" cy="53" rx="5" ry="3.200" fill={C.pink} stroke="none" opacity={0.9} />
      <ellipse cx="71" cy="53" rx="5" ry="3.200" fill={C.pink} stroke="none" opacity={0.9} />
      <path d="M67 80L78 66" stroke={C.brown} strokeWidth={5} fill="none" />
      <circle cx="79" cy="62" r="8.500" fill={C.blueL} fillOpacity={0.55} />
      <path d="M75 59q2-3 5-3" stroke={C.white} strokeWidth={2} fill="none" />
      <ellipse cx="68" cy="79" rx="6" ry="8" fill={INK} transform="rotate(-18 68 79)" />
    </g>
  ),
};

/** Cú Thầy: NPC giao nhiệm vụ, đội mũ cử nhân, mắt to. */
const owl: FlatSprite = {
  w: 80, h: 100,
  node: (
    <g {...LINE}>
      <ellipse cx="40" cy="64" rx="27" ry="30" fill={C.woodD} />
      <ellipse cx="40" cy="72" rx="16" ry="20" fill={C.cream} strokeWidth={2.500} />
      <path d="M32 66q4 4 8 0t8 0M32 76q4 4 8 0t8 0M32 86q4 4 8 0t8 0" fill="none" strokeWidth={2} />
      <ellipse cx="13" cy="64" rx="8" ry="19" fill={C.brown} />
      <ellipse cx="67" cy="64" rx="8" ry="19" fill={C.brown} />
      <path d="M16 26L12 8l16 8ZM64 26l4-18-16 8Z" fill={C.woodD} />
      <ellipse cx="40" cy="34" rx="29" ry="25" fill={C.woodD} />
      <circle cx="28" cy="35" r="11" fill={C.white} />
      <circle cx="52" cy="35" r="11" fill={C.white} />
      <circle cx="29" cy="36" r="5" fill={INK} stroke="none" />
      <circle cx="51" cy="36" r="5" fill={INK} stroke="none" />
      <circle cx="31" cy="34" r="1.800" fill={C.white} stroke="none" />
      <circle cx="53" cy="34" r="1.800" fill={C.white} stroke="none" />
      <path d="M35 44h10l-5 8Z" fill={C.orange} strokeWidth={2.500} />
      <path d="M8 18L40 6l32 12-32 12Z" fill={C.blue} />
      <path d="M62 21v14" strokeWidth={2.500} fill="none" />
      <circle cx="62" cy="37" r="3" fill={C.yellow} strokeWidth={2} />
      <path d="M30 92h6M44 92h6" stroke={C.orangeD} strokeWidth={5} />
    </g>
  ),
};

/** Bếp trưởng Gấu: NPC của cảnh Quán ăn, đội mũ đầu bếp, đeo tạp dề. */
const chef: FlatSprite = {
  w: 88, h: 100,
  node: (
    <g {...LINE}>
      <ellipse cx="44" cy="72" rx="28" ry="26" fill={C.brown} />
      <path d="M26 54h36v38q0 4-4 4H30q-4 0-4-4Z" fill={C.white} />
      <path d="M36 54v-4h16v4" fill="none" strokeWidth={2.500} />
      <circle cx="20" cy="32" r="9" fill={C.brown} /><circle cx="68" cy="32" r="9" fill={C.brown} />
      <circle cx="20" cy="33" r="4" fill={C.woodL} stroke="none" /><circle cx="68" cy="33" r="4" fill={C.woodL} stroke="none" />
      <ellipse cx="44" cy="42" rx="26" ry="22" fill={C.brown} />
      <ellipse cx="44" cy="50" rx="13" ry="10" fill={C.woodL} strokeWidth={2.500} />
      <ellipse cx="34" cy="40" rx="3.200" ry="4.600" fill={INK} stroke="none" /><ellipse cx="54" cy="40" rx="3.200" ry="4.600" fill={INK} stroke="none" />
      <ellipse cx="44" cy="47" rx="4.500" ry="3.500" fill={INK} stroke="none" />
      <path d="M44 51q-3 4-6 2M44 51q3 4 6 2" strokeWidth={2} fill="none" />
      <path d="M26 20q-8-4-4-12 6-6 14-2 4-8 12-6 8 0 10 8 8-2 10 6 2 8-6 10Z" fill={C.white} />
      <rect x="26" y="18" width="36" height="8" rx="2" fill={C.white} />
      <ellipse cx="32" cy="97" rx="9" ry="4" fill={C.woodD} strokeWidth={2.500} /><ellipse cx="56" cy="97" rx="9" ry="4" fill={C.woodD} strokeWidth={2.500} />
    </g>
  ),
};

export const CHARACTER_SPRITES: Record<string, FlatSprite> = { cat, guide, owl, chef };
