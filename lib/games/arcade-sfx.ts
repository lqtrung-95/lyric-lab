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
  // --- Linh vật (pet): mọi tương tác đều có tiếng, cùng công tắc với game giải trí. ---
  /**
   * Chạm vào pet: tiếng kêu riêng từng loài, mềm và tròn kiểu thú nhồi bông (chỉ dùng sóng sine, nốt lướt lên rồi xuống như tiếng "bíp" bong bóng),
   * kết bằng một tiếng lấp lánh nhỏ. Âm lượng thấp để không chói khi chạm liên tục.
   */
  petChirp: (species: string) => play((c, t) => {
    const sparkle = (at: number) => tone(c, t + at, "sine", 2400, 3000, 0.09, 0.04);
    switch (species) {
      case "dragon": tone(c, t, "sine", 330, 520, 0.1, 0.16); tone(c, t + 0.09, "sine", 780, 1180, 0.08, 0.14); tone(c, t + 0.17, "sine", 1180, 900, 0.1, 0.1); sparkle(0.22); break;
      case "cat": tone(c, t, "sine", 700, 1150, 0.09, 0.16); tone(c, t + 0.08, "sine", 1150, 720, 0.2, 0.15); sparkle(0.24); break;
      case "dog": tone(c, t, "sine", 520, 820, 0.06, 0.16); tone(c, t + 0.09, "sine", 540, 860, 0.06, 0.16); tone(c, t + 0.18, "sine", 900, 640, 0.1, 0.1); sparkle(0.24); break;
      case "panda": [0, 0.085, 0.17].forEach((d, i) => tone(c, t + d, "sine", 1000 + i * 80, 1500 + i * 80, 0.06, 0.15)); sparkle(0.25); break;
      case "owl": tone(c, t, "sine", 520, 440, 0.17, 0.17); tone(c, t + 0.2, "sine", 500, 410, 0.2, 0.15); sparkle(0.42); break;
      default: tone(c, t, "sine", 700, 1100, 0.09, 0.16); tone(c, t + 0.08, "sine", 1100, 760, 0.16, 0.12); sparkle(0.22);
    }
  }),
  /** Bấm mở/đóng khung của pet (cho ăn, tập nói): tiếng "tít" nhẹ. */
  petBlip: () => play((c, t) => { tone(c, t, "sine", 660, 880, 0.06, 0.12); }),
  /** Pet nhai: hai tiếng "rộp" ngắn. */
  petCrunch: () => play((c, t) => { noise(c, t, 0.08, 0.22, 3200, 700); noise(c, t + 0.12, 0.08, 0.2, 3000, 650); tone(c, t, "sine", 180, 120, 0.08, 0.12); }),
  /** Pet vui (đạt mục tiêu, ăn no): vài nốt lấp lánh đi lên. */
  petHappy: () => play((c, t) => { [784, 988, 1175, 1568].forEach((f, i) => tone(c, t + i * 0.06, "sine", f, f, 0.14, 0.14)); }),
  /** Pet reo mừng (lên cấp, tăng chuỗi, đọc chuẩn): arpeggio đi lên có đuôi sáng. */
  petCheer: () => play((c, t) => { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(c, t + i * 0.07, "triangle", f, f, 0.16, 0.16)); tone(c, t + 0.4, "sine", 2093, 2093, 0.25, 0.08); }),
  /** Pet buồn nhẹ (mất chuỗi): hai nốt đi xuống, êm, không gắt. */
  petSad: () => play((c, t) => { tone(c, t, "triangle", 440, 392, 0.3, 0.12); tone(c, t + 0.28, "triangle", 349, 294, 0.4, 0.11); }),
  /** Quà đến: ba nốt lấp lánh cao. */
  petGift: () => play((c, t) => { [1318.5, 1760, 2093].forEach((f, i) => tone(c, t + i * 0.08, "sine", f, f, 0.2, 0.1)); }),
  /** Nhận nuôi: khúc chào mừng ngắn kết bằng hợp âm. */
  petAdopt: () => play((c, t) => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, t + i * 0.1, "triangle", f, f, 0.18, 0.18)); [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(c, t + 0.45, "sine", f, f, 0.6, 0.07)); }),
  /** Tiến hóa: arpeggio dài rộng dần và tiếng "thăng hoa" cuối. */
  petEvolve: () => play((c, t) => { [392, 523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => tone(c, t + i * 0.09, "triangle", f, f, 0.2, 0.17)); tone(c, t + 0.7, "sine", 1568, 3136, 0.6, 0.1); }),
};
