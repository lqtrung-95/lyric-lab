"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/courses/build-unit-quiz";
import { playSfx } from "@/lib/feedback/sfx";
import type { QuizResult } from "./quiz-result";

/** Đúng/sai nhanh: chữ Hán kèm một nghĩa (thật hoặc nghĩa của từ khác), bấm Đúng hoặc Sai. */
export function QuizTrueFalseQuestion({ q, onDone }: { q: QuizQuestion; onDone: (r: QuizResult) => void }) {
  const [picked, setPicked] = useState<boolean | null>(null);

  function pick(answer: boolean) {
    if (picked !== null) return;
    setPicked(answer);
    const ok = answer === q.truth;
    playSfx(ok ? "correct" : "wrong");
    onDone({ correct: ok, right: ok ? [q.term] : [], wrong: ok ? [] : [q.term] });
  }

  const btn = (value: boolean) => {
    const state = picked === null ? "border-ink bg-surface-container-lowest hover:bg-surface-container" : value === q.truth ? "border-primary bg-primary-container text-on-primary-container anim-note-pop" : picked === value ? "border-error bg-error-container text-on-error-container anim-note-shake" : "opacity-60";
    return `min-h-14 flex-1 rounded-xl border-2 px-3 text-body-lg font-bold ${state}`;
  };
  return (
    <div className="space-y-space-sm">
      <p className="text-body-lg"><span lang="zh-Hans" className="font-serif text-4xl">{q.prompt}</span> nghĩa là <b>“{q.shown}”</b>?</p>
      <div className="flex gap-2" role="group" aria-label="Đúng hay sai">
        <button type="button" disabled={picked !== null} onClick={() => pick(true)} className={btn(true)}>Đúng</button>
        <button type="button" disabled={picked !== null} onClick={() => pick(false)} className={btn(false)}>Sai</button>
      </div>
    </div>
  );
}
