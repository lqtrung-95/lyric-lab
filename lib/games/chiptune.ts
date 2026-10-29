import { getAudioContext } from "./audio-context";
import { isArcadeMuted } from "./arcade-sfx";

// Nhạc nền chiptune vòng lặp cho Phi đội, tổng hợp bằng WebAudio (không cần file): bè trầm vuông và bè arpeggio tam giác theo vòng hợp âm Am – F – C – G.
// Lên lịch trước 0,3 giây bằng setInterval để nhịp đều dù khung hình giật; tắt tiếng thì bỏ qua lượt lên lịch; mọi lỗi âm thanh bị nuốt.
const CHORDS: { root: number; tones: [number, number] }[] = [
  { root: 110, tones: [3, 7] }, { root: 87.31, tones: [4, 7] }, { root: 130.81, tones: [4, 7] }, { root: 98, tones: [4, 7] },
];
const STEPS_PER_BAR = 8;

function voice(ctx: AudioContext, t: number, type: OscillatorType, freq: number, dur: number, vol: number): void {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Tần số của nốt thứ `step` (đếm từ 0, mỗi nốt là một phách tám). */
export function chiptuneNotes(step: number): { bass: number | null; lead: number } {
  const chord = CHORDS[Math.floor(step / STEPS_PER_BAR) % CHORDS.length];
  const i = step % STEPS_PER_BAR;
  const semis = [0, chord.tones[0], chord.tones[1], 12, chord.tones[1], chord.tones[0], 12, chord.tones[1]];
  return { bass: i % 2 === 0 ? chord.root * (i === 4 ? 2 : 1) : null, lead: chord.root * 4 * 2 ** (semis[i] / 12) };
}

/** Bắt đầu phát nhạc; `bpm()` được đọc lại mỗi lượt lên lịch nên nhạc nhanh dần theo cấp. Trả hàm dừng. */
export function startChiptune(bpm: () => number): () => void {
  let step = 0, next = 0;
  const tick = () => {
    try {
      if (isArcadeMuted()) { next = 0; return; }
      const ctx = getAudioContext();
      if (!ctx) return;
      if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
      while (next < ctx.currentTime + 0.3) {
        const { bass, lead } = chiptuneNotes(step);
        const beat = 30 / bpm();
        if (bass) voice(ctx, next, "square", bass, beat * 1.6, 0.035);
        voice(ctx, next, "triangle", lead, beat * 0.9, 0.03);
        next += beat; step += 1;
      }
    } catch { /* nhạc chỉ là phần thưởng thêm */ }
  };
  const timer = window.setInterval(tick, 120);
  return () => window.clearInterval(timer);
}
