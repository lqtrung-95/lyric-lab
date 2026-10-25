import { C, LINE, type FlatSprite } from "./flat-kit";

const book: FlatSprite = {
  w: 64, h: 52,
  node: (
    <g {...LINE}>
      <rect x="4" y="6" width="56" height="40" rx="5" fill={C.red} />
      <rect x="10" y="40" width="48" height="6" rx="2" fill={C.cream} strokeWidth={2.5} />
      <rect x="4" y="6" width="11" height="40" rx="4" fill={C.redD} />
      <rect x="26" y="14" width="24" height="11" rx="3" fill={C.yellow} strokeWidth={2.5} />
    </g>
  ),
};

const cup: FlatSprite = {
  w: 54, h: 52,
  node: (
    <g {...LINE}>
      <path d="M38 17h5q8 0 8 10t-8 10h-5" fill="none" strokeWidth={5} />
      <path d="M6 8h32v28q0 12-12 12H18Q6 48 6 36Z" fill={C.white} />
      <rect x="6" y="22" width="32" height="9" fill={C.blue} stroke="none" />
      <path d="M6 8h32v28q0 12-12 12H18Q6 48 6 36Z" fill="none" />
      <ellipse cx="22" cy="8" rx="16" ry="4.5" fill={C.brown} />
    </g>
  ),
};

const water: FlatSprite = {
  w: 36, h: 60,
  node: (
    <g {...LINE}>
      <path d="M5 4h26l-3 50q-.5 4-5 4H13q-4.500 0-5-4Z" fill={C.blueL} />
      <path d="M7.500 22h21l-1.700 31q-.4 3-4 3h-9.600q-3.600 0-4-3Z" fill={C.blue} stroke="none" />
      <path d="M12 10v8" stroke={C.white} strokeWidth={3} />
      <path d="M5 4h26l-3 50q-.5 4-5 4H13q-4.500 0-5-4Z" fill="none" />
    </g>
  ),
};

const laptop: FlatSprite = {
  w: 80, h: 56,
  node: (
    <g {...LINE}>
      <rect x="10" y="4" width="60" height="38" rx="5" fill={C.greyD} />
      <rect x="15" y="9" width="50" height="28" rx="2.500" fill={C.blueL} strokeWidth={2} />
      <path d="M20 16h14M20 22h22" stroke={C.blue} strokeWidth={3} />
      <path d="M2 44h76l-5 9H7Z" fill={C.grey} />
      <path d="M30 49h20" strokeWidth={2} fill="none" />
    </g>
  ),
};

const apple: FlatSprite = {
  w: 44, h: 48,
  node: (
    <g {...LINE}>
      <path d="M22 12C8 6 2 18 4 30c2 12 12 16 18 12 6 4 16 0 18-12 2-12-4-24-18-18Z" fill={C.red} />
      <ellipse cx="12" cy="22" rx="3" ry="5" fill={C.white} stroke="none" opacity={0.7} transform="rotate(20 12 22)" />
      <path d="M22 12q0-6 4-9" fill="none" />
      <path d="M25 8q8-8 16-4-4 8-16 4Z" fill={C.green} strokeWidth={2.500} />
    </g>
  ),
};

const petals = [0, 72, 144, 216, 288].map((a) => {
  const r = ((a - 90) * Math.PI) / 180;
  return <circle key={a} cx={(28 + 10 * Math.cos(r)).toFixed(1)} cy={(17 + 10 * Math.sin(r)).toFixed(1)} r="8" fill={C.pink} />;
});

const flower: FlatSprite = {
  w: 56, h: 90,
  node: (
    <g {...LINE}>
      <path d="M28 50V26" strokeWidth={9} fill="none" />
      <path d="M28 50V26" stroke={C.green} strokeWidth={4} fill="none" />
      <ellipse cx="17" cy="42" rx="9" ry="5" fill={C.green} transform="rotate(-30 17 42)" strokeWidth={2.500} />
      <ellipse cx="39" cy="38" rx="9" ry="5" fill={C.green} transform="rotate(30 39 38)" strokeWidth={2.500} />
      {petals}
      <circle cx="28" cy="17" r="6.500" fill={C.yellow} strokeWidth={2.500} />
      <path d="M12 56h32l-4 30H16Z" fill={C.clay} />
      <rect x="8" y="50" width="40" height="11" rx="4" fill={C.orangeD} />
    </g>
  ),
};

export const SMALL_SPRITES: Record<string, FlatSprite> = { book, cup, water, laptop, apple, flower };
