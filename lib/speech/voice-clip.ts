/**
 * Đoạn thoại ngắn (vài giây) gửi qua kênh Realtime giữa hai người chơi chung: mã hóa base64 để nằm trong tin nhắn, không lưu trữ gì lên server.
 * Một đoạn Opus 5 giây ở 24 kbps chỉ khoảng 15 KB; trần kích thước chặn tin quá to hoặc không phải âm thanh.
 */
export interface VoiceClip { mime: string; b64: string }

export const MAX_CLIP_MS = 6000;
export const MAX_CLIP_B64 = 90_000;
const MIME = /^audio\/(webm|ogg|mp4)(;[a-z0-9=.,; -]{0,40})?$/i;
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Kiểm tra một đoạn nhận được: đúng loại âm thanh, đúng base64 và không quá lớn. */
export function parseClip(v: unknown): VoiceClip | null {
  const d = v as { mime?: unknown; b64?: unknown } | null;
  if (!d || typeof d.mime !== "string" || typeof d.b64 !== "string") return null;
  return MIME.test(d.mime) && d.b64.length > 0 && d.b64.length <= MAX_CLIP_B64 && B64.test(d.b64) ? { mime: d.mime, b64: d.b64 } : null;
}
