// Ghi âm từ micro kèm phát hiện bắt đầu/ngừng nói (xem `vad.ts`). Chỉ chạy trong trình duyệt; không gửi gì đi, bên gọi quyết định.
import { createVad, DEFAULT_VAD, rms, type VadOptions } from "./vad";

export interface VadRecordingResult { blob: Blob; onsetMs: number | null; durationMs: number }
export interface VadRecording { stop(): Promise<VadRecordingResult> }
interface Options { maxMs: number; vad?: VadOptions; onVoiceEnd?: () => void; onLevel?: (level: number) => void }

const MIMES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

export const micSupported = (): boolean =>
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

/**
 * Mở micro và ghi. Khi người học nói rồi ngừng đủ lâu thì gọi `onVoiceEnd` (bên gọi sẽ `stop()`); hết `maxMs` cũng vậy.
 * Nếu trình duyệt không cho phân tích âm lượng (AudioContext bị treo) thì vẫn ghi bình thường, chỉ không tự dừng theo giọng và `onsetMs` là null.
 * Ném lỗi của `getUserMedia` (`NotAllowedError` khi chưa cấp quyền).
 */
export async function startVadRecording({ maxMs, vad: vadOptions = DEFAULT_VAD, onVoiceEnd, onLevel }: Options): Promise<VadRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mime = MIMES.find((m) => MediaRecorder.isTypeSupported?.(m));
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  let ctx: AudioContext | null = null;
  const vad = createVad(vadOptions);
  const startedAt = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;
  let ended = false;
  const finish = () => { if (!ended) { ended = true; onVoiceEnd?.(); } };
  try {
    if (Ctx) {
      ctx = new Ctx();
      void ctx.resume?.();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      timer = setInterval(() => {
        analyser.getFloatTimeDomainData(buf);
        const level = rms(buf);
        onLevel?.(level);
        const now = Date.now();
        if (vad.push(level, now) === "end" || now - startedAt >= maxMs) finish();
      }, 60);
    } else {
      timer = setInterval(() => { if (Date.now() - startedAt >= maxMs) finish(); }, 200);
    }
  } catch {
    timer = setInterval(() => { if (Date.now() - startedAt >= maxMs) finish(); }, 200);
  }
  recorder.start();

  return {
    stop: () => new Promise<VadRecordingResult>((resolve) => {
      if (timer) clearInterval(timer);
      const done = () => {
        stream.getTracks().forEach((t) => t.stop());
        void ctx?.close();
        resolve({ blob: new Blob(chunks, { type: recorder.mimeType || "audio/webm" }), onsetMs: vad.onsetMs, durationMs: Date.now() - startedAt });
      };
      if (recorder.state === "inactive") return done();
      recorder.onstop = done;
      recorder.stop();
    }),
  };
}

export type MicCheck = "ok" | "denied" | "unsupported";

/** Hỏi quyền micro ngay lúc người học bấm Bắt đầu (trong thao tác bấm, để Safari/iOS chịu hỏi) rồi tắt micro. */
export async function checkMic(): Promise<MicCheck> {
  if (!micSupported()) return "unsupported";
  try {
    (await navigator.mediaDevices.getUserMedia({ audio: true })).getTracks().forEach((t) => t.stop());
    return "ok";
  } catch (e) {
    return (e as { name?: string })?.name === "NotAllowedError" ? "denied" : "unsupported";
  }
}
