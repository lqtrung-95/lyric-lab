import { TONE_TEMPLATES, type ToneId } from "./tone-data";

// Dò cao độ (F0) của giọng nói và nhận dạng thanh điệu của một âm tiết, chạy hoàn toàn trên máy người dùng (không gửi âm thanh đi đâu, không dùng AI).
// Thuật toán YIN (de Cheveigné & Kawahara, 2002): hiệu chuẩn tự tương quan có chuẩn hóa, ổn định hơn tự tương quan thường với giọng nói.

const ANALYSIS_RATE = 16_000;
const FRAME_SECONDS = 0.03;
const HOP_SECONDS = 0.01;
const MIN_HZ = 80;
const MAX_HZ = 450;
const YIN_THRESHOLD = 0.25;
/** Khung nhỏ hơn mức này (so với khung to nhất) coi là im lặng/hơi thở, không dò cao độ. */
const ENERGY_FLOOR = 0.08;
/** Khoảng trống hữu thanh tối đa (số khung 10 ms) được nối liền khi trích đường cao độ của một âm tiết. */
const MAX_GAP_FRAMES = 4;
/** Đoạn hữu thanh tối thiểu (khung 10 ms) và số điểm tối thiểu của đường cao độ sau khi cắt hai đầu: ngắn hơn thì không đủ để kết luận thanh (đo: thanh 4 sau phụ âm bật hơi có khi chỉ ~90 ms hữu thanh). */
const MIN_VOICED_FRAMES = 7;
const MIN_CONTOUR_POINTS = 6;

export interface PitchFrame { time: number; f0: number | null }

/** Hạ tần số lấy mẫu bằng trung bình các mẫu gần nhau (đủ cho giọng nói; tránh tốn công tính ở 44,1/48 kHz). */
export function downsample(samples: Float32Array, sampleRate: number, target = ANALYSIS_RATE): Float32Array {
  if (sampleRate <= target) return samples;
  const ratio = sampleRate / target;
  const out = new Float32Array(Math.floor(samples.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

/** F0 (Hz) của một khung âm thanh bằng YIN, hoặc null nếu khung không có cao độ rõ (vô thanh, nhiễu). */
export function yinPitch(frame: Float32Array, sampleRate: number, minHz = MIN_HZ, maxHz = MAX_HZ, threshold = YIN_THRESHOLD): number | null {
  const maxLag = Math.floor(sampleRate / minHz);
  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  const window = frame.length - maxLag;
  if (window <= 0) return null;
  const diff = new Float32Array(maxLag + 1);
  for (let tau = 1; tau <= maxLag; tau++) {
    let sum = 0;
    for (let j = 0; j < window; j++) { const d = frame[j] - frame[j + tau]; sum += d * d; }
    diff[tau] = sum;
  }
  const cmnd = new Float32Array(maxLag + 1);
  cmnd[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= maxLag; tau++) {
    running += diff[tau];
    cmnd[tau] = running === 0 ? 1 : (diff[tau] * tau) / running;
  }
  let best = -1;
  for (let tau = minLag; tau < maxLag; tau++) {
    if (cmnd[tau] < threshold) {
      while (tau + 1 < maxLag && cmnd[tau + 1] < cmnd[tau]) tau++;
      best = tau;
      break;
    }
  }
  if (best < 0) return null;
  // Nội suy parabol quanh cực tiểu để có độ phân giải dưới một mẫu.
  const a = cmnd[best - 1], b = cmnd[best], c = cmnd[best + 1] ?? b;
  const denominator = a - 2 * b + c;
  const shift = denominator === 0 ? 0 : (a - c) / (2 * denominator);
  return sampleRate / (best + shift);
}

const rms = (frame: Float32Array) => { let s = 0; for (const v of frame) s += v * v; return Math.sqrt(s / frame.length); };

/** Dò F0 mỗi 10 ms (khung 40 ms). Khung quá nhỏ so với khung to nhất bị bỏ qua (im lặng, tiếng thở). */
export function trackPitch(input: Float32Array, sampleRate: number): PitchFrame[] {
  const samples = downsample(input, sampleRate);
  const rate = Math.min(sampleRate, ANALYSIS_RATE);
  const size = Math.floor(FRAME_SECONDS * rate);
  const hop = Math.floor(HOP_SECONDS * rate);
  const frames: { time: number; chunk: Float32Array; level: number }[] = [];
  for (let start = 0; start + size <= samples.length; start += hop) {
    const chunk = samples.subarray(start, start + size);
    frames.push({ time: start / rate, chunk, level: rms(chunk) });
  }
  const peak = Math.max(0, ...frames.map((f) => f.level));
  return frames.map((f) => ({ time: f.time, f0: peak > 0 && f.level >= peak * ENERGY_FLOOR ? yinPitch(f.chunk, rate) : null }));
}

const median = (values: number[]) => { const s = [...values].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const toSemitones = (hz: number, reference: number) => 12 * Math.log2(hz / reference);

/**
 * Đường cao độ (nửa cung so với trung vị) của MỘT âm tiết từ các khung đã dò: lấy đoạn hữu thanh dài nhất (nối các khoảng trống ngắn), sửa nhảy quãng tám, lọc trung vị
 * để bỏ điểm lẻ và cắt hai đầu (phụ âm làm méo cao độ ở đầu và cuối âm tiết). Trả mảng rỗng nếu không đủ dữ liệu hữu thanh (dưới 70 ms).
 */
export function extractContour(frames: PitchFrame[]): number[] {
  type Run = { start: number; end: number };
  const runs: Run[] = [];
  let cur: Run | null = null;
  let gap = 0;
  frames.forEach((f, i) => {
    if (f.f0 !== null) {
      if (cur && gap <= MAX_GAP_FRAMES) cur.end = i; else { cur = { start: i, end: i }; runs.push(cur); }
      gap = 0;
    } else gap++;
  });
  if (runs.length === 0) return [];
  const longest = runs.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
  const voiced = frames.slice(longest.start, longest.end + 1);
  if (voiced.length < MIN_VOICED_FRAMES) return [];

  const known = voiced.filter((f) => f.f0 !== null).map((f) => f.f0 as number);
  const reference = median(known);
  // Điền khoảng trống bằng nội suy tuyến tính theo thời gian.
  const st: number[] = voiced.map((f) => (f.f0 === null ? NaN : toSemitones(f.f0, reference)));
  for (let i = 0; i < st.length; i++) {
    if (!Number.isNaN(st[i])) continue;
    let lo = i - 1, hi = i + 1;
    while (hi < st.length && Number.isNaN(st[hi])) hi++;
    const a = st[lo], b = st[hi];
    for (let k = i; k < hi; k++) st[k] = (a ?? b) + (((b ?? a) - (a ?? b)) * (k - lo)) / (hi - lo);
    lo = hi;
  }
  // Nhảy quãng tám (≈ ±12 nửa cung giữa hai khung liền nhau) là lỗi dò: kéo về cùng quãng tám với khung trước.
  for (let i = 1; i < st.length; i++) {
    const jump = st[i] - st[i - 1];
    if (Math.abs(jump) > 8) st[i] -= 12 * Math.round(jump / 12);
  }
  const smooth = st.map((_, i) => median(st.slice(Math.max(0, i - 2), Math.min(st.length, i + 3))));
  const trim = Math.floor(smooth.length * 0.08);
  const body = smooth.slice(trim, smooth.length - trim);
  return body.length >= MIN_CONTOUR_POINTS ? body : [];
}

/** Lấy `n` điểm cách đều theo thời gian bằng nội suy tuyến tính. */
export function resample(values: number[], n = 5): number[] {
  if (values.length === 0) return [];
  if (values.length === 1) return Array.from({ length: n }, () => values[0]);
  return Array.from({ length: n }, (_, i) => {
    const pos = (i * (values.length - 1)) / (n - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(values.length - 1, lo + 1);
    return values[lo] + (values[hi] - values[lo]) * (pos - lo);
  });
}

export interface ToneGuess {
  /** Thanh gần nhất; null khi không đủ dữ liệu cao độ. */
  tone: ToneId | null;
  /** 0-1: độ chắc chắn, dựa vào khoảng cách giữa thanh gần nhất và thanh gần thứ hai. */
  confidence: number;
  /** Biên độ cao độ (nửa cung): đo mức "lên/xuống" của giọng, để phân biệt thanh 1 (bằng) với các thanh còn lại. */
  range: number;
}

/** Khi biên độ nhỏ hơn mức này (nửa cung) giọng coi là bằng phẳng: thanh 1. */
const FLAT_RANGE = 1.8;
const shapeOf = (values: number[]) => { const lo = Math.min(...values), hi = Math.max(...values); const span = hi - lo || 1; const mid = (hi + lo) / 2; return values.map((v) => (v - mid) / span); };
const distance = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length);

/**
 * Nhận dạng thanh điệu từ đường cao độ (nửa cung). Thanh 1 nhận bằng biên độ nhỏ; thanh 2, 3, 4 so HÌNH DẠNG (chuẩn hóa theo biên độ, nên không phụ thuộc giọng cao hay thấp,
 * rộng hay hẹp) với đường mẫu `TONE_TEMPLATES`. Hạn chế: thanh 3 nửa (chỉ xuống thấp, hay gặp trong nói liền) dễ bị nhận là thanh 4; bài luyện từng âm tiết yêu cầu đọc thanh 3 đầy đủ (xuống rồi lên).
 */
export function classifyTone(contour: number[]): ToneGuess {
  if (contour.length < MIN_CONTOUR_POINTS) return { tone: null, confidence: 0, range: 0 };
  const points = resample(contour, 5);
  const range = Math.max(...points) - Math.min(...points);
  if (range < FLAT_RANGE) return { tone: 1, confidence: Math.max(0.3, Math.min(1, 1 - range / FLAT_RANGE / 2)), range };
  const shape = shapeOf(points);
  const scored = ([2, 3, 4] as ToneId[]).map((tone) => ({ tone, d: distance(shape, shapeOf(TONE_TEMPLATES[tone])) })).sort((a, b) => a.d - b.d);
  const margin = scored[1].d - scored[0].d;
  return { tone: scored[0].tone, confidence: Math.max(0, Math.min(1, margin / 0.35)), range };
}

/** Từ mẫu âm thanh của một lần đọc một âm tiết đến đường cao độ và thanh nhận dạng. */
export function analyzeSyllable(samples: Float32Array, sampleRate: number): { contour: number[]; guess: ToneGuess } {
  const contour = extractContour(trackPitch(samples, sampleRate));
  return { contour, guess: classifyTone(contour) };
}
