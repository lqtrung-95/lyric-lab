import { C, INK, LINE, type FlatSprite } from "./flat-kit";

// Đồ vật của cốt truyện (manh mối): thư, bút xanh, tờ giấy ghim tường, bảng ký tên, ống bút.

const letter: FlatSprite = {
  w: 60, h: 44,
  node: (
    <g {...LINE}>
      <rect x="4" y="6" width="52" height="34" rx="4" fill={C.cream} />
      <path d="M5 8l25 18L55 8" fill="none" />
      <path d="M6 38l18-13M54 38L36 25" fill="none" strokeWidth={2} />
      <circle cx="30" cy="26" r="5" fill={C.red} strokeWidth={2.500} />
    </g>
  ),
};

const pen: FlatSprite = {
  w: 56, h: 18,
  node: (
    <g {...LINE}>
      <path d="M44 4l10 5-10 5Z" fill={C.cream} strokeWidth={2.500} />
      <rect x="4" y="4" width="40" height="10" rx="4" fill={C.blue} />
      <rect x="4" y="4" width="14" height="10" rx="4" fill={C.blueL} strokeWidth={2.500} />
      <path d="M22 6h18" stroke={C.white} strokeWidth={2} />
    </g>
  ),
};

const note: FlatSprite = {
  w: 44, h: 58,
  node: (
    <g {...LINE}>
      <path d="M6 8h32v34l-8 10H6Z" fill={C.cream} />
      <path d="M30 52v-8h8" fill={C.cream} strokeWidth={2.500} />
      <path d="M12 20h20M12 28h20M12 36h12" stroke={C.grey} strokeWidth={3} />
      <circle cx="22" cy="8" r="4.500" fill={C.red} strokeWidth={2.500} />
    </g>
  ),
};

const clipboard: FlatSprite = {
  w: 44, h: 60,
  node: (
    <g {...LINE}>
      <rect x="4" y="6" width="36" height="52" rx="4" fill={C.woodD} />
      <rect x="9" y="14" width="26" height="38" rx="2" fill={C.cream} strokeWidth={2.500} />
      <path d="M14 24h16M14 32h16M14 40h10" stroke={C.grey} strokeWidth={3} />
      <rect x="14" y="2" width="16" height="9" rx="3" fill={C.yellow} />
    </g>
  ),
};

const pens: FlatSprite = {
  w: 44, h: 58,
  node: (
    <g {...LINE}>
      <path d="M14 22L10 4M22 22V2M30 22l5-18" stroke={C.blue} strokeWidth={5} fill="none" />
      <path d="M14 22L10 4M22 22V2M30 22l5-18" fill="none" strokeWidth={1.500} stroke={INK} opacity={0} />
      <path d="M8 20h28l-3 34q0 3-3 3H14q-3 0-3-3Z" fill={C.blueL} opacity={0.9} />
      <path d="M13 32h18" stroke={C.white} strokeWidth={3} />
    </g>
  ),
};

export const STORY_SPRITES: Record<string, FlatSprite> = { letter, pen, note, clipboard, pens };
