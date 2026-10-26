/**
 * Tiếng đàn dây gảy (như đàn tranh, tỳ bà) theo thuật toán Karplus-Strong: một vòng trễ có độ dài bằng một chu kỳ, mỗi vòng lấy trung bình hai mẫu liền nhau
 * và giảm biên độ nên âm cao tắt nhanh hơn âm thấp, nghe như dây thật. Trả về các mẫu âm thanh (đã chuẩn hóa) để phát bằng AudioBufferSource.
 */
export function karplusStrong(freq: number, sampleRate: number, seconds: number, rng: () => number = Math.random): Float32Array {
  const n = Math.max(2, Math.round(sampleRate / freq));
  const ring = new Float32Array(n);
  for (let i = 0; i < n; i++) ring[i] = rng() * 2 - 1;
  for (let i = 1; i < n; i++) ring[i] = 0.6 * ring[i] + 0.4 * ring[i - 1]; // làm mềm cú gảy ban đầu
  const len = Math.floor(sampleRate * seconds);
  const out = new Float32Array(len);
  let idx = 0;
  let peak = 0;
  for (let i = 0; i < len; i++) {
    const next = (idx + 1) % n;
    const v = ring[idx];
    out[i] = v;
    peak = Math.max(peak, Math.abs(v));
    ring[idx] = 0.5 * (v + ring[next]) * 0.9985;
    idx = next;
  }
  const fade = Math.floor(len * 0.08);
  for (let i = 0; i < len; i++) out[i] = (out[i] / (peak || 1)) * 0.9 * (i > len - fade ? (len - i) / fade : 1);
  return out;
}
