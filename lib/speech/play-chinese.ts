import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { CLOUD_VOICE, readPreferredVoice, speakChinese } from "./speak-chinese";

const blobUrls = new Map<string, string>();
let current: HTMLAudioElement | null = null;

async function fetchCloudAudio(text: string): Promise<string> {
  const cached = blobUrls.get(text);
  if (cached) return cached;
  const url = `/api/tts?text=${encodeURIComponent(text)}`;
  let res = await fetch(url);
  if (res.status === 401) {
    // Từ chưa có file cần tổng hợp mới → cần phiên (ẩn danh cũng được) để tính hạn mức.
    if (await ensureAnonymousSession()) res = await fetch(url);
  }
  if (!res.ok) throw new Error(`tts ${res.status}`);
  const objectUrl = URL.createObjectURL(await res.blob());
  blobUrls.set(text, objectUrl);
  return objectUrl;
}

/**
 * Đọc chữ Hán: mặc định dùng giọng AI tự nhiên từ server (file đã lưu dùng chung); nếu người dùng chọn giọng hệ thống,
 * hoặc server lỗi/hết hạn mức/không phát được thì rơi về giọng hệ thống của trình duyệt để nút loa không bao giờ hỏng.
 */
export async function playChinese(text: string): Promise<void> {
  const preferred = readPreferredVoice();
  if (preferred && preferred !== CLOUD_VOICE) return speakChinese(text);
  try {
    const src = await fetchCloudAudio(text);
    current?.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    current = new Audio(src);
    await current.play();
  } catch {
    speakChinese(text);
  }
}
