"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { blobToMono } from "@/lib/pronunciation/decode-recording";
import { analyzeSyllable } from "@/lib/pronunciation/pitch";
import { TONES, TONE_PRACTICE, type ToneId } from "@/lib/pronunciation/tone-data";
import { toneFeedback, type ToneFeedback } from "@/lib/pronunciation/tone-feedback";
import { startMicRecording, type MicRecording } from "@/lib/practice/mic-recording";
import { playChinese } from "@/lib/speech/play-chinese";
import { ToneContourChart } from "./tone-contour-chart";

const TONE_IDS: ToneId[] = [1, 2, 3, 4];
const VERDICT_STYLE: Record<ToneFeedback["verdict"], string> = {
  match: "bg-primary-container text-on-primary-container",
  close: "bg-tertiary-container text-on-tertiary-container",
  miss: "bg-error-container text-on-error-container",
  unclear: "bg-surface-container text-on-surface-variant",
};

/** Luyện thanh điệu: nghe mẫu, ghi âm, phân tích cao độ ngay trên máy (không gửi âm thanh đi đâu) rồi so đường cao độ với thanh mẫu. */
export function ToneTrainer() {
  const [tone, setTone] = useState<ToneId>(1);
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ feedback: ToneFeedback; contour: number[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mic = useRef<MicRecording | null>(null);

  const info = TONES[tone - 1];
  const items = TONE_PRACTICE[tone];
  const item = items[index % items.length];

  function pick(t: ToneId) { setTone(t); setIndex(0); setResult(null); setError(null); }

  async function toggleRecord() {
    setError(null);
    if (!recording) {
      try { mic.current = await startMicRecording(); setRecording(true); setResult(null); }
      catch (e) { setError((e as Error).name === "NotAllowedError" ? "Trình duyệt chưa cho dùng micro. Hãy cho phép micro rồi thử lại." : "Không mở được micro trên thiết bị này."); }
      return;
    }
    setRecording(false);
    setBusy(true);
    try {
      const blob = await mic.current!.stop();
      const { samples, sampleRate } = await blobToMono(blob);
      const { contour, guess } = analyzeSyllable(samples, sampleRate);
      setResult({ feedback: toneFeedback(tone, guess), contour });
    } catch { setError("Chưa phân tích được bản ghi, thử đọc lại nhé."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-space-md">
      <div role="group" aria-label="Chọn thanh" className="grid grid-cols-4 gap-1 rounded-2xl bg-surface-container p-1">
        {TONE_IDS.map((t) => (
          <button key={t} type="button" aria-pressed={tone === t} onClick={() => pick(t)}
            className={`min-h-11 rounded-xl px-2 text-label-md font-medium ${tone === t ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            Thanh {t}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-space-md">
        <p className="text-body-md"><strong>{info.name}</strong> · {info.shape} (<span className="tabular-nums">{info.chao}</span>)</p>
        <p className="mt-1 text-body-md text-on-surface-variant">{info.vietnamese}</p>
        <div className="mt-space-md flex flex-wrap items-center gap-space-md">
          <div className="text-center">
            <div lang="zh-Hans" className="font-serif text-6xl leading-none">{item.han}</div>
            <div className="mt-1 text-body-lg text-primary">{item.pinyin}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void playChinese(item.han)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant px-4 text-label-md font-medium hover:bg-surface-container">
              <Icon name="volume_up" size={20} /> Nghe mẫu
            </button>
            <button type="button" onClick={() => { setIndex((i) => i + 1); setResult(null); setError(null); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant px-4 text-label-md font-medium hover:bg-surface-container">
              <Icon name="skip_next" size={20} /> Chữ khác
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-md">
        <button type="button" onClick={() => void toggleRecord()} disabled={busy}
          className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-label-md font-medium disabled:opacity-60 ${recording ? "bg-error text-on-error" : "bg-primary text-on-primary"}`}>
          <Icon name={recording ? "stop" : "mic"} size={22} filled />
          {recording ? "Bấm để dừng và chấm" : busy ? "Đang phân tích…" : "Ghi âm và đọc lại"}
        </button>
        {recording && <span role="status" className="text-body-md text-on-surface-variant">Đang nghe, hãy đọc to một lần…</span>}
      </div>
      {error && <p role="alert" className="text-body-md text-error">{error}</p>}
      {result ? (
        <div className="space-y-space-sm" data-testid="tone-result">
          <p role="status" className={`rounded-xl p-space-md text-body-md ${VERDICT_STYLE[result.feedback.verdict]}`}>{result.feedback.message}</p>
          <ToneContourChart tone={tone} contour={result.contour} />
          <p className="text-body-sm text-on-surface-variant">Nét đứt: đường cao độ mẫu. Nét liền: giọng của bạn. Hai đường được căn giữa nên so hình dạng, không so giọng cao hay thấp.</p>
        </div>
      ) : (
        <ToneContourChart tone={tone} />
      )}
    </div>
  );
}
