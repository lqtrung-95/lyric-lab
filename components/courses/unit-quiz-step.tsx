"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { buildUnitQuiz, gradeQuiz } from "@/lib/courses/build-unit-quiz";
import type { UnitWord } from "@/lib/courses/unit-types";
import { playChinese } from "@/lib/speech/play-chinese";

const PROMPTS = { meaning: "Từ này nghĩa là gì?", term: "Chọn chữ Hán đúng cho nghĩa này", listen: "Nghe và chọn chữ Hán đúng" } as const;

/** Bước 3: bài kiểm tra 10 câu (chữ→nghĩa, nghĩa→chữ, nghe→chữ) từ chính các từ của chặng; báo điểm khi xong. */
export function UnitQuizStep({ words, onFinish }: { words: UnitWord[]; onFinish: (percent: number, passed: boolean) => void }) {
  const questions = useMemo(() => buildUnitQuiz(words), [words]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[i];

  if (!q) return <p role="status" className="text-body-md text-on-surface-variant">Chặng này chưa đủ từ để kiểm tra.</p>;

  function choose(term: string) {
    if (picked !== null) return;
    setPicked(term);
    if (term === q.answer) setCorrect((c) => c + 1);
  }
  function next() {
    if (i + 1 >= questions.length) { const g = gradeQuiz(correct, questions.length); onFinish(g.percent, g.passed); return; }
    setI(i + 1);
    setPicked(null);
  }

  return (
    <div className="space-y-space-md">
      <p className="text-body-md text-on-surface-variant" aria-live="polite">Câu {i + 1}/{questions.length} · đúng {correct}</p>
      <p className="text-body-lg font-medium">{PROMPTS[q.kind]}</p>
      {q.kind === "listen" ? (
        <button type="button" onClick={() => void playChinese(q.term)} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">
          <Icon name="volume_up" size={24} filled /> Nghe
        </button>
      ) : (
        <p lang={q.kind === "meaning" ? "zh-Hans" : undefined} className={q.kind === "meaning" ? "font-serif text-5xl" : "text-headline-md"}>{q.prompt}</p>
      )}
      <div role="group" aria-label="Các lựa chọn" className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const isAnswer = o.term === q.answer;
          const state = picked === null ? "" : isAnswer ? "border-primary bg-primary-container text-on-primary-container" : o.term === picked ? "border-error bg-error-container text-on-error-container" : "opacity-60";
          return (
            <button key={o.term} type="button" disabled={picked !== null} onClick={() => choose(o.term)} lang={q.kind === "meaning" ? undefined : "zh-Hans"}
              className={`min-h-14 rounded-xl border border-outline-variant px-3 text-left ${q.kind === "meaning" ? "text-body-lg" : "font-serif text-2xl"} ${state}`}>
              {o.label}{picked !== null && isAnswer && <span className="sr-only"> (đúng)</span>}{picked === o.term && !isAnswer && <span className="sr-only"> (chưa đúng)</span>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div role="status" className="space-y-space-sm">
          <p className="text-body-lg">{picked === q.answer ? "Chính xác!" : `Chưa đúng. Đáp án: ${words.find((w) => w.term === q.answer)?.term} (${words.find((w) => w.term === q.answer)?.pinyin}).`}</p>
          <button type="button" onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-outline-variant px-5 text-label-md font-medium hover:bg-surface-container">
            {i + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp"} <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
