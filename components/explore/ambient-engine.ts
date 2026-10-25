import { BEATS_PER_BAR, initialMusicState, midiToHz, planBar, secondsPerBeat, type Mood, type MusicNote } from "@/lib/explore/ambient-music";

/** Độ to tổng của nhạc nền: rất nhỏ để không át giọng đọc và hiệu ứng. */
const TARGET_GAIN = 0.1;
/** Khi đang có giọng đọc tiếng Trung thì hạ nhạc xuống còn chừng này. */
const DUCK_FACTOR = 0.25;
const LOOKAHEAD_SEC = 1.5;
const TICK_MS = 300;

export interface AmbientMusic {
  /** Hạ nhỏ nhạc khi có giọng đọc, trả lại bình thường khi hết. */
  setDucked(ducked: boolean): void;
  /** Tạm dừng/tiếp tục (khi tab bị ẩn). */
  setPaused(paused: boolean): void;
  /** Tắt dần rồi giải phóng bộ âm thanh. */
  stop(): void;
}

/**
 * Chạy nhạc nền sinh tự động: lập lịch từng ô nhịp trước 1,5 giây bằng đồng hồ của AudioContext (chính xác hơn setTimeout), nốt giai điệu là sóng tam giác
 * mềm, nốt trầm là sóng sin, qua một đường vang (trễ có hồi tiếp, lọc bớt âm cao). Trả null nếu trình duyệt không có Web Audio.
 * Phải gọi sau thao tác của người dùng (trình duyệt chặn tự phát).
 */
export function startAmbientMusic(mood: Mood): AmbientMusic | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const spb = secondsPerBeat(mood);

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  master.gain.setTargetAtTime(TARGET_GAIN, ctx.currentTime, 1.2); // vào nhạc từ từ

  const bus = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.42;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2000;
  bus.connect(master);
  bus.connect(delay);
  delay.connect(tone);
  tone.connect(feedback);
  feedback.connect(delay);
  tone.connect(master);

  const play = (t: number, n: MusicNote) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = n.voice === "bass" ? "sine" : "triangle";
    osc.frequency.value = midiToHz(n.midi);
    const attack = n.voice === "bass" ? 0.25 : 0.02;
    const end = t + n.beats * spb * (n.voice === "bass" ? 1 : 1.6);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(n.gain * 0.5, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(env);
    env.connect(bus);
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
