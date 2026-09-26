"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { shiftLines } from "@/lib/listen/lyric-offset";
import { buildChoices, buildCloze } from "@/lib/practice/cloze";
import { pickPracticeCards } from "@/lib/practice/pick-practice-cards";
import type { PracticeOutcome } from "@/lib/practice/practice-grade";
import { snippetRange } from "@/lib/preview/preview-format";
import type { ReviewCard } from "@/lib/user-data/review-repo";
import { useLyricOffset } from "@/lib/user-state/use-lyric-offset";
import type { ClozeCandidate } from "./cloze-questions";
import { ClozeLine } from "./cloze-line";
import { PracticeSummary } from "./practice-summary";

const ROUND = 8;

interface Props {
  candidates: ClozeCandidate[];
  /** Mọi từ của người dùng, làm nguồn đáp án nhiễu. */
  poolTerms: string[];
  grade: (card: ReviewCard, outcome: PracticeOutcome) => boolean;
}

/** Điền lời: câu hát bị đục lỗ đúng từ đã lưu, chọn 1 trong 4 từ (phím 1–4). Nghe lại được đúng câu hát đó. */
export function ClozeGame({ candidates, poolTerms, grade }: Props) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => {
    const byKey = new Map(candidates.map((c) => [c.card.item_key, c]));
    return pickPracticeCards(candidates.map((c) => c.card), ROUND, new Date()).map((card) => {
      const c = byKey.get(card.item_key)!;
      return { ...c, cloze: buildCloze(card.term, c.line.text)!, choices: buildChoices(card.term, poolTerms, c.line.text) };
    });
  }, [candidates, poolTerms, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [scheduled, setScheduled] = useState(0);
  const [missed, setMissed] = useState<ReviewCard[]>([]);
  const [snippet, setSnippet] = useState<SnippetRequest | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const q = questions[index];
  const { offset } = useLyricOffset(q?.videoId);
  const finished = index >= questions.length;

  useEffect(() => { if (picked) nextRef.current?.focus(); }, [picked]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (!q || picked || e.ctrlKey || e.metaKey || e.altKey || !(n >= 1 && n <= q.choices.length)) return;
      choose(q.choices[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function choose(term: string) {
    if (!q || picked) return;
    const ok = term === q.card.term;
    if (grade(q.card, ok ? "correct" : "wrong")) setScheduled((n) => n + 1);
    if (ok) setCorrect((n) => n + 1);
    else setMissed((m) => [...m, q.card]);
    setPicked(term);
  }

  function replay() {
    setSnippet((prev) => ({ nonce: (prev?.nonce ?? 0) + 1, label: q.card.term, ...snippetRange(shiftLines([q.line], offset)[0]) }));
  }

  if (finished) {
    return (
      <PracticeSummary
        title="Xong lượt điền lời"
        stats={[{ label: "Đúng", value: `${correct}/${questions.length}` }, { label: "Câu đã chơi", value: String(questions.length) }]}
        missed={missed.map((c) => ({ key: c.item_key, term: c.term, pinyin: c.pinyin, meaning: c.meaning }))}
        scheduled={scheduled}
        onAgain={() => { setRound((r) => r + 1); setIndex(0); setPicked(null); setCorrect(0); setScheduled(0); setMissed([]); setSnippet(null); }}
      />
    );
  }

  const answered = picked !== null;
  return (
    <div>
      <p className="text-label-md text-on-surface-variant">Câu <strong className="text-on-surface">{index + 1}</strong> / {questions.length}</p>
      <section aria-label="Câu hát cần điền" className="mt-space-sm rounded-3xl bg-surface-container-low p-space-lg">
        <ClozeLine before={q.cloze.before} after={q.cloze.after} answer={q.card.term} reveal={picked === null ? null : picked === q.card.term ? "correct" : "wrong"} />
        <p className="mt-2 text-body-md text-on-surface-variant">Gợi ý nghĩa của từ cần điền: <strong className="text-on-surface">{q.card.meaning}</strong></p>
        {answered && <p className="mt-1 text-label-md text-on-surface-variant">{q.line.pinyin}{q.line.translation ? ` · ${q.line.translation}` : ""}</p>}
        <button type="button" onClick={replay} className="mt-space-sm inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-high px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-highest">Nghe lại câu hát</button>
      </section>

      <div role="group" aria-label="Chọn từ điền vào chỗ trống" className="mt-space-md grid grid-cols-2 gap-space-sm">
        {q.choices.map((term, i) => {
          const isAnswer = term === q.card.term;
          const state = !answered ? "" : isAnswer ? "ring-2 ring-secondary bg-secondary-container/60" : term === picked ? "ring-2 ring-error bg-error-container/50" : "opacity-60";
          return (
            <button key={term} type="button" disabled={answered} onClick={() => choose(term)}
              className={`flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-surface-container-lowest px-3 text-on-surface shadow-sm hover:bg-surface-container disabled:cursor-default ${state}`}>
              <kbd aria-hidden="true" className="rounded bg-surface-container-high px-1.5 font-mono text-[10px]">{i + 1}</kbd>
              <span lang="zh" className="font-serif text-headline-md">{term}</span>
              {answered && isAnswer && <span className="sr-only"> (đáp án đúng)</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div role="status" className="mt-space-md rounded-2xl bg-surface-container-low p-space-md">
          <p className="text-body-lg font-semibold text-on-surface">{picked === q.card.term ? "Chính xác!" : "Chưa đúng."}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-body-md text-on-surface-variant">
            <span lang="zh" className="font-serif text-headline-md text-on-surface">{q.card.term}</span>
            {q.card.pinyin && <span className="text-pinyin-reading text-primary">{q.card.pinyin}</span>}
            {q.card.han_viet && <span className="text-hanviet-reading uppercase tracking-wider text-secondary">{q.card.han_viet}</span>}
            <PronounceButton text={q.card.term} />
          </p>
          <button ref={nextRef} type="button" onClick={() => { setPicked(null); setSnippet(null); setIndex((i) => i + 1); }}
            className="mt-space-sm min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">{index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}</button>
        </div>
      )}
      {snippet && <SnippetPlayer key={q.videoId} videoId={q.videoId} request={snippet} />}
    </div>
  );
}
