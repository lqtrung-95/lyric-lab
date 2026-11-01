"use client";

import { useEffect, useRef, useState } from "react";
import { AssessmentResultView } from "@/components/pronunciation/assessment-result-view";
import { usePronunciationAssess } from "@/components/pronunciation/use-pronunciation-assess";
import { SpeakBox } from "@/components/speaking/speak-box";
import { useSpeakTurn } from "@/components/speaking/use-speak-turn";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { QuizQuestion } from "@/lib/courses/build-unit-quiz";
import { judgeRecall, SPEAK_PASS_SCORE } from "@/lib/courses/speaking-judge";
import { playSfx } from "@/lib/feedback/sfx";
import { startMicRecording, type MicRecording } from "@/lib/practice/mic-recording";
import { toReferenceText } from "@/lib/pronunciation/assess-request-schema";
import type { QuizResult } from "./quiz-result";

const ERROR_TEXT = {
  no_speech: "Chưa nghe thấy giọng nói. Đọc to hơn, gần micro hơn rồi thử lại.",
  rate_limited: "Hôm nay bạn đã dùng hết lượt chấm. Bạn có thể bỏ qua câu này.",
  unavailable: "Dịch vụ chấm phát âm đang tạm không dùng được. Bạn có thể bỏ qua câu này.",
  error: "Chưa chấm được, thử lại hoặc bỏ qua câu này.",
} as const;

const SKIPPED: QuizResult = { correct: false, right: [], wrong: [], skipped: true };

function SkipButton({ onSkip }: { onSkip: () => void }) {
  return <button type="button" onClick={onSkip} className="min-h-11 px-3 text-label-md font-semibold text-on-surface-variant underline">Không nói được lúc này, bỏ qua câu này</button>;
}

/**
 * Câu nói của cấp "Nói": đọc to một từ, nhại một câu thật (chấm từng chữ bằng dịch vụ chấm phát âm) hoặc nhìn nghĩa rồi nói từ (nhận diện giọng, có ô gõ thay thế). Câu nào cũng bỏ qua được,
 * và bỏ qua không bị tính sai. Micro chỉ mở khi người học bấm.
 */
export function QuizSpeakQuestion({ q, onDone }: { q: QuizQuestion; onDone: (r: QuizResult) => void }) {
  return q.kind === "recall" ? <RecallSpeak q={q} onDone={onDone} /> : <AssessSpeak q={q} onDone={onDone} />;
}

function AssessSpeak({ q, onDone }: { q: QuizQuestion; onDone: (r: QuizResult) => void }) {
  const target = q.kind === "shadow" ? q.prompt : q.term;
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [graded, setGraded] = useState(false);
  const mic = useRef<MicRecording | null>(null);
  const reported = useRef(false);
  const { state, assess, reset } = usePronunciationAssess();
  const reference = toReferenceText(target);

  async function toggle() {
    setMicError(null);
    if (!recording) {
      try { mic.current = await startMicRecording(); setRecording(true); reset(); }
      catch (e) { setMicError((e as Error).name === "NotAllowedError" ? "Trình duyệt chưa cho dùng micro. Hãy cho phép micro rồi thử lại, hoặc bỏ qua câu này." : "Không mở được micro trên thiết bị này. Bạn có thể bỏ qua câu này."); }
      return;
    }
    setRecording(false);
    const blob = await mic.current!.stop();
    await assess(blob, reference);
    setGraded(true);
  }

  // Báo kết quả đúng MỘT lần (lần chấm đầu tiên); đọc lại sau đó chỉ để luyện, không đổi điểm.
  useEffect(() => {
    if (state.status !== "ok" || !graded || reported.current) return;
    reported.current = true;
    const ok = state.value.overall >= SPEAK_PASS_SCORE;
    playSfx(ok ? "correct" : "wrong");
    onDone({ correct: ok, right: ok ? [q.term] : [], wrong: ok ? [] : [q.term] });
  }, [state, graded, onDone, q.term]);
  const finished = graded && state.status === "ok";

  return (
    <div className="space-y-space-sm text-center">
      <p className="text-body-md text-on-surface-variant">{q.kind === "shadow" ? "Nghe rồi đọc theo cả câu" : "Đọc to từ này"}</p>
      <p lang="zh-Hans" className={`font-serif ${q.kind === "shadow" ? "text-3xl leading-snug" : "text-6xl"}`}>{target}</p>
      {q.hint && <p className="text-body-md text-on-surface-variant">{q.hint}</p>}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PronounceButton text={target} />
        <button type="button" onClick={() => void toggle()} disabled={!reference || state.status === "loading"}
          className={`inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ink px-5 text-label-lg font-bold disabled:opacity-60 ${recording ? "bg-error text-on-error" : "bg-primary text-on-primary"}`}>
          <Icon name={recording ? "stop" : "mic"} size={22} filled />
          {recording ? "Bấm để dừng và chấm" : state.status === "loading" ? "Đang chấm…" : state.status === "ok" ? "Đọc lại" : "Bấm để nói"}
        </button>
      </div>
      {recording && <p role="status" className="text-body-md text-on-surface-variant">Đang nghe, hãy đọc…</p>}
      {micError && <p role="alert" className="text-body-md text-error">{micError}</p>}
      {state.status === "error" && <p role="alert" className="text-body-md text-error">{ERROR_TEXT[state.reason]}</p>}
      {state.status === "ok" && <div className="text-left"><AssessmentResultView result={state.value} /></div>}
      {!finished && <SkipButton onSkip={() => onDone(SKIPPED)} />}
    </div>
  );
}

function RecallSpeak({ q, onDone }: { q: QuizQuestion; onDone: (r: QuizResult) => void }) {
  const [heard, setHeard] = useState<string | null>(null);
  const reported = useRef(false);

  function judge(text: string) {
    if (reported.current) return;
    reported.current = true;
    setHeard(text);
    const ok = judgeRecall(text, q.term);
    playSfx(ok ? "correct" : "wrong");
    onDone({ correct: ok, right: ok ? [q.term] : [], wrong: ok ? [] : [q.term] });
  }
  const turn = useSpeakTurn(8, (r) => judge(r.text));

  return (
    <div className="space-y-space-sm text-center">
      <p className="text-body-md text-on-surface-variant">Nói từ tiếng Trung có nghĩa này</p>
      <p className="text-headline-md font-extrabold">{q.prompt}</p>
      {heard === null && <SpeakBox phase={turn.phase} error={turn.error} typingOnly={false} onStart={() => { turn.clearError(); void turn.start(); }} onStop={() => void turn.stop()} onType={judge} startLabel="Bấm để nói" />}
      {heard !== null && <p role="status" className="text-body-md text-on-surface-variant">Nghe được: <span lang="zh-Hans" className="font-serif text-body-lg text-on-surface">{heard || "(không rõ)"}</span></p>}
      {heard === null && <SkipButton onSkip={() => onDone(SKIPPED)} />}
    </div>
  );
}
