import { base64ToBytes, type VoiceClip } from "@/lib/speech/voice-clip";

let current: HTMLAudioElement | null = null;

/** Phát một đoạn thoại nhận từ đồng đội (dựng blob tạm, thu hồi khi phát xong). */
export async function playVoiceClip(clip: VoiceClip): Promise<void> {
  current?.pause();
  const url = URL.createObjectURL(new Blob([base64ToBytes(clip.b64) as BlobPart], { type: clip.mime }));
  const audio = new Audio(url);
  current = audio;
  const release = () => URL.revokeObjectURL(url);
  audio.onended = release;
  audio.onerror = release;
  try { await audio.play(); } catch { release(); }
}
