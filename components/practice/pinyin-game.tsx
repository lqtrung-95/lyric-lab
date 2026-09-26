"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { checkPinyin, pinyinHint, type PinyinResult } from "@/lib/practice/pinyin-answer";
import { pickPracticeCards } from "@/lib/practice/pick-practice-cards";
import { outcomeFromPinyin, pinyinPoints, type PracticeOutcome } from "@/lib/practice/practice-grade";
import type { ReviewCard } from "@/lib/user-data/review-repo";
import { NoteStaff, type NoteState } from "./note-staff";
import { PracticeSummary } from "./practice-summary";

const ROUND = 10;
const LIVES = 3;

interface Props {
  cards: ReviewCard[];
  grade: (card: ReviewCard, outcome: PracticeOutcome) => boolean;
  /** Gọi khi kết thúc lượt để ghi điểm (bảng xếp hạng). */
  onRoundEnd?: (result: { points: number; correct: number; total: number; durationSec: number }) => void;
}

const FEEDBACK: Record<PinyinResult, string> = {
  exact: "Chính xác!",
  "no-tone": "Đúng âm, còn thiếu thanh điệu.",
  "wrong-tone": "Đúng âm nhưng sai thanh điệu.",
  wrong: "Chưa đúng.",
};
const noteState = (r: PinyinResult): NoteState => (r === "exact" ? "correct" : r === "wrong" ? "wrong" : "partial");

/** Gõ pinyin: mỗi từ là một nốt trượt vào khuông; gõ đúng để "vang" lên. Nhẹ nhàng mặc định, có chế độ thử thách 3 mạng. */
export function PinyinGame({ cards, grade, onRoundEnd }: Props) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => pickPracticeCards(cards, ROUND, new Date()), [cards, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [hints, setHints] = useState(0);
  const [feedback, setFeedback] = useState<{ result: PinyinResult; points: number } | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [scheduled, setScheduled] = useState(0);
  const [missed, setMissed] = useState<ReviewCard[]>([]);
  const [correct, setCorrect] = useState(0);
  const [challenge, setChallenge] = useState(false);
  const [hideMeaning, setHideMeaning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const startedAt = useRef(0);
  useEffect(() => { startedAt.current = Date.now(); }, [round]);

  const card = deck[index];
  const finished = index >= deck.length || (challenge && lives <= 0);

  useEffect(() => {
    if (feedback) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [feedback, index]);

  function submit(text: string) {
    if (!card || feedback) return;
    const result = checkPinyin(text, card.pinyin ?? "");
    const outcome = outcomeFromPinyin(result);
    const points = pinyinPoints(outcome, hints, combo);
    if (grade(card, outcome)) setScheduled((n) => n + 1);
    setScore((s) => s + points);
    if (outcome === "correct") {
      setCorrect((n) => n + 1);
      setCombo(combo + 1);
      setBest(Math.max(best, combo + 1));
    } else {
      setCombo(0);
      setMissed((m) => [...m, card]);
      if (outcome === "wrong" && challenge) setLives((l) => l - 1);
    }
    setFeedback({ result, points });
  }

  function next() {
    if (index + 1 >= deck.length || (challenge && lives <= 0)) {
      onRoundEnd?.({ points: score, correct, total: deck.length, durationSec: Math.round((Date.now() - startedAt.current) / 1000) });
    }
    setFeedback(null);
    setInput("");
    setHints(0);
    setIndex((i) => i + 1);
  }

  function restart() {
    setRound((r) => r + 1);
    setIndex(0); setInput(""); setHints(0); setFeedback(null); setScore(0); setCombo(0); setBest(0);
    setLives(LIVES); setScheduled(0); setMissed([]); setCorrect(0);
  }

  if (finished) {
    return (
      <PracticeSummary
        title={challenge && lives <= 0 ? "Hết mạng rồi, thử lại nhé" : "Xong lượt gõ pinyin"}
        stats={[{ label: "Điểm", value: String(score) }, { label: "Đúng", value: `${correct}/${deck.length}` }, { label: "Combo dài nhất", value: String(best) }, { label: "Từ đã chơi", value: String(Math.min(index, deck.length)) }]}
        missed={missed.map((c) => ({ key: c.item_key, term: c.term, pinyin: c.pinyin, meaning: c.meaning }))}
        scheduled={scheduled}
        onAgain={restart}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-md text-on-surface-variant">
        <p>Từ <strong className="text-on-surface">{index + 1}</strong> / {deck.length}</p>
        <p aria-live="polite">Điểm <strong className="text-primary">{score}</strong>{combo >= 2 && <> · Combo <strong className="text-secondary">×{combo}</strong></>}{challenge && <> · {"♥".repeat(Math.max(lives, 0))}<span className="sr-only"> {lives} mạng</span></>}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-label-md text-on-surface-variant">
        <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={challenge} onChange={(e) => setChallenge(e.target.checked)} className="h-5 w-5 accent-primary" />Thử thách (3 mạng)</label>
        <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={hideMeaning} onChange={(e) => setHideMeaning(e.target.checked)} className="h-5 w-5 accent-primary" />Ẩn nghĩa</label>
      </div>

      <div className="mt-space-sm">
        <NoteStaff term={card.term} state={feedback ? noteState(feedback.result) : "ask"} noteKey={`${round}-${card.item_key}`} />
      </div>
      <div className="mt-space-sm flex items-center justify-center gap-3 text-center">
        {!hideMeaning && <p className="text-body-lg font-medium text-on-surface">{card.meaning}</p>}
        <PronounceButton text={card.term} />
      </div>
      {hints > 0 && card.pinyin && <p className="mt-1 text-center text-label-md text-secondary">Gợi ý: {pinyinHint(card.pinyin, Math.min(hints, 3) as 1 | 2 | 3)}{hints >= 2 && card.han_viet ? ` · Hán Việt: ${card.han_viet}` : ""}</p>}

      <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="mt-space-md">
        <label htmlFor="pinyin-input" className="text-label-md font-medium text-on-surface">Gõ pinyin (ví dụ <span className="font-mono">ni3 hao3</span> hoặc <span lang="zh-Latn">nǐ hǎo</span>)</label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input ref={inputRef} id="pinyin-input" value={input} onChange={(e) => setInput(e.target.value)} disabled={!!feedback} autoComplete="off" autoCapitalize="off" spellCheck={false}
            className="min-h-12 min-w-0 flex-1 rounded-2xl bg-surface-container px-4 font-mono text-body-lg text-on-surface outline-none ring-2 ring-transparent focus:ring-secondary disabled:opacity-70" />
          <button type="submit" disabled={!!feedback || !input.trim()} className="min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">Kiểm tra</button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Thêm số thanh điệu">
          {[1, 2, 3, 4].map((t) => (
            <button key={t} type="button" disabled={!!feedback} onClick={() => { setInput((v) => v + t); inputRef.current?.focus(); }}
              className="min-h-11 min-w-11 rounded-full bg-surface-container-high text-label-md font-semibold text-on-surface hover:bg-surface-container-highest disabled:opacity-50" aria-label={`Thêm thanh ${t}`}>{t}</button>
          ))}
          <button type="button" disabled={!!feedback || hints >= 3} onClick={() => setHints((h) => h + 1)} className="min-h-11 rounded-full px-4 text-label-md font-medium text-secondary hover:bg-surface-container disabled:opacity-50">Gợi ý (−20 điểm)</button>
          <button type="button" disabled={!!feedback} onClick={() => submit("")} className="min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container disabled:opacity-50">Bỏ qua</button>
        </div>
      </form>

      {feedback && (
        <div role="status" className="mt-space-md rounded-2xl bg-surface-container-low p-space-md">
          <p className="text-body-lg font-semibold text-on-surface">{FEEDBACK[feedback.result]}{feedback.points > 0 && <span className="ml-2 text-secondary">+{feedback.points}</span>}</p>
          <p className="mt-1 text-body-md text-on-surface-variant">Đáp án: <span className="font-semibold text-primary">{card.pinyin}</span>{card.han_viet && <> · <span className="uppercase tracking-wider text-secondary">{card.han_viet}</span></>}</p>
          <button ref={nextRef} type="button" onClick={next} className="mt-space-sm min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">{index + 1 >= deck.length || (challenge && lives <= 0) ? "Xem kết quả" : "Từ tiếp theo"}</button>
        </div>
      )}
    </div>
  );
}
