// Phát hiện lúc người học bắt đầu và ngừng nói từ mức âm lượng (RMS) lấy mẫu đều đặn. Thuần tính toán để test được ngoài trình duyệt.
// "Thời gian phản xạ" = từ lúc bắt đầu ghi tới lúc bắt đầu nói; ngừng nói đủ lâu thì tự kết thúc lượt, không cần bấm.

export interface VadOptions {
  /** Mức RMS (0..1) từ đó coi là đang có tiếng nói. */
  threshold: number;
  /** Im lặng liên tục bao lâu (ms) sau khi đã nói thì kết thúc lượt. */
  endSilenceMs: number;
  /** Tổng thời gian có tiếng (ms) tối thiểu để được tính là đã nói (lọc tiếng động ngắn). */
  minSpeechMs: number;
}

export const DEFAULT_VAD: VadOptions = { threshold: 0.025, endSilenceMs: 1300, minSpeechMs: 350 };
/** Cho nói câu dài và có lúc ngừng suy nghĩ giữa chừng (trò chuyện tự do, nói chuyện với linh vật): chờ im lặng 3 giây mới tự dừng. */
export const CONVERSATION_VAD: VadOptions = { threshold: 0.025, endSilenceMs: 3000, minSpeechMs: 600 };

export type VadEvent = "none" | "onset" | "end";

export interface Vad {
  push(level: number, nowMs: number): VadEvent;
  /** Mili giây từ mẫu đầu tiên tới lúc bắt đầu nói; null nếu chưa nói. */
  readonly onsetMs: number | null;
}

/** RMS của một khung mẫu âm thanh (-1..1). */
export function rms(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

export function createVad(options: VadOptions = DEFAULT_VAD): Vad {
  let origin: number | null = null;
  let prev = 0;
  let onset: number | null = null;
  let lastVoice = 0;
  let voiceMs = 0;
  return {
    get onsetMs() { return onset; },
    push(level, nowMs) {
      if (origin === null) { origin = nowMs; prev = nowMs; }
      const dt = nowMs - prev;
      prev = nowMs;
      if (level >= options.threshold) {
        voiceMs += dt;
        lastVoice = nowMs;
        if (onset === null) { onset = nowMs - origin; return "onset"; }
        return "none";
      }
      if (onset !== null && voiceMs >= options.minSpeechMs && nowMs - lastVoice >= options.endSilenceMs) return "end";
      return "none";
    },
  };
}
