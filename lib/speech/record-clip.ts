import { MAX_CLIP_B64, MAX_CLIP_MS, bytesToBase64, type VoiceClip } from "./voice-clip";

export interface ClipRecording {
  /** Dừng ghi và trả đoạn đã ghi (null nếu rỗng hoặc quá lớn). Gọi nhiều lần vẫn an toàn. */
  stop: () => Promise<VoiceClip | null>;
}

/**
 * Bắt đầu ghi một đoạn thoại ngắn từ micro (tự dừng sau `maxMs`). Ném lỗi nếu trình duyệt không hỗ trợ hoặc người dùng không cho dùng micro.
 * Dùng bitrate thấp để đoạn đủ nhỏ gửi qua kênh Realtime.
 */
export async function recordClip(maxMs: number = MAX_CLIP_MS): Promise<ClipRecording> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("unsupported");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream, { audioBitsPerSecond: 24_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const done = new Promise<VoiceClip | null>((resolve) => {
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      if (chunks.length === 0) return resolve(null);
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      const b64 = bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
      resolve(b64.length <= MAX_CLIP_B64 ? { mime: blob.type || "audio/webm", b64 } : null);
    };
  });
  const timer = setTimeout(() => { if (rec.state === "recording") rec.stop(); }, maxMs);
  rec.start();
  return { stop: () => { clearTimeout(timer); if (rec.state === "recording") rec.stop(); return done; } };
}
