"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { AssessmentResultView } from "@/components/pronunciation/assessment-result-view";
import { usePronunciationAssess } from "@/components/pronunciation/use-pronunciation-assess";
import { startMicRecording, type MicRecording } from "@/lib/practice/mic-recording";
import { toReferenceText } from "@/lib/pronunciation/assess-request-schema";

const ERROR_TEXT = {
  no_speech: "Chưa nghe thấy giọng nói. Đọc to hơn, gần micro hơn rồi thử lại.",
  rate_limited: "Hôm nay bạn đã dùng hết lượt chấm. Quay lại vào ngày mai nhé.",
  unavailable: "Dịch vụ chấm phát âm đang tạm không dùng được.",
  error: "Chưa chấm được, thử lại sau nhé.",
} as const;

/** Nút "Đọc to" cho một từ: ghi âm rồi nhận điểm từng chữ (cùng dịch vụ chấm của mục Luyện phát âm). Micro chỉ mở khi người học bấm. */
export function WordReadAloud({ term }: { term: string }) {
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const mic = useRef<MicRecording | null>(null);
  const { state, assess, reset } = usePronunciationAssess();
  const target = toReferenceText(term);

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
    <div className="space-y-space-sm">
      <button type="button" onClick={() => void toggle()} disabled={!target || state.status === "loading"}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-4 text-label-md font-bold disabled:opacity-60 ${recording ? "bg-error text-on-error" : "bg-surface-container-lowest text-on-surface"}`}>
        <Icon name={recording ? "stop" : "mic"} size={20} filled />
        {recording ? "Bấm để dừng và chấm" : state.status === "loading" ? "Đang chấm…" : "Đọc to"}
      </button>
      {recording && <p role="status" className="text-body-md text-on-surface-variant">Đang nghe, hãy đọc từ này…</p>}
      {micError && <p role="alert" className="text-body-md text-error">{micError}</p>}
      {state.status === "error" && <p role="alert" className="text-body-md text-error">{ERROR_TEXT[state.reason]}</p>}
      {state.status === "ok" && <AssessmentResultView result={state.value} />}
    </div>
  );
}
