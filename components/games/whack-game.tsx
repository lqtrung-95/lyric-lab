"use client";

import { useEffect, useRef, useState } from "react";
import { PracticeSummary } from "@/components/practice/practice-summary";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { playSfx } from "@/lib/feedback/sfx";
import { arcadeRound } from "@/lib/games/arcade-score";
import type { GameWord } from "@/lib/games/game-word";
import { WHACK_SECONDS, makeWhackRound, whackPoints, windowMs, type WhackRound } from "@/lib/games/whack-round";
import { useArcadeScore } from "./use-arcade-score";

const PENALTY_MS = 2000;
const msSince = (t: number): number => Date.now() - t;
interface Play { round: WhackRound | null; no: number; played: number; hits: number; score: number; combo: number; best: number; missed: GameWord[] }
const fresh = (words: GameWord[]): Play => ({ round: makeWhackRound(words, 0, Math.random), no: 0, played: 0, hits: 0, score: 0, combo: 0, best: 0, missed: [] });

/** Đập chữ: 30 giây, đọc pinyin ở đầu rồi đập đúng chữ Hán trong chín hố trước khi chúng biến mất. Đập sai bị trừ 2 giây. */
export function WhackGame({ words }: { words: GameWord[] }) {
  const [run, setRun] = useState(0);
  return <Round key={run} words={words} onAgain={() => setRun((r) => r + 1)} />;
}

function Round({ words, onAgain }: { words: GameWord[]; onAgain: () => void }) {
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [g, setG] = useState<Play>(() => fresh(words));
  const [left, setLeft] = useState(WHACK_SECONDS);
  const [flash, setFlash] = useState<number | null>(null);
  const endAt = useRef(0);
  const roundStart = useRef(0);
  const win = windowMs(g.played);
  const { saved } = useArcadeScore("whack", phase === "over", () => (g.hits > 0 ? arcadeRound(g.score, g.hits, g.played, WHACK_SECONDS) : null));

  function advance(c: Play, hit: boolean, points: number): Play {
    const combo = hit ? c.combo + 1 : 0;
    return { ...c, no: c.no + 1, played: c.played + 1, hits: c.hits + (hit ? 1 : 0), score: c.score + points, combo, best: Math.max(c.best, combo), missed: hit || !c.round ? c.missed : [...c.missed, c.round.answer], round: makeWhackRound(words, c.played + 1, Math.random) };
  }
  function start() { endAt.current = Date.now() + WHACK_SECONDS * 1000; setPhase("play"); }
  function hit(cell: number) {
    if (phase !== "play" || !g.round) return;
    if (g.round.cells[cell]?.han === g.round.answer.han) {
      const frac = 1 - msSince(roundStart.current) / win;
      playSfx("correct");
      setG((c) => advance(c, true, whackPoints(frac, c.combo)));
    } else {
      endAt.current -= PENALTY_MS;
      playSfx("wrong");
      setFlash(cell);
      setG((c) => ({ ...c, combo: 0 }));
    }
  }
  useEffect(() => {
    if (phase !== "play") return;
    roundStart.current = Date.now();
    const t = setTimeout(() => setG((c) => (c.no === g.no ? advance(c, false, 0) : c)), win);
    return () => clearTimeout(t);
  }, [phase, g.no]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => { const sec = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000)); setLeft(sec); if (sec <= 0) setPhase("over"); }, 200);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 350);
    return () => clearTimeout(t);
  }, [flash]);

  if (phase === "over") {
    return (
      <PracticeSummary
        title="Hết giờ!"
        stats={[{ label: "Điểm", value: String(g.score) }, { label: "Đập đúng", value: `${g.hits}/${g.played}` }, { label: "Combo dài nhất", value: String(g.best) }]}
        missed={g.missed.map((w, i) => ({ key: `${w.han}-${i}`, term: w.han, pinyin: w.pinyin, meaning: w.meaning ?? "" }))}
        onAgain={onAgain}
      />
    );
  }
  return (
    <div>
      {saved && <p role="status" className="mb-2 text-label-md font-bold text-secondary">Đã ghi điểm luyện tập.</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-lg font-extrabold">
        <span>🔨 {g.score}</span>
        <span role="timer" aria-label={`Còn ${left} giây`} className={`rounded-full border-2 border-ink px-3 py-1 ${left <= 5 && phase === "play" ? "animate-pulse bg-error text-on-error" : "bg-surface-container-lowest"}`}>⏱ {left}s</span>
        {g.combo >= 2 && <span className="text-secondary">Combo ×{g.combo}</span>}
      </div>
      <div className="mt-space-sm flex items-center justify-center gap-3 rounded-2xl bg-surface-container-low p-space-sm" role="status" aria-live="polite">
        <span className="text-label-md text-on-surface-variant">Đập chữ</span>
        <span className="text-headline-md font-extrabold text-primary">{g.round?.answer.pinyin}</span>
        {g.round && <PronounceButton text={g.round.answer.han} />}
      </div>
      <ul className="mt-space-sm grid grid-cols-3 gap-2 sm:gap-3">
        {(g.round?.cells ?? []).map((w, i) => (
          <li key={i}>
            <button type="button" disabled={phase !== "play" || !w} onClick={() => hit(i)} aria-label={w ? `Chữ ${w.han}` : "Hố trống"}
              className={`flex aspect-square w-full items-center justify-center rounded-3xl border-2 border-ink text-4xl font-extrabold transition-transform sm:text-5xl ${w ? "bg-amber-200 text-slate-900 shadow-[0_4px_0_#1e1a16] active:translate-y-1 active:shadow-none" : "bg-surface-container-high"} ${flash === i ? "animate-pulse !bg-error !text-on-error" : ""}`}>
              {w && <span lang="zh-Hans">{w.han}</span>}
            </button>
          </li>
        ))}
      </ul>
      {phase === "idle" && (
        <div className="mt-space-md text-center">
          <p className="text-body-md text-on-surface-variant">30 giây. Đọc pinyin ở trên rồi đập đúng chữ. Đập sai trừ 2 giây.</p>
          <button type="button" onClick={start} className="mt-space-sm min-h-12 rounded-full bg-primary px-8 text-label-lg font-extrabold text-on-primary hover:brightness-110">Bắt đầu</button>
        </div>
      )}
    </div>
  );
}
