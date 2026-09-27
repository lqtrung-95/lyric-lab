"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { buildChoices } from "@/lib/practice/cloze";
import { buildMeaningChoices } from "@/lib/practice/meaning-choices";
import { pickPracticeCards } from "@/lib/practice/pick-practice-cards";
import type { PracticeOutcome } from "@/lib/practice/practice-grade";
import { answerPoints } from "@/lib/practice/scoring";
import { playChinese } from "@/lib/speech/play-chinese";
import type { ReviewCard } from "@/lib/user-data/review-repo";
import { PracticeSummary } from "./practice-summary";

const ROUND = 10;
type AnswerKind = "hanzi" | "meaning";

interface Props {
  cards: ReviewCard[];
  grade: (card: ReviewCard, outcome: PracticeOutcome) => boolean;
  /** Gọi khi kết thúc lượt để ghi điểm (bảng xếp hạng). */
  onRoundEnd?: (result: { points: number; correct: number; total: number; durationSec: number }) => void;
}

/** Nghe và chọn: nghe giọng đọc của một từ rồi chọn chữ Hán (hoặc nghĩa) đúng. Phím 1–4 để chọn, R để nghe lại. */
export function ListenGame({ cards, grade, onRoundEnd }: Props) {
  const [round, setRound] = useState(0);
  const [kind, setKind] = useState<AnswerKind>("hanzi");
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [scheduled, setScheduled] = useState(0);
  const [missed, setMissed] = useState<ReviewCard[]>([]);
  const startedAt = useRef(0);
  const nextRef = useRef<HTMLButtonElement>(null);

  const deck = useMemo(() => pickPracticeCards(cards, ROUND, new Date()), [cards, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const questions = useMemo(() => deck.map((card) => ({
    card,
    hanzi: buildChoices(card.term, cards.map((c) => c.term), "").map((t) => ({ key: t, text: t })),
    meaning: buildMeaningChoices(card, cards),
  })), [deck, cards]);

  const q = questions[index];
  const choices = q ? (kind === "hanzi" ? q.hanzi : q.meaning) : [];
  const correctKey = kind === "hanzi" ? q?.card.term : q?.card.item_key;
  const finished = started && index >= questions.length;

  // Tự phát giọng đọc khi sang câu mới (sau khi người dùng đã bấm "Bắt đầu" nên trình duyệt cho phép phát tiếng).
  useEffect(() => { if (started && q) void playChinese(q.card.term); }, [started, q]);
  useEffect(() => { if (picked) nextRef.current?.focus(); }, [picked]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!started || !q || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() === "r") void playChinese(q.card.term);
      const n = Number(e.key);
      if (!picked && n >= 1 && n <= choices.length) choose(choices[n - 1].key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function choose(key: string) {
    if (!q || picked) return;
    const ok = key === correctKey;
    const points = answerPoints(ok ? "correct" : "wrong", combo);
    if (grade(q.card, ok ? "correct" : "wrong")) setScheduled((n) => n + 1);
    setScore((s) => s + points);
    setCombo(ok ? combo + 1 : 0);
    if (ok) setCorrect((n) => n + 1);
    else setMissed((m) => [...m, q.card]);
    setPicked(key);
  }

  function next() {
    const last = index + 1 >= questions.length;
    setPicked(null);
    setIndex((i) => i + 1);
    if (last) onRoundEnd?.({ points: score, correct, total: questions.length, durationSec: Math.round((Date.now() - startedAt.current) / 1000) });
  }

  function restart() {
    setRound((r) => r + 1); setStarted(false); setIndex(0); setPicked(null); setCorrect(0); setCombo(0); setScore(0); setScheduled(0); setMissed([]);
  }

  if (!started) {
    return (
      <div className="rounded-3xl bg-surface-container-low p-space-lg text-center">
        <fieldset className="flex flex-wrap items-center justify-center gap-space-sm">
          <legend className="sr-only">Chọn loại đáp án</legend>
          {(["hanzi", "meaning"] as const).map((k) => (
            <label key={k} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-label-md font-medium ${kind === k ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              {k === "hanzi" ? "Chọn chữ Hán" : "Chọn nghĩa"}
            </label>
          ))}
        </fieldset>
        <button type="button" onClick={() => { startedAt.current = Date.now(); setStarted(true); }}
          className="mt-space-md inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container">
          <Icon name="headphones" size={22} />Bắt đầu nghe ({questions.length} câu)
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <PracticeSummary
        title="Xong lượt nghe và chọn"
        stats={[{ label: "Điểm", value: String(score) }, { label: "Đúng", value: `${correct}/${questions.length}` }]}
        missed={missed.map((c) => ({ key: c.item_key, term: c.term, pinyin: c.pinyin, meaning: c.meaning }))}
        scheduled={scheduled}
        onAgain={restart}
      />
    );
  }

  return (
    <div>
      <p className="flex justify-between text-label-md text-on-surface-variant"><span>Câu <strong className="text-on-surface">{index + 1}</strong> / {questions.length}</span><span aria-live="polite">Điểm <strong className="text-primary">{score}</strong></span></p>
      <div className="mt-space-sm flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low p-space-lg">
        <button type="button" onClick={() => void playChinese(q.card.term)} aria-label="Nghe lại từ (phím R)"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-md transition-transform hover:bg-primary hover:text-on-primary active:scale-95">
          <Icon name="volume_up" size={36} />
        </button>
        <p className="text-label-md text-on-surface-variant">{kind === "hanzi" ? "Nghe rồi chọn chữ Hán đúng" : "Nghe rồi chọn nghĩa đúng"}</p>
      </div>

      <div role="group" aria-label="Các đáp án" className="mt-space-md grid grid-cols-2 gap-space-sm">
        {choices.map((c, i) => {
          const isAnswer = c.key === correctKey;
          const state = !picked ? "" : isAnswer ? "ring-2 ring-secondary bg-secondary-container/60" : c.key === picked ? "ring-2 ring-error bg-error-container/50" : "opacity-60";
          return (
            <button key={c.key} type="button" disabled={!!picked} onClick={() => choose(c.key)}
              className={`flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest px-3 py-2 text-center text-on-surface shadow-sm hover:bg-surface-container disabled:cursor-default ${state}`}>
              <kbd aria-hidden="true" className="rounded bg-surface-container-high px-1.5 font-mono text-[10px]">{i + 1}</kbd>
              <span lang={kind === "hanzi" ? "zh" : undefined} className={kind === "hanzi" ? "font-serif text-headline-md" : "line-clamp-2 text-body-md font-medium"}>{c.text}</span>
              {picked && isAnswer && <span className="sr-only"> (đáp án đúng)</span>}
            </button>
          );
        })}
      </div>

      {picked && (
        <div role="status" className="sticky bottom-3 z-10 mt-space-md rounded-2xl bg-surface-container-low p-space-md shadow-lg ring-1 ring-outline-variant">
          <p className="text-body-lg font-semibold text-on-surface">{picked === correctKey ? "Chính xác!" : "Chưa đúng."}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 text-body-md text-on-surface-variant">
            <span lang="zh" className="font-serif text-headline-md text-on-surface">{q.card.term}</span>
            {q.card.pinyin && <span className="text-pinyin-reading text-primary">{q.card.pinyin}</span>}
            <span>{q.card.meaning}</span>
          </p>
          <button ref={nextRef} type="button" onClick={next} className="mt-space-sm min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">{index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}</button>
        </div>
      )}
    </div>
  );
}
