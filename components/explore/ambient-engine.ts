import { BEATS_PER_BAR, initialMusicState, midiToHz, planBar, secondsPerBeat, type Mood, type MusicNote } from "@/lib/explore/ambient-music";
import { karplusStrong } from "./pluck-synth";

/** Độ to tổng của nhạc nền: vừa nghe được nhưng không át giọng đọc và hiệu ứng. */
const TARGET_GAIN = 0.2;
/** Khi đang có giọng đọc tiếng Trung thì hạ nhạc xuống còn chừng này. */
const DUCK_FACTOR = 0.25;
const LOOKAHEAD_SEC = 1.5;
const TICK_MS = 300;
const PLUCK_SECONDS = 2.6;

export interface AmbientMusic {
  /** Hạ nhỏ nhạc khi có giọng đọc, trả lại bình thường khi hết. */
  setDucked(ducked: boolean): void;
  /** Tạm dừng/tiếp tục (khi tab bị ẩn). */
  setPaused(paused: boolean): void;
  /** Tắt dần rồi giải phóng bộ âm thanh. */
  stop(): void;
}

/** Đường vang (reverb) tạo bằng nhiễu tắt dần hai kênh, đủ để tiếng đàn có không gian mà không cần file âm thanh. */
function makeReverb(ctx: AudioContext): ConvolverNode {
  const seconds = 2.2;
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.8;
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

/**
 * Chạy nhạc nền sinh tự động (xem `lib/explore/ambient-music.ts` cho phần soạn nhạc): lập lịch từng ô nhịp trước 1,5 giây bằng đồng hồ của AudioContext.
 * Giọng: giai điệu là đàn dây gảy (Karplus-Strong), rải hợp âm là tiếng "kalimba" mềm, nền hợp âm là hai sóng sin lệch nhẹ qua bộ lọc, nốt trầm là sóng sin;
 * tất cả qua đường vang chung. Trả null nếu trình duyệt không có Web Audio. Phải gọi sau thao tác của người dùng (trình duyệt chặn tự phát).
 */
export function startAmbientMusic(mood: Mood): AmbientMusic | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const spb = secondsPerBeat(mood);

  const master = ctx.createGain();
  master.gain.value = 0;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -16;
  limiter.ratio.value = 4;
  master.connect(limiter);
  limiter.connect(ctx.destination);
  master.gain.setTargetAtTime(TARGET_GAIN, ctx.currentTime, 1.2); // vào nhạc từ từ

  const dry = ctx.createGain();
  dry.gain.value = 0.85;
  dry.connect(master);
  const reverb = makeReverb(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.4;
  reverb.connect(wet);
  wet.connect(master);
  const bus = ctx.createGain();
  bus.connect(dry);
  bus.connect(reverb);

  const plucks = new Map<number, AudioBuffer>();
  const pluckBuffer = (midi: number): AudioBuffer => {
    let b = plucks.get(midi);
    if (!b) {
      const data = karplusStrong(midiToHz(midi), ctx.sampleRate, PLUCK_SECONDS);
      b = ctx.createBuffer(1, data.length, ctx.sampleRate);
      b.copyToChannel(data as Float32Array<ArrayBuffer>, 0);
      plucks.set(midi, b);
    }
    return b;
  };

  const envelope = (t: number, peak: number, attack: number, end: number): GainNode => {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    env.connect(bus);
    return env;
  };

  const play = (t: number, n: MusicNote) => {
    const f = midiToHz(n.midi);
    if (n.voice === "melody") {
      const src = ctx.createBufferSource();
      src.buffer = pluckBuffer(n.midi);
      const env = envelope(t, n.gain * 0.9, 0.004, t + PLUCK_SECONDS - 0.1);
      src.connect(env);
      src.start(t);
      return;
    }
    if (n.voice === "arp") {
      const end = t + 0.9;
      const env = envelope(t, n.gain * 0.5, 0.006, end);
      for (const [mult, level] of [[1, 1], [2, 0.25]] as const) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        g.gain.value = level;
        osc.type = "sine";
        osc.frequency.value = f * mult;
        osc.connect(g);
        g.connect(env);
        osc.start(t);
        osc.stop(end + 0.05);
      }
      return;
    }
    const end = t + n.beats * spb;
    if (n.voice === "pad") {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1100;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(n.gain * 0.35, t + Math.min(0.9, n.beats * spb * 0.4));
      env.gain.setValueAtTime(n.gain * 0.35, end - 0.5);
      env.gain.exponentialRampToValueAtTime(0.0001, end + 0.4);
      lp.connect(env);
      env.connect(bus);
      for (const detune of [-5, 5]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.detune.value = detune;
        osc.connect(lp);
        osc.start(t);
        osc.stop(end + 0.45);
      }
      return;
    }
    const osc = ctx.createOscillator();
    const env = envelope(t, n.gain * 0.55, 0.06, end);
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(env);
    osc.start(t);
    osc.stop(end + 0.05);
  };

  let state = initialMusicState();
  let next = ctx.currentTime + 0.3;
  const tick = () => {
    while (next < ctx.currentTime + LOOKAHEAD_SEC) {
      const bar = planBar(mood, state, Math.random);
      for (const n of bar.notes) play(next + n.beat * spb, n);
      state = bar.next;
      next += BEATS_PER_BAR * spb;
    }
  };
  tick();
  const timer = setInterval(tick, TICK_MS);

  return {
    setDucked: (ducked) => master.gain.setTargetAtTime(ducked ? TARGET_GAIN * DUCK_FACTOR : TARGET_GAIN, ctx.currentTime, 0.25),
    setPaused: (paused) => { void (paused ? ctx.suspend() : ctx.resume()); },
    stop: () => {
      clearInterval(timer);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => { void ctx.close(); }, 900);
    },
  };
}
