import { C, LINE, type FlatSprite } from "./flat-kit";

// Đồ trang trí và biển chỉ đường của các cảnh (không phải từ vựng).

const shelf: FlatSprite = {
  w: 120, h: 44,
  node: (
    <g {...LINE}>
      <path d="M14 34l-4 8h14l4-14M106 34l4 8H96l-4-14" fill={C.woodD} />
      <rect x="2" y="22" width="116" height="12" rx="4" fill={C.woodL} />
      <rect x="2" y="30" width="116" height="6" rx="3" fill={C.wood} />
      <path d="M12 26h96" stroke={C.cream} strokeWidth={2} fill="none" opacity={0.7} />
    </g>
  ),
};

const counter: FlatSprite = {
  w: 140, h: 80,
  node: (
    <g {...LINE}>
      <rect x="6" y="18" width="128" height="58" rx="6" fill={C.woodD} />
      <rect x="16" y="28" width="52" height="40" rx="5" fill={C.wood} strokeWidth={2.500} />
      <rect x="72" y="28" width="52" height="40" rx="5" fill={C.wood} strokeWidth={2.500} />
      <circle cx="63" cy="48" r="2.500" fill={C.yellow} strokeWidth={2} /><circle cx="77" cy="48" r="2.500" fill={C.yellow} strokeWidth={2} />
      <rect x="2" y="4" width="136" height="18" rx="7" fill={C.woodL} />
    </g>
  ),
};

const post = (flip: boolean): FlatSprite => ({
  w: 60, h: 90,
  node: (
    <g {...LINE} transform={flip ? "translate(60 0) scale(-1 1)" : undefined}>
      <rect x="26" y="26" width="8" height="62" rx="3" fill={C.woodD} />
      <path d="M4 6h36l14 13-14 13H4Z" fill={C.woodL} />
      <path d="M12 19h28" stroke={C.red} strokeWidth={4} />
      <path d="M36 12l8 7-8 7" stroke={C.red} strokeWidth={4} fill="none" />
    </g>
  ),
});

/** Biển chỉ đường sang cảnh khác: `exit` mũi tên phải, `exitLeft` mũi tên trái. */
export const PROP_SPRITES: Record<string, FlatSprite> = { shelf, counter, exit: post(false), exitLeft: post(true) };
