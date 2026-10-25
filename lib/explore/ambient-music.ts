// Nhạc nền của cảnh Khám phá, TẠO RA bằng thuật toán (không dùng file nhạc nên không vướng bản quyền, không tốn dung lượng tải).
// Gam ngũ cung (nghe êm, hợp không khí Trung Hoa, ghép nốt nào cũng không "chói"): giai điệu đi ngẫu nhiên từng bước nhỏ, thưa thớt, kèm một nốt trầm đều.
// Phần này là hàm thuần (dễ test); phát âm thanh nằm ở `components/explore/ambient-engine.ts`.

import type { SceneTheme } from "./explore-types";

export type Mood = SceneTheme;

export interface MoodConfig {
  /** Nốt gốc (số MIDI). */
  rootMidi: number;
  /** Các bậc của gam ngũ cung, tính bằng nửa cung từ nốt gốc. */
  scale: readonly number[];
  bpm: number;
  /** Xác suất có nốt giai điệu ở mỗi phách (càng thấp càng thưa). */
  density: number;
}

/** Phòng: chậm, thưa, trầm lắng (Rê ngũ cung). Quán ăn: nhanh và rộn rã hơn một chút (Đô ngũ cung). */
export const MOODS: Record<Mood, MoodConfig> = {
  room: { rootMidi: 62, scale: [0, 2, 4, 7, 9], bpm: 60, density: 0.42 },
  eatery: { rootMidi: 60, scale: [0, 2, 4, 7, 9], bpm: 84, density: 0.6 },
  market: { rootMidi: 67, scale: [0, 2, 4, 7, 9], bpm: 92, density: 0.62 },
  station: { rootMidi: 57, scale: [0, 2, 4, 7, 9], bpm: 72, density: 0.38 },
  hospital: { rootMidi: 65, scale: [0, 2, 4, 7, 9], bpm: 52, density: 0.28 },
  school: { rootMidi: 62, scale: [0, 2, 4, 7, 9], bpm: 76, density: 0.5 },
  shop: { rootMidi: 69, scale: [0, 2, 4, 7, 9], bpm: 88, density: 0.6 },
  hotel: { rootMidi: 64, scale: [0, 2, 4, 7, 9], bpm: 56, density: 0.3 },
  airport: { rootMidi: 59, scale: [0, 2, 4, 7, 9], bpm: 80, density: 0.45 },
  park: { rootMidi: 64, scale: [0, 2, 4, 7, 9], bpm: 66, density: 0.5 },
};

export interface MusicNote {
  /** Phách bắt đầu trong ô nhịp (0–3). */
  beat: number;
  midi: number;
  /** Độ dài tính bằng phách. */
  beats: number;
  /** Độ to tương đối 0–1. */
  gain: number;
  voice: "melody" | "bass";
}

export const BEATS_PER_BAR = 4;
/** Giai điệu đi trong hai quãng tám của gam: các bậc 0..(scale.length*2-1). */
const range = (m: MoodConfig) => m.scale.length * 2;

export const midiToHz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);
const degreeToMidi = (m: MoodConfig, degree: number): number => m.rootMidi + 12 * Math.floor(degree / m.scale.length) + m.scale[degree % m.scale.length];

export interface MusicState {
  /** Bậc hiện tại của giai điệu (đi ngẫu nhiên từ bậc này). */
  degree: number;
  bar: number;
}
export const initialMusicState = (): MusicState => ({ degree: 2, bar: 0 });

/**
 * Soạn một ô nhịp 4 phách: nốt trầm ở phách đầu (luân phiên nốt gốc và nốt quãng năm, thấp hơn giai điệu một quãng tám), giai điệu bước ngẫu nhiên
 * (không nhảy quá 2 bậc, hiếm khi lặp nốt) với mật độ theo `density`. Trả các nốt và trạng thái cho ô nhịp sau.
 */
export function planBar(mood: Mood, state: MusicState, rng: () => number): { notes: MusicNote[]; next: MusicState } {
  const cfg = MOODS[mood];
  const notes: MusicNote[] = [];
  const bassDegree = state.bar % 2 === 0 ? 0 : 3; // gốc rồi quãng năm
  notes.push({ beat: 0, midi: degreeToMidi(cfg, bassDegree) - 12, beats: 3.6, gain: 0.55, voice: "bass" });

  let degree = state.degree;
  for (let beat = 0; beat < BEATS_PER_BAR; beat++) {
    if (rng() > cfg.density) continue;
    const step = Math.floor(rng() * 5) - 2; // -2..2
    const next = Math.min(range(cfg) - 1, Math.max(0, degree + (step === 0 && rng() < 0.7 ? (rng() < 0.5 ? -1 : 1) : step)));
    degree = next;
    notes.push({ beat, midi: degreeToMidi(cfg, degree) + 12, beats: 1 + Math.floor(rng() * 2), gain: 0.5 + rng() * 0.3, voice: "melody" });
  }
  return { notes, next: { degree, bar: state.bar + 1 } };
}

/** Thời lượng một phách (giây). */
export const secondsPerBeat = (mood: Mood): number => 60 / MOODS[mood].bpm;
