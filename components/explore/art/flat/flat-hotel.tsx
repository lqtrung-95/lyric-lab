import { C, INK, LINE, type FlatSprite } from "./flat-kit";

const key: FlatSprite = {
  w: 56, h: 30,
  node: (
    <g {...LINE}>
      <circle cx="14" cy="15" r="10" fill={C.yellow} />
      <circle cx="14" cy="15" r="3.5" fill={C.cream} strokeWidth={2} />
      <path d="M24 15h28M44 15v8M36 15v6" fill="none" strokeWidth={5} />
      <path d="M24 15h28M44 15v8M36 15v6" fill="none" stroke={C.yellow} strokeWidth={2} />
    </g>
  ),
};

const towel: FlatSprite = {
  w: 56, h: 50,
  node: (
    <g {...LINE}>
      <path d="M6 8h40q4 0 4 4v26q0 4-4 4H10q-4 0-4-4Z" fill={C.blueL} />
      <rect x="6" y="14" width="44" height="7" fill={C.blue} stroke="none" />
      <rect x="6" y="28" width="44" height="7" fill={C.blue} stroke="none" />
      <path d="M6 8h40q4 0 4 4v26q0 4-4 4H10q-4 0-4-4Z" fill="none" />
      <path d="M12 42v5M20 42v5M28 42v5M36 42v5M44 42v5" fill="none" strokeWidth={2.500} />
    </g>
  ),
};

/** Chú Vịt: đầu tròn to, mắt đen to có điểm sáng, mỏ cam nhỏ, má hồng, cánh nhỏ hai bên và đôi chân màu cam. */
const duck: FlatSprite = {
  w: 80, h: 100,
  node: (
    <g {...LINE}>
      <path d="M18 92q-6-2-6-6h16q0 6-10 6ZM62 92q6-2 6-6H52q0 6 10 6Z" fill={C.orange} strokeWidth={2.5} />
      <ellipse cx="40" cy="68" rx="25" ry="24" fill={C.yellow} />
      <ellipse cx="40" cy="73" rx="14" ry="15" fill={C.cream} strokeWidth={2.5} />
      <ellipse cx="14" cy="68" rx="8" ry="13" fill={C.yellow} transform="rotate(14 14 68)" />
      <ellipse cx="66" cy="68" rx="8" ry="13" fill={C.yellow} transform="rotate(-14 66 68)" />
      <circle cx="40" cy="34" r="27" fill={C.yellow} />
      <path d="M34 8q6-6 12 0" fill="none" strokeWidth={3} />
      <circle cx="30" cy="31" r="5.5" fill={INK} stroke="none" />
      <circle cx="50" cy="31" r="5.5" fill={INK} stroke="none" />
      <circle cx="31.800" cy="29" r="2" fill={C.white} stroke="none" />
      <circle cx="51.800" cy="29" r="2" fill={C.white} stroke="none" />
      <ellipse cx="40" cy="43" rx="9" ry="5.500" fill={C.orange} strokeWidth={2.500} />
      <path d="M34 43h12" fill="none" strokeWidth={1.800} />
      <ellipse cx="19" cy="42" rx="4.500" ry="3" fill={C.pink} stroke="none" opacity={0.9} />
      <ellipse cx="61" cy="42" rx="4.500" ry="3" fill={C.pink} stroke="none" opacity={0.9} />
    </g>
  ),
};

export const HOTEL_SPRITES: Record<string, FlatSprite> = { key, towel, duck };
