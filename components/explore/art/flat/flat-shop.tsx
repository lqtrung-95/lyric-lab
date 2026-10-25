import { C, LINE, type FlatSprite } from "./flat-kit";

const clothes: FlatSprite = {
  w: 64, h: 60,
  node: (
    <g {...LINE}>
      <path d="M22 4l10 8 10-8 18 10-8 14-8-4v30H20V24l-8 4-8-14Z" fill={C.red} />
      <path d="M22 4l10 8 10-8" fill="none" />
      <path d="M20 24v30h24V24" fill="none" strokeWidth={2} />
      <circle cx="32" cy="30" r="2.5" fill={C.cream} strokeWidth={2} />
      <circle cx="32" cy="40" r="2.5" fill={C.cream} strokeWidth={2} />
    </g>
  ),
};

const pants: FlatSprite = {
  w: 50, h: 70,
  node: (
    <g {...LINE}>
      <path d="M8 4h34l4 62H29l-4-34-4 34H4Z" fill={C.blue} />
      <rect x="8" y="4" width="34" height="8" rx="2" fill={C.greyD} />
      <path d="M25 12v20" fill="none" strokeWidth={2} />
      <path d="M10 58h10M30 58h10" fill="none" stroke={C.blueL} strokeWidth={2.5} />
    </g>
  ),
};

const skirt: FlatSprite = {
  w: 60, h: 58,
  node: (
    <g {...LINE}>
      <path d="M16 4h28l14 50H2Z" fill={C.pink} />
      <rect x="16" y="4" width="28" height="8" rx="2" fill={C.redD} />
      <path d="M22 14l-8 38M30 14v38M38 14l8 38" fill="none" strokeWidth={2} />
      <circle cx="30" cy="8" r="2.5" fill={C.yellow} strokeWidth={2} />
    </g>
  ),
};

const shoes: FlatSprite = {
  w: 70, h: 44,
  node: (
    <g {...LINE}>
      <path d="M6 8h22l4 12q12 2 30 8q4 2 4 8v4H6Z" fill={C.orange} />
      <rect x="6" y="34" width="62" height="7" rx="3" fill={C.cream} />
      <path d="M12 12h14M14 20h14" fill="none" stroke={C.cream} strokeWidth={3} />
      <path d="M36 24q8 0 14 3" fill="none" strokeWidth={2.5} />
    </g>
  ),
};

const hat: FlatSprite = {
  w: 66, h: 48,
  node: (
    <g {...LINE}>
      <path d="M12 32q0-26 22-26t22 26Z" fill={C.green} />
      <path d="M2 34q0-6 8-6h46q8 0 8 6t-8 8H10q-8 0-8-8Z" fill={C.greenD} />
      <rect x="12" y="26" width="42" height="7" fill={C.yellow} strokeWidth={2.500} />
      <circle cx="34" cy="6" r="3" fill={C.red} strokeWidth={2} />
    </g>
  ),
};

const mirror: FlatSprite = {
  w: 50, h: 84,
  node: (
    <g {...LINE}>
      <rect x="4" y="4" width="42" height="68" rx="21" fill={C.woodD} />
      <rect x="10" y="10" width="30" height="56" rx="15" fill={C.blueL} strokeWidth={2.500} />
      <path d="M18 22q4-6 10-6M18 32q2-3 5-4" fill="none" stroke={C.white} strokeWidth={3} />
      <rect x="14" y="72" width="22" height="10" rx="3" fill={C.wood} />
    </g>
  ),
};

export const SHOP_SPRITES: Record<string, FlatSprite> = { clothes, pants, skirt, shoes, hat, mirror };
