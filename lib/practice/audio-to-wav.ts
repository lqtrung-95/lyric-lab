// Chuyển bản ghi âm của trình duyệt (WebM/Opus, MP4/AAC...) thành WAV 16 kHz mono 16-bit: định dạng Gemini nhận ổn định, nhỏ (~32 KB/giây) và
// cùng một kiểu trên mọi trình duyệt. Chạy hoàn toàn ở client; chỉ phần mã hóa WAV là thuần (test được ngoài trình duyệt).

export const WAV_SAMPLE_RATE = 16_000;
/** Cắt bớt bản ghi dài hơn mức này (giây): câu luyện nói ngắn, còn bản dài chỉ tốn hạn mức. */
export const MAX_FEEDBACK_SECONDS = 20;

/** Mã hóa mẫu âm thanh (-1..1) thành tệp WAV PCM 16-bit mono. */
export function encodeWav(samples: Float32Array, sampleRate = WAV_SAMPLE_RATE): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); };
  text(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); text(8, "WAVE");
  text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, "data"); view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return bytes;
}

/** base64 của dãy byte, cắt khúc để không tràn ngăn xếp khi `fromCharCode` nhận quá nhiều đối số. */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Giải mã bản ghi, hạ về mono 16 kHz (tối đa `MAX_FEEDBACK_SECONDS` giây đầu) và trả WAV dạng base64. Ném lỗi nếu trình duyệt không giải mã được. */
export async function blobToWavBase64(blob: Blob): Promise<string> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const seconds = Math.min(decoded.duration, MAX_FEEDBACK_SECONDS);
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(seconds * WAV_SAMPLE_RATE)), WAV_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return bytesToBase64(encodeWav(rendered.getChannelData(0)));
  } finally {
    void ctx.close();
  }
}
