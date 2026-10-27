"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { QuizQuestion } from "@/lib/tools/everyday/everyday-types";

/** Quiz trắc nghiệm ngắn: chọn một đáp án thì hiện đúng sai kèm lời giải, rồi sang câu kế; cuối cùng có điểm và nút làm lại. */
export function MiniQuiz({ title, questions }: { title: string; questions: readonly QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = index >= questions.length;
  const q = done ? null : questions[index];

  function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  }
  function next() { setPicked(null); setIndex((i) => i + 1); }
  function restart() { setIndex(0); setPicked(null); setScore(0); }

  return (
    <section aria-labelledby="quiz-heading" className="card-ink space-y-space-sm p-space-md">
      <h2 id="quiz-heading" className="font-serif text-headline-md">{title}</h2>
      {q ? (
        <div className="space-y-3">
          <p className="text-label-md text-on-surface-variant">Câu {index + 1}/{questions.length}</p>
          <p className="flex items-center gap-2 text-body-lg font-medium text-on-surface">{q.prompt}{q.zh && <PronounceButton text={q.zh} className="size-9" />}</p>
          <div role="group" aria-label="Đáp án" className="grid gap-2">
            {q.options.map((o, i) => {
              const state = picked === null ? "idle" : i === q.answer ? "right" : i === picked ? "wrong" : "idle";
              const cls = state === "right" ? "border-primary bg-primary-container text-on-primary-container" : state === "wrong" ? "border-error bg-error-container text-on-error-container" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high";
              return (
                <button key={o} type="button" lang="zh" disabled={picked !== null && state === "idle"} onClick={() => choose(i)} aria-pressed={picked === i}
                  className={`min-h-12 rounded-xl border-2 px-4 py-2 text-left text-body-lg font-medium transition-colors ${cls}`}>{o}</button>
              );
            })}
          </div>
          {picked !== null && (
            <div role="status" className="space-y-2">
              <p className={`text-body-md font-medium ${picked === q.answer ? "text-primary" : "text-error"}`}>{picked === q.answer ? "Đúng rồi!" : "Chưa đúng."}</p>
              <p className="text-body-md text-on-surface-variant">{q.explain}</p>
              <button type="button" onClick={next} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110">{index + 1 < questions.length ? "Câu tiếp" : "Xem kết quả"}</button>
            </div>
          )}
        </div>
      ) : (
        <div role="status" className="space-y-3">
          <p className="text-headline-md font-bold text-on-surface">{score}/{questions.length} câu đúng</p>
          <p className="text-body-md text-on-surface-variant">{score === questions.length ? "Tuyệt vời, bạn nhớ hết rồi!" : score >= questions.length * 0.6 ? "Khá lắm! Xem lại phần giải thích những câu sai rồi thử lần nữa nhé." : "Hãy nghe lại các từ ở trên rồi làm lại, lần sau sẽ tốt hơn."}</p>
          <button type="button" onClick={restart} className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-6 text-label-md font-semibold text-primary hover:bg-surface-container-high">Làm lại</button>
        </div>
      )}
    </section>
  );
}
