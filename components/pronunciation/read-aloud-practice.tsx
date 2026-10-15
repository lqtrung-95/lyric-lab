"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { READ_ALOUD_SENTENCES } from "@/lib/pronunciation/read-aloud-sentences";
import { toReferenceText, MAX_ASSESS_CHARS } from "@/lib/pronunciation/assess-request-schema";
import { startMicRecording, type MicRecording } from "@/lib/practice/mic-recording";
import { playChinese } from "@/lib/speech/play-chinese";
import { AssessmentResultView } from "./assessment-result-view";
import { usePronunciationAssess } from "./use-pronunciation-assess";

const ERROR_TEXT = {
  no_speech: "Chưa nghe thấy giọng nói. Hãy đọc to hơn, gần micro hơn rồi thử lại.",
  rate_limited: "Hôm nay bạn đã dùng hết lượt chấm. Quay lại vào ngày mai nhé.",
  unavailable: "Dịch vụ chấm phát âm đang tạm không dùng được.",
  error: "Chưa chấm được, thử lại sau nhé.",
} as const;

/** Luyện đọc to: chọn (hoặc tự nhập) một câu, nghe mẫu, ghi âm rồi nhận điểm từng chữ từ Azure Pronunciation Assessment. */
export function ReadAloudPractice() {
  const [index, setIndex] = useState(0);
  const [custom, setCustom] = useState("");
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const mic = useRef<MicRecording | null>(null);
  const { state, assess, reset } = usePronunciationAssess();

  const preset = READ_ALOUD_SENTENCES[index];
  const customText = toReferenceText(custom);
  const useCustom = custom.trim().length > 0;
  const target = useCustom ? customText : toReferenceText(preset.han);
  const canRecord = target.length > 0 && target.length <= MAX_ASSESS_CHARS;

  async function toggle() {
    setMicError(null);
    if (!recording) {
      try { mic.current = await startMicRecording(); setRecording(true); reset(); }
      catch (e) { setMicError((e as Error).name === "NotAllowedError" ? "Trình duyệt chưa cho dùng micro. Hãy cho phép micro rồi thử lại." : "Không mở được micro trên thiết bị này."); }
      return;
    }
    setRecording(false);
    void assess(await mic.current!.stop(), target);
  }

  return (
    <div className="space-y-space-md">
      <div>
        <label htmlFor="sentence" className="text-label-md font-medium">Chọn câu để đọc</label>
        <select id="sentence" value={index} disabled={useCustom} onChange={(e) => { setIndex(Number(e.target.value)); reset(); }}
          className="mt-1 min-h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-body-md disabled:opacity-50">
          {READ_ALOUD_SENTENCES.map((s, i) => <option key={s.han} value={i}>{s.han} — {s.meaning}</option>)}
        </select>
        <label htmlFor="custom" className="mt-space-sm block text-label-md font-medium">Hoặc tự nhập câu (tối đa {MAX_ASSESS_CHARS} chữ Hán)</label>
        <input id="custom" lang="zh-Hans" value={custom} onChange={(e) => { setCustom(e.target.value); reset(); }} placeholder="例如：我爱学中文"
          className="mt-1 min-h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-body-md" />
        {useCustom && customText.length === 0 && <p role="alert" className="mt-1 text-body-sm text-error">Hãy nhập ít nhất một chữ Hán.</p>}
        {customText.length > MAX_ASSESS_CHARS && <p role="alert" className="mt-1 text-body-sm text-error">Câu dài quá {MAX_ASSESS_CHARS} chữ, hãy rút ngắn.</p>}
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-space-md">
        <p lang="zh-Hans" className="font-serif text-3xl leading-snug">{useCustom ? customText || "…" : preset.han}</p>
        {!useCustom && <p className="mt-1 text-body-md text-primary">{preset.pinyin}</p>}
        <button type="button" disabled={!canRecord} onClick={() => void playChinese(target)} className="mt-space-sm inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant px-4 text-label-md font-medium hover:bg-surface-container disabled:opacity-50">
          <Icon name="volume_up" size={20} /> Nghe mẫu
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-space-md">
        <button type="button" onClick={() => void toggle()} disabled={!canRecord || state.status === "loading"}
          className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-label-md font-medium disabled:opacity-60 ${recording ? "bg-error text-on-error" : "bg-primary text-on-primary"}`}>
          <Icon name={recording ? "stop" : "mic"} size={22} filled />
          {recording ? "Bấm để dừng và chấm" : state.status === "loading" ? "Đang chấm…" : "Ghi âm và chấm điểm"}
        </button>
        {recording && <span role="status" className="text-body-md text-on-surface-variant">Đang nghe, hãy đọc cả câu…</span>}
      </div>
      {micError && <p role="alert" className="text-body-md text-error">{micError}</p>}
      {state.status === "error" && <p role="alert" className="text-body-md text-error">{ERROR_TEXT[state.reason]}</p>}
      {state.status === "ok" && <AssessmentResultView result={state.value} />}
    </div>
  );
}
