// Nhạc nền của cảnh Khám phá, TẠO RA bằng thuật toán (không dùng file nhạc nên không vướng bản quyền, không tốn dung lượng tải).
// Mỗi cảnh có một "bản nhạc" riêng: vòng hợp âm bốn ô nhịp (thuận tai như nhạc game thư giãn), giai điệu ngũ cung dựng từ một mô-típ ngắn rồi lặp lại có biến tấu
// (câu hỏi, câu đáp, đảo chiều, kết bằng nốt chủ ở ô nhịp thứ tư), thêm rải hợp âm (arpeggio), nền hợp âm kéo dài và nốt trầm.
// Phần này là hàm thuần (dễ test); phát âm thanh nằm ở `components/explore/ambient-engine.ts`.

import type { SceneTheme } from "./explore-types";

export type Mood = SceneTheme;

/** Hợp âm của vòng hòa âm: `root` là nửa cung tính từ nốt gốc của bản nhạc, `minor` = hợp âm thứ. */
export interface Chord { root: number; minor: boolean }

export interface MoodConfig {
  /** Nốt gốc của bản nhạc (số MIDI). */
  rootMidi: number;
  /** Các bậc của gam ngũ cung dùng cho giai điệu, tính bằng nửa cung từ nốt gốc. */
  scale: readonly number[];
  bpm: number;
  /** Mật độ nốt giai điệu ở các phách phụ (0 = chỉ các nốt chính, 1 = đủ). */
  density: number;
  /** Vòng hòa âm bốn ô nhịp, lặp mãi. */
  progression: readonly [Chord, Chord, Chord, Chord];
  /** Có rải hợp âm nền (arpeggio) không; cảnh yên tĩnh thì tắt. */
  arp: boolean;
}

const MAJ = [0, 2, 4, 7, 9] as const;
const MIN = [0, 3, 5, 7, 10] as const;
const M = (root: number): Chord => ({ root, minor: false });
const m = (root: number): Chord => ({ root, minor: true });

/** Cảm giác từng cảnh: phòng ấm và chậm, quán ăn/chợ/cửa hàng rộn ràng, ga/sân bay có chút man mác (thứ), bệnh viện/khách sạn rất dịu, công viên thong thả. */
export const MOODS: Record<Mood, MoodConfig> = {
  room: { rootMidi: 62, scale: MAJ, bpm: 68, density: 0.55, progression: [M(0), m(9), M(5), M(7)], arp: true },
  eatery: { rootMidi: 60, scale: MAJ, bpm: 96, density: 0.75, progression: [M(0), M(5), M(0), M(7)], arp: true },
  market: { rootMidi: 67, scale: MAJ, bpm: 104, density: 0.8, progression: [M(0), M(7), m(9), M(5)], arp: true },
  station: { rootMidi: 57, scale: MIN, bpm: 80, density: 0.5, progression: [m(0), M(8), M(3), M(10)], arp: true },
  hospital: { rootMidi: 65, scale: MAJ, bpm: 58, density: 0.35, progression: [M(0), M(5), M(0), M(7)], arp: false },
  school: { rootMidi: 62, scale: MAJ, bpm: 88, density: 0.65, progression: [M(0), M(5), M(7), M(0)], arp: true },
  shop: { rootMidi: 69, scale: MAJ, bpm: 108, density: 0.8, progression: [M(0), m(9), M(5), M(7)], arp: true },
  hotel: { rootMidi: 64, scale: MAJ, bpm: 62, density: 0.4, progression: [M(0), m(4), M(5), M(7)], arp: false },
  airport: { rootMidi: 59, scale: MAJ, bpm: 90, density: 0.6, progression: [M(0), M(7), m(9), M(5)], arp: true },
  library: { rootMidi: 60, scale: MAJ, bpm: 60, density: 0.3, progression: [M(0), m(9), M(5), M(7)], arp: false },
  supermarket: { rootMidi: 67, scale: MAJ, bpm: 100, density: 0.8, progression: [M(0), M(5), M(7), M(0)], arp: true },
  beach: { rootMidi: 65, scale: MAJ, bpm: 84, density: 0.6, progression: [M(0), M(7), m(9), M(5)], arp: true },
  office: { rootMidi: 62, scale: MAJ, bpm: 92, density: 0.55, progression: [M(0), m(9), M(5), M(7)], arp: true },
  kitchen: { rootMidi: 60, scale: MAJ, bpm: 96, density: 0.7, progression: [M(0), M(5), M(0), M(7)], arp: true },
  bakery: { rootMidi: 69, scale: MAJ, bpm: 92, density: 0.7, progression: [M(0), m(9), M(5), M(7)], arp: true },
  museum: { rootMidi: 62, scale: MAJ, bpm: 56, density: 0.3, progression: [M(0), m(9), M(5), M(7)], arp: false },
  stadium: { rootMidi: 64, scale: MAJ, bpm: 108, density: 0.8, progression: [M(0), M(7), m(9), M(5)], arp: true },
  bank: { rootMidi: 60, scale: MAJ, bpm: 64, density: 0.35, progression: [M(0), m(9), M(5), M(7)], arp: false },
  cinema: { rootMidi: 57, scale: MIN, bpm: 72, density: 0.45, progression: [m(0), M(8), M(3), M(10)], arp: true },
  gym: { rootMidi: 62, scale: MAJ, bpm: 112, density: 0.85, progression: [M(0), M(7), m(9), M(5)], arp: true },
  salon: { rootMidi: 65, scale: MAJ, bpm: 84, density: 0.6, progression: [M(0), m(9), M(5), M(7)], arp: true },
  park: { rootMidi: 64, scale: MAJ, bpm: 78, density: 0.6, progression: [M(0), M(7), M(5), M(7)], arp: true },
};

export type Voice = "melody" | "arp" | "pad" | "bass";

export interface MusicNote {
  /** Phách bắt đầu trong ô nhịp (0 đến dưới 4, bước nửa phách). */
  beat: number;
  midi: number;
  /** Độ dài tính bằng phách. */
  beats: number;
  /** Độ to tương đối 0–1. */
  gain: number;
  voice: Voice;
}

export const BEATS_PER_BAR = 4;
const SLOTS = BEATS_PER_BAR * 2; // lưới nốt móc đơn (nửa phách)
const PHRASE_BARS = 4;

export const midiToHz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);
/** Thời lượng một phách (giây). */
export const secondsPerBeat = (mood: Mood): number => 60 / MOODS[mood].bpm;

/** Ba nốt của hợp âm (nửa cung từ nốt gốc của bản nhạc). */
export const chordTones = (c: Chord): [number, number, number] => [c.root, c.root + (c.minor ? 3 : 4), c.root + 7];

/** Mô-típ: các ô nhịp (lưới nửa phách) có nốt và bước đi theo bậc của gam giữa hai nốt liên tiếp. */
interface Motif { slots: number[]; steps: number[] }

export interface MusicState {
  bar: number;
  motif: Motif | null;
  /** Nốt giai điệu cuối cùng (số MIDI), để câu sau đi tiếp mượt. */
  last: number;
}
export const initialMusicState = (): MusicState => ({ bar: 0, motif: null, last: 0 });

const RHYTHMS: readonly (readonly number[])[] = [[0, 2, 4, 6], [0, 3, 4, 6], [0, 2, 3, 4, 6], [0, 1, 2, 4, 6], [0, 2, 4, 5, 6], [0, 4, 5, 6]];
const pick = <T,>(xs: readonly T[], rng: () => number): T => xs[Math.min(xs.length - 1, Math.floor(rng() * xs.length))];

function newMotif(rng: () => number): Motif {
  const slots = [...pick(RHYTHMS, rng)];
  return { slots, steps: slots.slice(1).map(() => pick([-2, -1, -1, 1, 1, 2], rng)) };
}

/** Các nốt của gam trong hai quãng tám, bắt đầu một quãng tám trên nốt gốc (vùng của giai điệu). */
function melodyPool(cfg: MoodConfig): number[] {
  const out: number[] = [];
  for (const octave of [12, 24]) for (const s of cfg.scale) out.push(cfg.rootMidi + octave + s);
  out.push(cfg.rootMidi + 36);
  return out;
}

/** Nốt gần `midi` nhất mà là nốt của hợp âm (kể cả nốt ngoài gam, ví dụ hợp âm thứ). */
function nearestChordTone(midi: number, cfg: MoodConfig, chord: Chord): number {
  const tones = chordTones(chord).map((t) => ((t % 12) + 12) % 12);
  let best = midi;
  let bestDist = 99;
  for (let o = -6; o <= 6; o++) {
    if (tones.includes((((midi + o - cfg.rootMidi) % 12) + 12) % 12) && Math.abs(o) < bestDist) { best = midi + o; bestDist = Math.abs(o); }
  }
  return best;
}

const nearestIndex = (pool: readonly number[], midi: number): number => pool.reduce((bi, v, i) => (Math.abs(v - midi) < Math.abs(pool[bi] - midi) ? i : bi), 0);

/**
 * Soạn một ô nhịp 4 phách. Mỗi 4 ô nhịp là một câu theo vòng hợp âm: ô 1 nêu mô-típ, ô 2 lặp lại theo hợp âm mới, ô 3 đảo chiều (biến tấu),
 * ô 4 kết ngắn bằng nốt của hợp âm. Cứ 8 ô nhịp thì đổi mô-típ. Nốt mạnh (phách 1 và 3) luôn là nốt của hợp âm; nốt phụ đi theo gam và thưa dần theo `density`.
 */
export function planBar(mood: Mood, state: MusicState, rng: () => number): { notes: MusicNote[]; next: MusicState } {
  const cfg = MOODS[mood];
  const chord = cfg.progression[state.bar % cfg.progression.length];
  const phraseBar = state.bar % PHRASE_BARS;
  const motif = state.motif && state.bar % (PHRASE_BARS * 2) !== 0 ? state.motif : newMotif(rng);
  const pool = melodyPool(cfg);
  const notes: MusicNote[] = [];

  // Giai điệu.
  let idx = nearestIndex(pool, state.last || pool[2]);
  const picked: { slot: number; midi: number }[] = [];
  const cadence = phraseBar === PHRASE_BARS - 1;
  const slots = cadence ? [0, 4] : motif.slots;
  slots.forEach((slot, k) => {
    const strong = slot === 0 || slot === 4;
    if (!strong && rng() > cfg.density) return;
    if (k > 0) idx = Math.min(pool.length - 1, Math.max(0, idx + motif.steps[Math.min(k - 1, motif.steps.length - 1)] * (phraseBar === 2 ? -1 : 1)));
    let midi = pool[idx];
    if (strong) midi = nearestChordTone(midi, cfg, chord);
    if (cadence && slot === 4) midi = nearestChordTone(cfg.rootMidi + 12 + chord.root + (idx > 5 ? 12 : 0), cfg, chord); // kết bằng nốt gốc của hợp âm
    midi = Math.min(cfg.rootMidi + 36, Math.max(cfg.rootMidi + 9, midi));
    idx = nearestIndex(pool, midi);
    picked.push({ slot, midi });
  });
  picked.forEach((p, i) => {
    const endSlot = i + 1 < picked.length ? picked[i + 1].slot : SLOTS;
    notes.push({ beat: p.slot / 2, midi: p.midi, beats: Math.max(0.5, (endSlot - p.slot) / 2), gain: p.slot === 0 ? 0.8 : 0.5 + rng() * 0.2, voice: "melody" });
  });

  // Rải hợp âm nền (dưới giai điệu một quãng tám).
  const base = cfg.rootMidi - 12;
  const [t0, t1, t2] = chordTones(chord).map((t) => base + t);
  if (cfg.arp) {
    const order = [t0, t1, t2, t0 + 12, t2, t1, t2, t1];
    order.forEach((midi, slot) => { if (slot === 0 || rng() < 0.85) notes.push({ beat: slot / 2, midi, beats: 1, gain: 0.26, voice: "arp" }); });
  }
  // Nền hợp âm kéo dài cả ô nhịp và nốt trầm.
  for (const midi of [t0, t1, t2]) notes.push({ beat: 0, midi, beats: BEATS_PER_BAR, gain: 0.2, voice: "pad" });
  const bass = cfg.rootMidi - 24 + chord.root;
  notes.push({ beat: 0, midi: bass, beats: 3.6, gain: 0.55, voice: "bass" });
  if (state.bar % 2 === 1) notes.push({ beat: 2, midi: bass + 7, beats: 1.8, gain: 0.3, voice: "bass" });

  const last = picked.length ? picked[picked.length - 1].midi : state.last;
  return { notes, next: { bar: state.bar + 1, motif, last } };
}
