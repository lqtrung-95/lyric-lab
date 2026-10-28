"use client";

import { useEffect, useRef, useState } from "react";
import { useCountdown } from "@/components/practice/use-countdown";
import { useWordGameScore } from "@/components/practice/use-word-game-score";
import { playSfx } from "@/lib/feedback/sfx";
import { recordFluency } from "@/lib/speaking/fluency-stats";
import { hanChars, wordsUsed } from "@/lib/speaking/reply-match";
import type { VadOptions } from "@/lib/speaking/vad";
import type { ReviewCard } from "@/lib/user-data/review-repo";
import { SpeakBox } from "./speak-box";
import { useSpeakTurn } from "./use-speak-turn";

const SPEAK_SEC = 30;
// Nói câu dài cần nghỉ lấy hơi: chờ im lặng lâu hơn trước khi tự dừng.
const PAUSE_TOLERANT: VadOptions = { threshold: 0.025, endSilenceMs: 2500, minSpeechMs: 600 };

interface Props { cards: ReviewCard[]; typingOnly: boolean; onUsed: (used: ReviewCard[]) => void; onNext: () => void }

/** Một bộ 5 từ: nói (hoặc gõ) một đến hai câu dùng đủ 5 từ trong 30 giây; xong thì hiện từ nào đã dùng, từ nào chưa. */
export function FiveWordRound({ cards, typingOnly, onUsed, onNext }: Props) {
  const [started, setStarted] = useState(false);
  const [spoken, setSpoken] = useState<string | null>(null);
  const finished = useRef(false);
  const terms = cards.map((c) => c.term);
  const done = spoken !== null;
  const used = done ? wordsUsed(spoken, terms) : [];
  const left = useCountdown("round", started && !done, SPEAK_SEC);

  const finish = (text: string, onsetMs: number | null) => {
    if (finished.current) return;
    finished.current = true;
    const hit = wordsUsed(text, terms);
    playSfx(hit.length ? "correct" : "wrong");
    setSpoken(text);
    recordFluency({ source: "fiveword", turns: text.trim() ? 1 : 0, reactionMs: onsetMs === null ? [] : [onsetMs], hanChars: hanChars(text).length, words: hit });
    onUsed(cards.filter((c) => hit.includes(c.term)));
  };
  const turn = useSpeakTurn(SPEAK_SEC, (r) => finish(r.text, r.onsetMs), PAUSE_TOLERANT);
  const { saved } = useWordGameScore({ mode: "fiveword", done: done && used.length > 0, correct: used.length, total: cards.length });
  useEffect(() => { if (started && !typingOnly && !done) void turn.start(); }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-space-md">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="5 từ cần dùng">
        {cards.map((c) => {
          const hit = done && used.includes(c.term);
          return (
            <li key={c.item_key} className={`rounded-xl border-2 p-2 text-center ${done ? (hit ? "border-secondary bg-secondary-container ring-2 ring-secondary/40" : "border-error bg-error-container") : "border-ink bg-surface-container-lowest"}`}>
              <p lang="zh-Hans" className="text-headline-md font-bold">{c.term}</p>
              {c.pinyin && <p className="text-label-md text-primary">{c.pinyin}</p>}
              <p className="text-body-sm text-on-surface-variant">{c.meaning}</p>
              {done && <p className="text-label-md font-extrabold">{hit ? "✓ Đã dùng" : "✗ Chưa dùng"}</p>}
            </li>
          );
        })}
      </ul>
      {!started && !done && <button type="button" onClick={() => setStarted(true)} className="mx-auto min-h-12 rounded-full bg-primary px-8 text-label-lg font-bold text-on-primary hover:brightness-110">Bắt đầu: {SPEAK_SEC} giây</button>}
      {started && !done && (
        <>
          <p role="timer" aria-label={`Còn ${left} giây`} className={`mx-auto min-w-24 rounded-full border-2 border-ink px-4 py-1 text-center text-label-lg font-extrabold ${left <= 8 ? "animate-pulse bg-error text-on-error" : "bg-surface-container-lowest"}`}>⏱ {left}s</p>
          <p className="text-center text-body-md text-on-surface-variant">Nói một đến hai câu dùng càng nhiều từ trên càng tốt. Không cần hoàn hảo, cứ nói.</p>
          <SpeakBox phase={turn.phase} error={turn.error} typingOnly={typingOnly} onStart={() => void turn.start()} onStop={() => void turn.stop()} onType={(t) => { turn.cancel(); finish(t, null); }} />
          <button type="button" onClick={() => { turn.cancel(); finish("", null); }} className="mx-auto min-h-11 px-3 text-label-md font-semibold text-on-surface-variant underline">Nộp bài</button>
        </>
      )}
      {done && (
        <div role="status" className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-space-sm">
          <p className="text-body-lg font-bold">Bạn dùng được {used.length}/{cards.length} từ{used.length === cards.length ? ". Tuyệt vời!" : "."}</p>
          <p lang="zh-Hans" className="text-body-md"><span className="font-bold">Bạn nói: </span>{spoken || "(không nghe thấy gì)"}</p>
          {saved && <p className="text-label-lg font-bold text-secondary">Đã ghi +{used.length * 100} điểm luyện tập</p>}
          <button type="button" onClick={onNext} className="min-h-11 w-fit rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">Bộ 5 từ khác</button>
        </div>
      )}
    </div>
  );
}
