"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { buildChoices, buildCloze } from "@/lib/practice/cloze";
import type { KaraokeStep } from "@/lib/practice/karaoke-plan";
import type { PracticeOutcome } from "@/lib/practice/practice-grade";
import { answerPoints } from "@/lib/practice/scoring";
import type { ReviewCard } from "@/lib/user-data/review-repo";
import { ClozeLine } from "./cloze-line";
import { PracticeSummary } from "./practice-summary";

type Phase = "idle" | "approach" | "asking" | "answered";

interface Props {
  videoId: string;
  title: string;
  steps: KaraokeStep<ReviewCard>[];
  poolTerms: string[];
  /** Chạy liên tục: không tạm dừng ở chỗ trống, chưa trả lời kịp trước khi hết câu là hụt. */
  live: boolean;
  grade: (card: ReviewCard, outcome: PracticeOutcome) => boolean;
  onExit: () => void;
  onRoundEnd?: (result: { points: number; correct: number; total: number; durationSec: number }) => void;
}

/**
 * Karaoke điền lời: video YouTube chạy tới trước mỗi câu có từ đã lưu, chỗ trống hiện ra và chọn 1 trong 4 từ (phím 1–4).
 * Mặc định tạm dừng chờ trả lời rồi cho hát tiếp hết câu; chế độ chạy liên tục thì phải trả lời trước khi câu hát qua.
 * Chỉ hiện những câu có thẻ của người dùng, không hiện cả bài.
 */
export function KaraokeGame({ videoId, title, steps, poolTerms, live, grade, onExit, onRoundEnd }: Props) {
  const { containerRef, controller, failed } = useYouTubePlayer(videoId);
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [scheduled, setScheduled] = useState(0);
  const [missed, setMissed] = useState<ReviewCard[]>([]);
  const [done, setDone] = useState(false);
  const startedAt = useRef(0);

  const step = steps[index];
  const choices = useMemo(() => (step ? buildChoices(step.card.term, poolTerms, step.line.text) : []), [step, poolTerms]);
  const cloze = step ? buildCloze(step.card.term, step.line.text) : null;

  function beginStep(i: number) {
    setIndex(i);
    setPicked(null);
    setPhase("approach");
    controller?.seekTo(steps[i].seekTo);
    controller?.play();
  }

  function settle(term: string | null) {
    if (!step || phase !== "asking") return;
    const ok = term === step.card.term;
    if (grade(step.card, ok ? "correct" : "wrong")) setScheduled((n) => n + 1);
    setScore((s) => s + answerPoints(ok ? "correct" : "wrong", combo));
    setCombo(ok ? combo + 1 : 0);
    if (ok) setCorrect((n) => n + 1);
    else setMissed((m) => [...m, step.card]);
    setPicked(term ?? "");
    setPhase("answered");
    if (!live) controller?.play(); // đã trả lời: cho bài hát chạy tiếp hết câu
  }

  // Theo dõi thời gian video (100 ms): tới mốc thì hiện ô trống (và tạm dừng nếu không chạy liên tục); chạy liên tục thì hết câu là hụt.
  useEffect(() => {
    if (!controller || !step) return;
    if (phase !== "approach" && !(phase === "asking" && live)) return;
    const timer = setInterval(() => {
      const t = controller.getCurrentTime();
      if (phase === "approach" && t >= step.showAt) {
        setPhase("asking");
        if (!live) controller.pause();
      } else if (phase === "asking" && live && t >= step.endAt) {
        settle(null);
      }
    }, 100);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (phase !== "asking" || e.ctrlKey || e.metaKey || e.altKey || !(n >= 1 && n <= choices.length)) return;
      settle(choices[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function next() {
    if (index + 1 >= steps.length) {
      controller?.pause();
      setDone(true);
      onRoundEnd?.({ points: score, correct, total: steps.length, durationSec: Math.round((Date.now() - startedAt.current) / 1000) });
    } else beginStep(index + 1);
  }

  function restart() {
    setDone(false); setCorrect(0); setCombo(0); setScore(0); setScheduled(0); setMissed([]);
    startedAt.current = Date.now();
    beginStep(0);
  }

  if (done) {
    return (
      <PracticeSummary
        title={`Xong bài “${title}”`}
        stats={[{ label: "Điểm", value: String(score) }, { label: "Đúng", value: `${correct}/${steps.length}` }]}
        missed={missed.map((c) => ({ key: c.item_key, term: c.term, pinyin: c.pinyin, meaning: c.meaning }))}
        scheduled={scheduled}
        onAgain={restart}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-md text-on-surface-variant">
        <p className="min-w-0 truncate"><strong className="text-on-surface">{title}</strong></p>
        <p aria-live="polite">{phase !== "idle" && <>Câu <strong className="text-on-surface">{index + 1}</strong> / {steps.length} · </>}Điểm <strong className="text-primary">{score}</strong></p>
      </div>
      {/* Video luôn hiển thị (YouTube yêu cầu player nhìn thấy được). */}
      <div ref={containerRef} className="mx-auto mt-space-sm aspect-video w-full max-w-xl overflow-hidden rounded-2xl bg-inverse-surface [&_iframe]:h-full [&_iframe]:w-full" />
      {failed && <p role="alert" className="mt-2 text-label-md text-error">Không phát được video này (có thể chủ video tắt nhúng).</p>}

      {phase === "idle" && (
        <div className="mt-space-md text-center">
          <button type="button" disabled={!controller} onClick={() => { startedAt.current = Date.now(); beginStep(0); }}
            className="min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">{controller ? `Bắt đầu (${steps.length} câu)` : "Đang tải video…"}</button>
          <button type="button" onClick={onExit} className="ml-2 min-h-11 rounded-full px-5 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">Chọn bài khác</button>
        </div>
      )}
      {phase === "approach" && <p role="status" className="mt-space-md text-center text-body-md text-on-surface-variant">Nghe dẫn vào câu {index + 1}…</p>}

      {(phase === "asking" || phase === "answered") && step && cloze && (
        <div className="mt-space-md">
          <section aria-label="Câu hát cần điền" className="rounded-3xl bg-surface-container-low p-space-lg">
            <ClozeLine before={cloze.before} after={cloze.after} answer={step.card.term} reveal={phase === "asking" ? null : picked === step.card.term ? "correct" : "wrong"} />
            <p className="mt-2 text-body-md text-on-surface-variant">Gợi ý nghĩa của từ cần điền: <strong className="text-on-surface">{step.card.meaning}</strong></p>
          </section>
          <div role="group" aria-label="Chọn từ điền vào chỗ trống" className="mt-space-md grid grid-cols-2 gap-space-sm">
            {choices.map((term, i) => {
              const state = phase === "asking" ? "" : term === step.card.term ? "ring-2 ring-secondary bg-secondary-container/60" : term === picked ? "ring-2 ring-error bg-error-container/50" : "opacity-60";
              return (
                <button key={term} type="button" disabled={phase !== "asking"} onClick={() => settle(term)}
                  className={`flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest px-3 shadow-sm hover:bg-surface-container disabled:cursor-default ${state}`}>
                  <kbd aria-hidden="true" className="rounded bg-surface-container-high px-1.5 font-mono text-[10px]">{i + 1}</kbd>
                  <span lang="zh" className="font-serif text-headline-md">{term}</span>
                  {phase === "answered" && term === step.card.term && <span className="sr-only"> (đáp án đúng)</span>}
                </button>
              );
            })}
          </div>
          {phase === "answered" && (
            <div role="status" className="sticky bottom-3 z-10 mt-space-md rounded-2xl bg-surface-container-low p-space-md shadow-lg ring-1 ring-outline-variant">
              <p className="text-body-lg font-semibold text-on-surface">{picked === step.card.term ? "Chính xác!" : picked === "" ? "Hụt rồi, câu hát đã qua." : "Chưa đúng."}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-body-md text-on-surface-variant">
                <span lang="zh" className="font-serif text-headline-md text-on-surface">{step.card.term}</span>
                {step.card.pinyin && <span className="text-pinyin-reading text-primary">{step.card.pinyin}</span>}
                <PronounceButton text={step.card.term} />
              </p>
              <button type="button" onClick={next} className="mt-space-sm min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">{index + 1 >= steps.length ? "Xem kết quả" : "Câu tiếp theo"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
