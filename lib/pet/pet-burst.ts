/** Hiệu ứng hạt + tiếng đi kèm mỗi tương tác với pet. Một "burst" = một đợt hạt bay ra từ pet kèm một tiếng. */
export type PetBurstKind = "tap" | "cheer" | "goal" | "sad" | "crunch" | "full" | "gift" | "adopt" | "evolve" | "try";
export interface PetBurst { key: number; kind: PetBurstKind }

export type PetBurstSound = "chirp" | "cheer" | "happy" | "sad" | "crunch" | "gift" | "adopt" | "evolve" | "blip";

interface Spec { glyphs: readonly string[]; count: number; sound: PetBurstSound; /** Bay lên (true) hay rơi xuống (false). */ rise: boolean }

const SPECS: Record<PetBurstKind, Spec> = {
  tap: { glyphs: ["❤️", "💖"], count: 5, sound: "chirp", rise: true },
  cheer: { glyphs: ["⭐", "✨"], count: 9, sound: "cheer", rise: true },
  goal: { glyphs: ["🎉", "⭐", "✨"], count: 11, sound: "happy", rise: true },
  sad: { glyphs: ["💧"], count: 3, sound: "sad", rise: false },
  crunch: { glyphs: ["🍪", "✨"], count: 5, sound: "crunch", rise: false },
  full: { glyphs: ["😋", "⭐", "✨"], count: 9, sound: "happy", rise: true },
  gift: { glyphs: ["🎁", "✨"], count: 8, sound: "gift", rise: true },
  adopt: { glyphs: ["💖", "🎉", "✨"], count: 12, sound: "adopt", rise: true },
  evolve: { glyphs: ["🌟", "✨", "⭐"], count: 14, sound: "evolve", rise: true },
  try: { glyphs: ["💭", "✨"], count: 4, sound: "blip", rise: true },
};

export const burstSound = (kind: PetBurstKind): PetBurstSound => SPECS[kind].sound;

export interface Particle { glyph: string; dx: number; dy: number; delayMs: number; sizeRem: number }

/** Các hạt của một burst, xếp đều theo hình quạt (cố định theo `kind` và chỉ số, không ngẫu nhiên nên kiểm thử được và không giật giữa các lần vẽ). */
export function burstParticles(kind: PetBurstKind): Particle[] {
  const { glyphs, count, rise } = SPECS[kind];
  return Array.from({ length: count }, (_, i) => {
    const spread = count === 1 ? 0 : i / (count - 1) - 0.5; // -0.5..0.5
    const dx = Math.round(spread * 110 + ((i % 2) * 8 - 4));
    const lift = 34 + ((i * 17) % 28);
    return { glyph: glyphs[i % glyphs.length], dx, dy: rise ? -lift : lift * 0.7, delayMs: (i % 4) * 60, sizeRem: 0.9 + ((i * 7) % 5) * 0.12 };
  });
}
