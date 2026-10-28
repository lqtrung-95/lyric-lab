import { getAudioContext } from "./audio-context";

// Hiệu ứng âm thanh của các game giải trí, tổng hợp bằng WebAudio (không cần file). Có công tắc riêng, mặc định BẬT, vì cài đặt âm thanh chung mặc định tắt trên điện thoại
// và game không có tiếng thì mất hết cảm giác "đã". Mọi lỗi âm thanh bị nuốt: đây chỉ là phần thưởng thêm.
const KEY = "songhanzi-arcade-sound";
const EVENT = "songhanzi:arcade-sound";

export function isArcadeMuted(): boolean {
  try { return localStorage.getItem(KEY) === "off"; } catch { return false; }
}
export function setArcadeMuted(muted: boolean): void {
  try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* chỉ đổi trong phiên này */ }
  window.dispatchEvent(new Event(EVENT));
}
export function subscribeArcadeSound(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener("storage", onChange); };
}

type Wave = OscillatorType;
function tone(ctx: AudioContext, t: number, type: Wave, from: number, to: number, dur: number, vol: number): void {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}
function noise(ctx: AudioContext, t: number, dur: number, vol: number, cutFrom: number, cutTo: number): void {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
  src.buffer = buf;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutFrom, t);
  filter.frequency.exponentialRampToValueAtTime(cutTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t);
}

/** Chạy `fn` với AudioContext nếu âm thanh đang bật. */
function play(fn: (ctx: AudioContext, t: number) => void): void {
  try {
    if (isArcadeMuted()) return;
    const ctx = getAudioContext();
    if (ctx) fn(ctx, ctx.currentTime);
  } catch { /* bỏ qua */ }
}

export const sfx = {
  /** Mỗi phím gõ đúng: tia laser ngắn; `step` (số chữ đã gõ) làm âm cao dần. */
  laser: (step = 0) => play((c, t) => { tone(c, t, "square", 1100 + step * 90, 260, 0.13, 0.08); tone(c, t, "sawtooth", 600 + step * 60, 150, 0.1, 0.05); }),
  /** Nổ từ: tiếng ồn tắt dần + tiếng bịch trầm; combo càng cao càng "đã". */
  explosion: (combo = 1) => play((c, t) => { noise(c, t, 0.4, 0.3, 2600, 160); tone(c, t, "sine", 140, 38, 0.35, 0.4); if (combo >= 3) tone(c, t + 0.05, "triangle", 660, 1320, 0.18, 0.1); }),
  /** Từ chạm đáy: tiếng thịch nặng. */
  miss: () => play((c, t) => { tone(c, t, "sawtooth", 200, 45, 0.45, 0.3); noise(c, t, 0.3, 0.25, 900, 120); }),
  /** Gõ sai hoặc chạm sai. */
  buzz: () => play((c, t) => { tone(c, t, "square", 150, 110, 0.18, 0.12); }),
  /** Lên cấp: quãng arpeggio đi lên. */
  levelUp: () => play((c, t) => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, t + i * 0.08, "triangle", f, f, 0.16, 0.2)); }),
  /** Đập trúng / chạm đúng: tiếng "pop" vui. */
  pop: (combo = 0) => play((c, t) => { const f = 520 + Math.min(combo, 8) * 60; tone(c, t, "sine", f, f * 2, 0.11, 0.25); tone(c, t + 0.02, "triangle", f * 1.5, f * 3, 0.08, 0.1); }),
  /** Hết ván. */
  gameOver: () => play((c, t) => { [392, 330, 262, 196].forEach((f, i) => tone(c, t + i * 0.14, "triangle", f, f * 0.97, 0.22, 0.22)); }),
};
