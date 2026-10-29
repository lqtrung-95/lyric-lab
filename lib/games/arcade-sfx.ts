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

/** Một nốt: [trễ (giây), tần số đầu, tần số cuối, độ dài (giây), âm lượng]. Chỉ dùng sóng sine để tiếng tròn, mềm như thú nhồi bông. */
type Note = readonly [number, number, number, number, number];
interface Voice { chirp: readonly Note[]; happy: readonly Note[]; sleepy: readonly Note[] }
const PET_VOICES: Record<string, Voice> = {
  dragon: { chirp: [[0, 330, 520, 0.1, 0.16], [0.09, 780, 1180, 0.08, 0.14], [0.17, 1180, 900, 0.1, 0.1]], happy: [[0, 330, 520, 0.1, 0.14], [0.1, 520, 780, 0.1, 0.14], [0.2, 780, 1180, 0.14, 0.14]], sleepy: [[0, 300, 190, 0.5, 0.14]] },
  cat: { chirp: [[0, 700, 1150, 0.09, 0.16], [0.08, 1150, 720, 0.2, 0.15]], happy: [[0, 520, 560, 0.05, 0.13], [0.05, 600, 640, 0.05, 0.13], [0.1, 520, 560, 0.05, 0.13], [0.15, 640, 720, 0.05, 0.13], [0.2, 900, 1250, 0.14, 0.14]], sleepy: [[0, 650, 380, 0.45, 0.13]] },
  dog: { chirp: [[0, 520, 820, 0.06, 0.16], [0.09, 540, 860, 0.06, 0.16], [0.18, 900, 640, 0.1, 0.1]], happy: [[0, 600, 950, 0.06, 0.15], [0.1, 650, 1000, 0.06, 0.15], [0.2, 700, 1100, 0.06, 0.15], [0.3, 1000, 1500, 0.12, 0.13]], sleepy: [[0, 520, 300, 0.5, 0.12]] },
  panda: { chirp: [[0, 1000, 1500, 0.06, 0.15], [0.085, 1080, 1580, 0.06, 0.15], [0.17, 1160, 1660, 0.06, 0.15]], happy: [[0, 1000, 1500, 0.06, 0.15], [0.09, 1100, 1600, 0.06, 0.15], [0.18, 1200, 1750, 0.06, 0.15], [0.27, 1500, 2100, 0.12, 0.12]], sleepy: [[0, 760, 420, 0.5, 0.12]] },
  owl: { chirp: [[0, 520, 440, 0.17, 0.17], [0.2, 500, 410, 0.2, 0.15]], happy: [[0, 440, 420, 0.14, 0.16], [0.18, 480, 450, 0.14, 0.16], [0.36, 620, 560, 0.22, 0.15]], sleepy: [[0, 400, 300, 0.6, 0.14]] },
  rabbit: { chirp: [[0, 1300, 1700, 0.04, 0.13], [0.07, 1300, 1700, 0.04, 0.13], [0.16, 1500, 1900, 0.05, 0.1]], happy: [[0, 900, 1400, 0.05, 0.14], [0.09, 1000, 1500, 0.05, 0.14], [0.18, 1100, 1700, 0.05, 0.14], [0.27, 1500, 2000, 0.1, 0.12]], sleepy: [[0, 900, 500, 0.4, 0.1]] },
  fox: { chirp: [[0, 900, 1300, 0.06, 0.14], [0.1, 1300, 800, 0.16, 0.14]], happy: [[0, 700, 1100, 0.07, 0.15], [0.1, 900, 1400, 0.07, 0.15], [0.2, 1200, 1800, 0.12, 0.14]], sleepy: [[0, 620, 360, 0.5, 0.12]] },
  penguin: { chirp: [[0, 620, 700, 0.08, 0.15], [0.1, 500, 420, 0.14, 0.15]], happy: [[0, 600, 720, 0.08, 0.15], [0.12, 660, 800, 0.08, 0.15], [0.24, 800, 1000, 0.16, 0.14]], sleepy: [[0, 480, 330, 0.5, 0.12]] },
};
/** Phát các nốt của một giọng; `sparkle` thêm tiếng lấp lánh nhỏ ở cuối. */
function voice(c: AudioContext, t: number, notes: readonly Note[], sparkle: boolean): void {
  let end = 0;
  for (const [at, from, to, dur, vol] of notes) { tone(c, t + at, "sine", from, to, dur, vol); end = Math.max(end, at + dur); }
  if (sparkle) tone(c, t + end, "sine", 2400, 3000, 0.09, 0.04);
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
  /** Phát đạn tự động của Phi đội: tiếng "pew" rất nhỏ và ngắn để nghe 5 lần mỗi giây không mệt. */
  pew: () => play((c, t) => { tone(c, t, "square", 880, 420, 0.07, 0.025); }),
  /** Nhặt vật phẩm: quãng đi lên lấp lánh. */
  power: () => play((c, t) => { [659.25, 880, 1318.5].forEach((f, i) => tone(c, t + i * 0.06, "square", f, f * 1.02, 0.1, 0.07)); }),
  /** Hết ván. */
  gameOver: () => play((c, t) => { [392, 330, 262, 196].forEach((f, i) => tone(c, t + i * 0.14, "triangle", f, f * 0.97, 0.22, 0.22)); }),
  // --- Linh vật (pet): mọi tương tác đều có tiếng, cùng công tắc với game giải trí. ---
  /** Chạm vào pet: tiếng kêu riêng từng loài (xem `PET_VOICES`), mềm và tròn, kết bằng một tiếng lấp lánh nhỏ. */
  petChirp: (species: string) => play((c, t) => voice(c, t, (PET_VOICES[species] ?? PET_VOICES.cat).chirp, true)),
  /** Pet vui (đạt mục tiêu, ăn no): chuỗi nốt riêng từng loài đi lên rồi một tiếng lấp lánh. */
  petHappy: (species?: string) => play((c, t) => voice(c, t, (PET_VOICES[species ?? ""] ?? PET_VOICES.cat).happy, true)),
  /** Chạm vào pet đang ngủ: tiếng ngáp ngái ngủ riêng từng loài, trượt xuống chậm, không lấp lánh. */
  petSleepy: (species?: string) => play((c, t) => voice(c, t, (PET_VOICES[species ?? ""] ?? PET_VOICES.cat).sleepy, false)),
  /** Bấm mở/đóng khung của pet (cho ăn, tập nói): tiếng "tít" nhẹ. */
  petBlip: () => play((c, t) => { tone(c, t, "sine", 660, 880, 0.06, 0.12); }),
  /** Pet nhai: hai tiếng "rộp" ngắn. */
  petCrunch: () => play((c, t) => { noise(c, t, 0.08, 0.22, 3200, 700); noise(c, t + 0.12, 0.08, 0.2, 3000, 650); tone(c, t, "sine", 180, 120, 0.08, 0.12); }),
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
