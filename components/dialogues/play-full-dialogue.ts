import { playChineseSequence, stopChinese } from "@/lib/speech/play-chinese";

export interface ReplayLine {
  zh: string;
  /** Bản ghi của người học cho câu này (blob URL); không có thì đọc bằng giọng mẫu. */
  recordingUrl?: string;
}

let run = 0;
let audio: HTMLAudioElement | null = null;

const playUrl = (url: string, rate: number, id: number) =>
  new Promise<void>((resolve) => {
    if (id !== run) return resolve();
    const a = new Audio(url);
    audio = a;
    a.playbackRate = rate;
    a.onended = a.onerror = a.onpause = () => resolve();
    a.play().catch(() => resolve());
  });

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Phát lại cả hội thoại theo thứ tự: câu của người học bằng bản ghi của họ, các câu còn lại bằng giọng mẫu.
 * `onLine(i)` báo câu đang phát (-1 khi xong hoặc bị dừng). Gọi `stopFullDialogue()` để dừng; lượt phát mới thay lượt cũ.
 */
export async function playFullDialogue(lines: readonly ReplayLine[], rate: number, onLine: (index: number) => void): Promise<void> {
  const id = ++run;
  stopChinese();
  try {
    for (let i = 0; i < lines.length; i++) {
      if (id !== run) return;
      onLine(i);
      const url = lines[i].recordingUrl;
      if (url) await playUrl(url, rate, id);
      else await playChineseSequence([lines[i].zh], () => undefined);
      if (id !== run) return;
      await sleep(350);
    }
  } finally {
    if (id === run) onLine(-1);
  }
}

export function stopFullDialogue(): void {
  run++;
  audio?.pause();
  stopChinese();
}
