import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { CLOUD_VOICE, readPreferredVoice, speakChinese } from "./speak-chinese";
import { splitForTts } from "./split-for-tts";

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

let playToken = 0;

async function playCloud(text: string, waitEnd: boolean): Promise<void> {
  const src = await fetchCloudAudio(text);
  current?.pause();
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  const audio = new Audio(src);
  current = audio;
  await audio.play();
  if (waitEnd) await new Promise<void>((resolve) => { audio.onended = () => resolve(); audio.onerror = () => resolve(); audio.onpause = () => resolve(); });
}

/**
 * Đọc chữ Hán: mặc định dùng giọng AI tự nhiên từ server (file đã lưu dùng chung); nếu người dùng chọn giọng hệ thống,
 * hoặc server lỗi/hết hạn mức/không phát được thì rơi về giọng hệ thống của trình duyệt để nút loa không bao giờ hỏng.
 * Câu dài hơn giới hạn của server được chia theo câu và đọc nối tiếp từng đoạn (mỗi đoạn có file giọng riêng); bấm đọc câu khác thì dừng phần còn lại.
 */
export async function playChinese(text: string): Promise<void> {
  const preferred = readPreferredVoice();
  if (preferred && preferred !== CLOUD_VOICE) return speakChinese(text);
  const token = ++playToken;
  const parts = splitForTts(text);
  try {
    for (let i = 0; i < parts.length; i++) {
      if (token !== playToken) return;
      await playCloud(parts[i], parts.length > 1);
    }
  } catch {
    if (token === playToken) speakChinese(text);
  }
}

/** Đang có giọng đọc tiếng Trung phát (file giọng AI hoặc giọng thiết bị)? Dùng để không phát hiệu ứng âm thanh đè lên giọng mẫu. */
export function isChineseAudioBusy(): boolean {
  const audioPlaying = !!current && !current.paused && !current.ended;
  const speaking = typeof window !== "undefined" && !!window.speechSynthesis && window.speechSynthesis.speaking;
  return audioPlaying || speaking;
}

/** Dừng mọi giọng đang đọc (cả file giọng AI lẫn giọng thiết bị) và hủy phần còn lại của lượt đọc nối tiếp. */
export function stopChinese(): void {
  playToken++;
  current?.pause();
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Đọc nối tiếp nhiều câu (cả bài) bằng giọng AI, mỗi câu xong mới sang câu sau và tải trước file của câu kế để không bị ngắt quãng.
 * `onLine(i)` báo câu đang đọc (-1 khi kết thúc hoặc bị dừng). Câu nào giọng AI lỗi thì rơi về giọng thiết bị cho riêng câu đó. `stopChinese()` để dừng.
 */
export async function playChineseSequence(lines: readonly string[], onLine: (index: number) => void): Promise<void> {
  const token = ++playToken;
  try {
    for (let i = 0; i < lines.length; i++) {
      if (token !== playToken) return;
      onLine(i);
      if (i + 1 < lines.length) for (const part of splitForTts(lines[i + 1])) void fetchCloudAudio(part).catch(() => undefined);
      try {
        for (const part of splitForTts(lines[i])) {
          if (token !== playToken) return;
          await playCloud(part, true);
        }
      } catch {
        if (token !== playToken) return;
        speakChinese(lines[i]);
        await sleep(Math.max(1500, lines[i].length * 330));
      }
    }
  } finally {
    onLine(-1); // luôn báo kết thúc (kể cả khi bị dừng); bên gọi tự bỏ qua báo cũ của lượt đã bị thay thế
  }
}
