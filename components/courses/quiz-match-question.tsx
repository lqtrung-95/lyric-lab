"use client";

import { useState } from "react";
import type { QuizOption } from "@/lib/courses/build-unit-quiz";
import { playSfx } from "@/lib/feedback/sfx";
import { playChinese } from "@/lib/speech/play-chinese";
import type { QuizResult } from "./quiz-result";

/** Bản sao đã xáo (xáo một lần khi câu hiện ra để cột nghĩa không đổi chỗ giữa các lần vẽ). */
const shuffledCopy = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

/**
 * Ghép cặp: hai cột (chữ Hán và nghĩa), bấm một chữ rồi bấm nghĩa tương ứng. Ghép đúng thì khóa cặp; ghép sai thì rung và ghi nhớ từ đó là từ hay nhầm.
 * Xong khi ghép hết các cặp; tính đúng nếu không sai lần nào.
 */
export function QuizMatchQuestion({ pairs, onDone }: { pairs: QuizOption[]; onDone: (r: QuizResult) => void }) {
  const [rightColumn] = useState(() => shuffledCopy(pairs));
  const [left, setLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);

  function pickLeft(term: string) {
    if (matched.includes(term)) return;
    setLeft(term);
    void playChinese(term);
  }
  function pickRight(term: string) {
    if (!left || matched.includes(term)) return;
    if (left === term) {
      playSfx("correct");
      const next = [...matched, term];
      setMatched(next);
      setLeft(null);
      if (next.length === pairs.length) onDone({ correct: mistakes.length === 0, right: pairs.map((p) => p.term).filter((t) => !mistakes.includes(t)), wrong: mistakes });
      return;
    }
    playSfx("wrong");
    setMistakes((m) => [...new Set([...m, left, term])]);
    setShake(term);
    setTimeout(() => setShake(null), 450);
    setLeft(null);
  }

  const cell = (state: string) => `min-h-14 rounded-xl border-2 px-3 text-center ${state}`;
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Ghép chữ Hán với nghĩa">
      <div className="flex flex-col gap-2">
        {pairs.map((p) => (
          <button key={p.term} type="button" lang="zh-Hans" disabled={matched.includes(p.term)} onClick={() => pickLeft(p.term)} aria-pressed={left === p.term}
            className={cell(`font-serif text-2xl ${matched.includes(p.term) ? "border-primary bg-primary-container text-on-primary-container opacity-60" : left === p.term ? "border-ink bg-primary-container" : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container"}`)}>
            {p.term}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {rightColumn.map((p) => (
          <button key={p.term} type="button" disabled={matched.includes(p.term)} onClick={() => pickRight(p.term)}
            className={cell(`text-body-md ${shake === p.term ? "anim-note-shake border-error bg-error-container text-on-error-container" : matched.includes(p.term) ? "border-primary bg-primary-container text-on-primary-container opacity-60" : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container"}`)}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="col-span-2 text-label-md text-on-surface-variant" role="status">{matched.length}/{pairs.length} cặp{mistakes.length ? ` · nhầm ${mistakes.length} từ` : ""}. Bấm chữ Hán rồi bấm nghĩa.</p>
    </div>
  );
}
