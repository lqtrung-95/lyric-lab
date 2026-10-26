"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { wordLabel, buildUnitQuiz, gradeQuiz, QUIZ_LENGTH, UNIT_QUIZ_KINDS, type QuizKind } from "@/lib/courses/build-unit-quiz";
import { QuizMatchQuestion } from "./quiz-match-question";
import { QuizOrderQuestion } from "./quiz-order-question";
import type { QuizResult } from "./quiz-result";
import { QuizTrueFalseQuestion } from "./quiz-true-false-question";
import { QuizTypeQuestion } from "./quiz-type-question";
import type { UnitWord } from "@/lib/courses/unit-types";
import { playSfx } from "@/lib/feedback/sfx";
import { playChinese } from "@/lib/speech/play-chinese";

const PROMPTS = {
  meaning: "Từ này nghĩa là gì?", term: "Chọn chữ Hán đúng cho nghĩa này", listen: "Nghe và chọn chữ Hán đúng",
  pinyin: "Chọn pinyin đúng cho từ này", cloze: "Điền từ còn thiếu vào câu",
  match: "Ghép mỗi chữ Hán với nghĩa của nó", order: "Sắp xếp các mảnh thành câu đúng", type: "Nghe và gõ pinyin của từ", tf: "Đúng hay sai?",
} as const satisfies Record<QuizKind, string>;
// Lựa chọn hiển thị bằng chữ Hán (font serif lớn) với các kiểu câu hỏi này; kiểu còn lại là chữ thường.
const HAN_OPTIONS: QuizKind[] = ["term", "listen", "cloze"];

/**
 * Bài kiểm tra của chặng: chặng học 10 câu xen kẽ trắc nghiệm (chữ→nghĩa, nghĩa→chữ, nghe→chữ) với ghép cặp, đúng/sai, sắp xếp câu và nghe gõ pinyin; chặng ôn thêm "chọn pinyin" và "điền chỗ trống từ câu thật" với 20 hoặc 40 câu.
 * Báo điểm và danh sách từ làm sai khi xong (để màn chặng tự thêm các từ đó vào bộ ôn).
 */
export function UnitQuizStep({ words, length = QUIZ_LENGTH, kinds = UNIT_QUIZ_KINDS, onFinish }: { words: UnitWord[]; length?: number; kinds?: QuizKind[]; onFinish: (percent: number, passed: boolean, wrongTerms: string[], rightTerms: string[]) => void }) {
  const questions = useMemo(() => buildUnitQuiz(words, Math.random, length, kinds), [words, length, kinds]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [right, setRight] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // Câu không phải trắc nghiệm báo kết quả qua đây (câu trắc nghiệm thì `picked`).
  const [answered, setAnswered] = useState<QuizResult | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[i];

  if (!q) return <p role="status" className="text-body-md text-on-surface-variant">Chặng này chưa đủ từ để kiểm tra.</p>;

  const isChoice = q.options.length > 0;
  const done = isChoice ? picked !== null : answered !== null;
  const wasCorrect = isChoice ? picked === q.answer : answered?.correct === true;

  function record(r: QuizResult) {
    if (r.correct) { setCorrect((c) => c + 1); setStreak((n) => n + 1); } else setStreak(0);
    setRight((cur) => [...new Set([...cur, ...r.right])]);
    setWrong((cur) => [...new Set([...cur, ...r.wrong])]);
  }
  function choose(term: string) {
    if (picked !== null) return;
    setPicked(term);
    playSfx(term === q.answer ? "correct" : "wrong");
    record({ correct: term === q.answer, right: term === q.answer ? [q.answer] : [], wrong: term === q.answer ? [] : [q.answer] });
  }
  function finishOther(r: QuizResult) {
    setAnswered(r);
    record(r);
  }
  function next() {
    if (i + 1 >= questions.length) { const g = gradeQuiz(correct, questions.length); onFinish(g.percent, g.passed, wrong, right); return; }
    setI(i + 1);
    setPicked(null);
    setAnswered(null);
  }

  return (
    <div className="space-y-space-md">
      <p className="flex flex-wrap items-center gap-x-3 text-body-md text-on-surface-variant" aria-live="polite">
        <span>Câu {i + 1}/{questions.length} · đúng {correct}</span>
        {streak >= 2 && <span key={streak} className="anim-note-pop rounded-full border-2 border-ink bg-primary-container px-2 text-label-md font-extrabold text-on-primary-container">🔥 {streak} câu liên tiếp</span>}
      </p>
      <p className="text-body-lg font-medium">{PROMPTS[q.kind]}</p>
      {q.kind === "match" && <QuizMatchQuestion key={i} pairs={q.pairs ?? []} onDone={finishOther} />}
      {q.kind === "order" && <QuizOrderQuestion key={i} q={q} onDone={finishOther} />}
      {q.kind === "tf" && <QuizTrueFalseQuestion key={i} q={q} onDone={finishOther} />}
      {q.kind === "type" && <QuizTypeQuestion key={i} word={words.find((w) => w.term === q.term)!} onDone={finishOther} />}
      {isChoice && (<>
      {q.kind === "listen" ? (
        <button type="button" onClick={() => void playChinese(q.term)} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">
          <Icon name="volume_up" size={24} filled /> Nghe
        </button>
      ) : q.kind === "cloze" ? (
        <div>
          <p lang="zh-Hans" className="font-serif text-3xl leading-snug">{q.prompt}</p>
          {q.hint && <p className="mt-1 text-body-md text-on-surface-variant">{q.hint}</p>}
        </div>
      ) : (
        <p lang={q.kind === "meaning" || q.kind === "pinyin" ? "zh-Hans" : undefined} className={q.kind === "meaning" || q.kind === "pinyin" ? "font-serif text-5xl" : "text-headline-md"}>{q.prompt}</p>
      )}
      <div role="group" aria-label="Các lựa chọn" className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const isAnswer = o.term === q.answer;
          const state = picked === null ? "" : isAnswer ? "border-primary bg-primary-container text-on-primary-container anim-note-pop" : o.term === picked ? "border-error bg-error-container text-on-error-container anim-note-shake" : "opacity-60";
          return (
            <button key={o.term} type="button" disabled={picked !== null} onClick={() => choose(o.term)} lang={HAN_OPTIONS.includes(q.kind) ? "zh-Hans" : undefined}
              className={`min-h-14 rounded-xl border border-outline-variant px-3 text-left ${HAN_OPTIONS.includes(q.kind) ? "font-serif text-2xl" : "text-body-lg"} ${state}`}>
              {o.label}{picked !== null && isAnswer && <span className="sr-only"> (đúng)</span>}{picked === o.term && !isAnswer && <span className="sr-only"> (chưa đúng)</span>}
            </button>
          );
        })}
      </div>
      </>)}
      {done && (
        <div role="status" className="space-y-space-sm">
          {isChoice && (wasCorrect ? <p className="text-body-lg font-bold">Chính xác!</p> : <AnswerCard word={words.find((w) => w.term === q.answer)} />)}
          {!isChoice && !wasCorrect && q.kind !== "order" && q.kind !== "type" && <AnswerCard word={words.find((w) => w.term === q.answer)} />}
          {!isChoice && wasCorrect && (q.kind === "match" || q.kind === "tf") && <p className="text-body-lg font-bold">Chính xác!</p>}
          <button type="button" onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-outline-variant px-5 text-label-md font-medium hover:bg-surface-container">
            {i + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp"} <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

/** Khi trả lời sai: hiện đúng từ cần nhớ (chữ, pinyin, nghĩa) và một câu thật chứa từ đó để gắn vào ngữ cảnh. */
function AnswerCard({ word }: { word: UnitWord | undefined }) {
  if (!word) return <p className="text-body-lg">Chưa đúng.</p>;
  const ex = word.examples.find((e) => e.text.includes(word.term));
  return (
    <div className="card-ink p-space-sm" data-testid="answer-card">
      <p className="text-body-lg font-bold">Chưa đúng. Đáp án là:</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
        <span lang="zh-Hans" className="font-serif text-3xl">{word.term}</span>
        <span className="text-body-md text-primary">{word.pinyin}</span>
        <span className="text-body-md">{wordLabel(word)}</span>
        <button type="button" onClick={() => void playChinese(word.term)} aria-label={`Nghe ${word.term}`} className="inline-flex size-11 items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name="volume_up" size={20} /></button>
      </p>
      {ex && <p className="mt-1 text-body-md text-on-surface-variant"><span lang="zh-Hans" className="font-serif text-on-surface">{ex.text}</span> — {ex.translation}</p>}
    </div>
  );
}
