"use client";

import { useEffect, useRef, useState } from "react";
import { PracticeSummary } from "@/components/practice/practice-summary";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { GameKeyframes } from "./game-keyframes";
import { GamePet, type GamePetEvent } from "./game-pet";
import { HintToggles } from "./hint-toggles";
import { useArcadeHints } from "./use-arcade-hints";
import { SoundToggle } from "./sound-toggle";
import { WhackHole } from "./whack-hole";
import { sfx } from "@/lib/games/arcade-sfx";
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
  const hints = useArcadeHints();
  const [flash, setFlash] = useState<number | null>(null);
  const [fx, setFx] = useState<{ cell: number; points: number } | null>(null);
  const [petEv, setPetEv] = useState<GamePetEvent | null>(null);
  const cheerPet = (kind: GamePetEvent["kind"]) => setPetEv((e) => ({ key: (e?.key ?? 0) + 1, kind }));
  const endAt = useRef(0);
  const roundStart = useRef(0);
  const win = windowMs(g.played);
  const { saved, xp } = useArcadeScore("whack", phase === "over", () => (g.hits > 0 ? arcadeRound(g.score, g.hits, g.played, WHACK_SECONDS) : null));

  function advance(c: Play, hit: boolean, points: number): Play {
    const combo = hit ? c.combo + 1 : 0;
    return { ...c, no: c.no + 1, played: c.played + 1, hits: c.hits + (hit ? 1 : 0), score: c.score + points, combo, best: Math.max(c.best, combo), missed: hit || !c.round ? c.missed : [...c.missed, c.round.answer], round: makeWhackRound(words, c.played + 1, Math.random) };
  }
  function start() { endAt.current = Date.now() + WHACK_SECONDS * 1000; setPhase("play"); }
  function hit(cell: number) {
    if (phase !== "play" || !g.round) return;
    if (g.round.cells[cell]?.han === g.round.answer.han) {
      const frac = 1 - msSince(roundStart.current) / win;
      const points = whackPoints(frac, g.combo);
      sfx.pop(g.combo);
      cheerPet((g.combo + 1) % 5 === 0 ? "combo" : "hit");
      setFx({ cell, points });
      setG((c) => advance(c, true, points));
    } else {
      endAt.current -= PENALTY_MS;
      sfx.buzz();
      cheerPet("miss");
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
    if (!fx) return;
    const t = setTimeout(() => setFx(null), 700);
    return () => clearTimeout(t);
  }, [fx]);
  useEffect(() => { if (phase === "over") sfx.gameOver(); }, [phase]);
  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 350);
    return () => clearTimeout(t);
  }, [flash]);

  if (phase === "over") {
    return (
      <PracticeSummary
        xp={saved ? xp : undefined}
        title="Hết giờ!"
        stats={[{ label: "Điểm", value: String(g.score) }, { label: "Đập đúng", value: `${g.hits}/${g.played}` }, { label: "Combo dài nhất", value: String(g.best) }]}
        missed={g.missed.map((w, i) => ({ key: `${w.han}-${i}`, term: w.han, pinyin: w.pinyin, meaning: w.meaning ?? "" }))}
        onAgain={onAgain}
      />
    );
  }
  return (
    <div>
      <GameKeyframes />
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-lg font-extrabold">
        <span>🔨 {g.score}</span>
        <GamePet event={petEv} />
        <SoundToggle className="min-h-11 min-w-11 rounded-full bg-surface-container-low text-xl" />
        <HintToggles />
        <span role="timer" aria-label={`Còn ${left} giây`} className={`rounded-full border-2 border-ink px-3 py-1 ${left <= 5 && phase === "play" ? "animate-pulse bg-error text-on-error" : "bg-surface-container-lowest"}`}>⏱ {left}s</span>
        {g.combo >= 2 && <span className="text-secondary">Combo ×{g.combo}</span>}
      </div>
      <div className="mt-space-sm flex items-center justify-center gap-3 rounded-2xl bg-surface-container-low p-space-sm" role="status" aria-live="polite">
        <span className="text-label-md text-on-surface-variant">Đập chữ</span>
        <span className="flex flex-col items-center leading-tight">
          {hints.pinyin && <span className="text-headline-md font-extrabold text-primary">{g.round?.answer.pinyin}</span>}
          {hints.meaning && g.round?.answer.meaning && <span className={hints.pinyin ? "text-body-md text-on-surface-variant" : "text-headline-md font-extrabold text-primary"}>{g.round.answer.meaning}</span>}
          {!hints.pinyin && !(hints.meaning && g.round?.answer.meaning) && <span className="text-body-lg font-bold text-primary">Nghe và đập chữ</span>}
        </span>
        {g.round && <PronounceButton text={g.round.answer.han} />}
      </div>
      {phase === "play" && <div className="mx-auto mt-1 h-1.5 max-w-md overflow-hidden rounded-full bg-surface-container-high"><div key={g.no} className="bz-shrink h-full rounded-full bg-primary" style={{ "--win": `${win}ms` } as React.CSSProperties} /></div>}
      <div className="mx-auto mt-space-sm max-w-md rounded-3xl border-4 border-[#2f5d1f] bg-gradient-to-b from-[#7cc15a] to-[#4c9a35] p-3 shadow-[0_6px_0_#2f5d1f] sm:p-4">
        <ul className="grid grid-cols-3 gap-x-2 gap-y-1 sm:gap-x-3">
          {(g.round?.cells ?? []).map((w, i) => (
            <li key={`${g.no}-${i}`}>
              <WhackHole word={w} index={i} disabled={phase !== "play"} flash={flash === i} fx={fx?.cell === i ? { points: fx.points } : null} onHit={() => hit(i)} />
            </li>
          ))}
        </ul>
      </div>
      {phase === "idle" && (
        <div className="mt-space-md text-center">
          <p className="text-body-md text-on-surface-variant">30 giây. Đọc pinyin ở trên rồi đập đúng chữ. Đập sai trừ 2 giây.</p>
          <button type="button" onClick={start} className="mt-space-sm min-h-12 rounded-full bg-primary px-8 text-label-lg font-extrabold text-on-primary hover:brightness-110">Bắt đầu</button>
        </div>
      )}
    </div>
  );
}
