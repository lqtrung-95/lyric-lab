// Ghi âm và nhận dạng giọng nói ngay trong trình duyệt (MediaRecorder, Web Speech API); không gửi gì lên máy chủ của ta.
// Nhận dạng giọng nói chỉ có ở Chrome/Edge (và Safari mới); nơi không có thì vẫn ghi âm để tự nghe lại.

export interface MicRecording {
  stop(): Promise<Blob>;
}

/** Mở micro và bắt đầu ghi. Ném lỗi của `getUserMedia` (tên lỗi `NotAllowedError` khi người dùng chưa cho phép). */
export async function startMicRecording(): Promise<MicRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(m));
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  recorder.start();
  return {
    stop: () => new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
      };
      recorder.stop();
    }),
  };
}

interface RecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

const ctorOf = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const recognitionSupported = () => ctorOf() !== null;

/** Nhận dạng tiếng Trung (zh-CN) liên tục; `onText` nhận toàn bộ chữ nghe được tới lúc này (cả phần tạm). Trả hàm dừng. */
export function startRecognition(onText: (text: string) => void): { stop(): void } {
  const Ctor = ctorOf();
  if (!Ctor) return { stop: () => undefined };
  const r = new Ctor();
  r.lang = "zh-CN";
  r.interimResults = true;
  r.continuous = true;
  r.maxAlternatives = 1;
  let finalText = "";
  r.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interim += t;
    }
    onText(finalText + interim);
  };
  r.onend = () => onText(finalText);
  r.onerror = () => undefined;
  r.start();
  return { stop: () => r.stop() };
}
