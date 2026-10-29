"use client";

import { useRef, useState } from "react";
import { AssessmentResultView } from "@/components/pronunciation/assessment-result-view";
import { usePronunciationAssess } from "@/components/pronunciation/use-pronunciation-assess";
import { Icon } from "@/components/ui/icon";
import { echoLine, echoTier } from "@/lib/pet/pet-echo";
import type { PetReviewWord } from "@/lib/pet/pet-review-word";
import { startMicRecording, type MicRecording } from "@/lib/practice/mic-recording";
import { toReferenceText } from "@/lib/pronunciation/assess-request-schema";
import { playChinese } from "@/lib/speech/play-chinese";

const ERROR_TEXT = {
  no_speech: "Chưa nghe thấy giọng nói. Đọc to hơn, gần micro hơn rồi thử lại.",
  rate_limited: "Hôm nay bạn đã dùng hết lượt chấm. Quay lại vào ngày mai nhé.",
  unavailable: "Dịch vụ chấm phát âm đang tạm không dùng được.",
  error: "Chưa chấm được, thử lại sau nhé.",
} as const;

/**
 * Pet đọc mẫu một từ cần ôn (giọng TTS), người dùng đọc lại, pet phản ứng theo điểm (cùng dịch vụ chấm của "Luyện phát âm", tính hạn mức `voice`).
 * Micro chỉ mở khi bấm; bị từ chối thì báo rõ và vẫn nghe mẫu được (đường lui). `onReact` gọi khi có điểm để pet nảy.
 */
export function PetEcho({ name, word, onReact, onClose }: { name: string; word: PetReviewWord; onReact: () => void; onClose: () => void }) {
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [said, setSaid] = useState<string | null>(null);
  const mic = useRef<MicRecording | null>(null);
  const { state, assess, reset } = usePronunciationAssess();
  const target = toReferenceText(word.term);

  async function toggle() {
    setMicError(null);
    if (!recording) {
      try { mic.current = await startMicRecording(); setRecording(true); setSaid(null); reset(); }
      catch (e) { setMicError((e as Error).name === "NotAllowedError" ? "Trình duyệt chưa cho dùng micro. Hãy cho phép micro rồi thử lại; bạn vẫn nghe mẫu được." : "Không mở được micro trên thiết bị này; bạn vẫn nghe mẫu được."); }
      return;
    }
    setRecording(false);
    await assess(await mic.current!.stop(), target);
  }

  // Khi có điểm: pet nảy và nói một lần (so sánh bằng chính kết quả trong state, không dùng effect).
  const resultKey = state.status === "ok" ? state.value : null;
  const [shownFor, setShownFor] = useState<unknown>(null);
  if (resultKey && shownFor !== resultKey) {
    setShownFor(resultKey);
    setSaid(echoLine(echoTier(resultKey.overall), name));
    onReact();
  }

  return (
    <div className="basis-full rounded-2xl bg-surface-container-low p-space-sm" role="group" aria-label={`Tập nói cùng ${name}`}>
      <div className="flex flex-wrap items-center gap-x-3">
        <span lang="zh" className="font-serif text-hanzi-display">{word.term}</span>
        {word.pinyin && <span className="text-pinyin-reading text-primary">{word.pinyin}</span>}
        <span className="text-body-md">{word.meaning}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => void playChinese(word.term)} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">
          <Icon name="volume_up" size={20} />{name} đọc mẫu
        </button>
        <button type="button" onClick={() => void toggle()} disabled={!target || state.status === "loading"}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-4 text-label-md font-bold disabled:opacity-60 ${recording ? "bg-error text-on-error" : "bg-primary-container"}`}>
          <Icon name={recording ? "stop" : "mic"} size={20} filled />
          {recording ? "Bấm để dừng và chấm" : state.status === "loading" ? "Đang chấm…" : "Bạn đọc lại"}
        </button>
      </div>
      {recording && <p role="status" className="mt-2 text-body-md text-on-surface-variant">{name} đang nghe, bạn đọc đi…</p>}
      {micError && <p role="alert" className="mt-2 text-body-md text-error">{micError}</p>}
      {state.status === "error" && <p role="alert" className="mt-2 text-body-md text-error">{ERROR_TEXT[state.reason]}</p>}
      {said && <p role="status" className="mt-2 text-body-md font-bold text-secondary">{said}</p>}
      {state.status === "ok" && <div className="mt-2"><AssessmentResultView result={state.value} /></div>}
      <button type="button" onClick={onClose} className="mt-2 min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">Xong</button>
    </div>
  );
}
