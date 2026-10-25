import { C, INK, LINE, type FlatSprite } from "./flat-kit";

// Nhân vật của cốt truyện (nghi phạm, nhân chứng), cùng phong cách mascot đơn giản với Cú Thầy và Bếp trưởng Gấu.

/** Trưởng ga Thỏ: tai dài, mũ ga đỏ có viền vàng. */
const rabbit: FlatSprite = {
  w: 88, h: 104,
  node: (
    <g {...LINE}>
      <ellipse cx="30" cy="22" rx="8" ry="22" fill={C.white} transform="rotate(-8 30 22)" />
      <ellipse cx="58" cy="22" rx="8" ry="22" fill={C.white} transform="rotate(8 58 22)" />
      <ellipse cx="30" cy="24" rx="3.500" ry="15" fill={C.pink} stroke="none" transform="rotate(-8 30 24)" />
      <ellipse cx="58" cy="24" rx="3.500" ry="15" fill={C.pink} stroke="none" transform="rotate(8 58 24)" />
      <ellipse cx="44" cy="82" rx="26" ry="20" fill={C.blue} />
      <path d="M44 66v32" strokeWidth={2.500} />
      <circle cx="44" cy="76" r="2.500" fill={C.yellow} strokeWidth={2} /><circle cx="44" cy="86" r="2.500" fill={C.yellow} strokeWidth={2} />
      <ellipse cx="44" cy="52" rx="24" ry="20" fill={C.white} />
      <path d="M22 40q22-14 44 0v-8q-22-10-44 0Z" fill={C.red} />
      <rect x="22" y="38" width="44" height="6" rx="3" fill={C.yellow} strokeWidth={2.500} />
      <ellipse cx="35" cy="54" rx="3" ry="4.200" fill={INK} stroke="none" /><ellipse cx="53" cy="54" rx="3" ry="4.200" fill={INK} stroke="none" />
      <path d="M41 59h6l-3 3.500Z" fill={C.pink} strokeWidth={2} />
      <path d="M44 62.500q-3 4-6 2M44 62.500q3 4 6 2" strokeWidth={2} fill="none" />
      <ellipse cx="32" cy="101" rx="9" ry="3.500" fill={C.white} strokeWidth={2.500} /><ellipse cx="56" cy="101" rx="9" ry="3.500" fill={C.white} strokeWidth={2.500} />
    </g>
  ),
};

/** Bác sĩ Cáo: áo blouse trắng, cây bút xanh cài túi áo (manh mối!), đuôi cam đầu trắng. */
const fox: FlatSprite = {
  w: 92, h: 100,
  node: (
    <g {...LINE}>
      <path d="M70 84C92 84 94 54 78 54" fill="none" strokeWidth={15} />
      <path d="M70 84C92 84 94 54 78 54" fill="none" stroke={C.orange} strokeWidth={9} />
      <ellipse cx="46" cy="76" rx="25" ry="24" fill={C.white} />
      <rect x="52" y="64" width="12" height="14" rx="2" fill={C.cream} strokeWidth={2.500} />
      <path d="M58 56v10" stroke={C.blue} strokeWidth={4} />
      <path d="M46 56v40" strokeWidth={2.500} />
      <path d="M22 28L26 4l16 12ZM70 28L66 4 50 16Z" fill={C.orange} />
      <path d="M27 20l1-9 8 6ZM65 20l-1-9-8 6Z" fill={C.cream} stroke="none" />
      <ellipse cx="46" cy="40" rx="27" ry="22" fill={C.orange} />
      <path d="M22 46q8 18 24 18t24-18q-10 4-24 4t-24-4Z" fill={C.white} strokeWidth={2.500} />
      <ellipse cx="35" cy="40" rx="3.200" ry="4.600" fill={INK} stroke="none" /><ellipse cx="57" cy="40" rx="3.200" ry="4.600" fill={INK} stroke="none" />
      <ellipse cx="46" cy="50" rx="4.500" ry="3.500" fill={INK} stroke="none" />
      <ellipse cx="33" cy="97" rx="9" ry="3.500" fill={C.brown} strokeWidth={2.500} /><ellipse cx="59" cy="97" rx="9" ry="3.500" fill={C.brown} strokeWidth={2.500} />
    </g>
  ),
};

/** Ông Rùa: mai xanh hình vòm, đầu thò ra, mắt kính tròn, già nhưng tinh anh. */
const turtle: FlatSprite = {
  w: 104, h: 82,
  node: (
    <g {...LINE}>
      <ellipse cx="30" cy="70" rx="12" ry="8" fill={C.greenL} />
      <ellipse cx="74" cy="70" rx="12" ry="8" fill={C.greenL} />
      <path d="M14 66Q16 14 56 14t42 52Z" fill={C.green} />
      <path d="M36 66q2-30 20-34t20 34M56 14v52" fill="none" strokeWidth={2.500} />
      <path d="M22 54h68" fill="none" strokeWidth={2.500} />
      <path d="M92 40q14-6 10 10-2 10-12 8Z" fill={C.greenL} />
      <circle cx="96" cy="44" r="3" fill={C.white} strokeWidth={2} /><circle cx="96" cy="44" r="1.200" fill={INK} stroke="none" />
      <path d="M99 54q-4 3-8 0" fill="none" strokeWidth={2} />
      <path d="M8 40q-6 6 2 16" fill="none" strokeWidth={2.500} />
    </g>
  ),
};

export const ANIMAL_SPRITES: Record<string, FlatSprite> = { rabbit, fox, turtle };
