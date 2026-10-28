"use client";

import { useEffect, useRef, useState } from "react";
import { PracticeSummary } from "@/components/practice/practice-summary";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { playSfx } from "@/lib/feedback/sfx";
import { arcadeRound } from "@/lib/games/arcade-score";
import type { GameWord } from "@/lib/games/game-word";
import { melodyNote, playNote } from "@/lib/games/melody";
import { DIFFICULTY, LANES, RAIN_LIVES, ROW_H, activeRow, initRain, stepRain, tapLane, type Difficulty, type RainState } from "@/lib/games/rain-engine";
import { useArcadeScore } from "./use-arcade-score";
import { useGameLoop } from "./use-game-loop";

const KEYS = ["d", "f", "j", "k"];
const chip = "rounded-full bg-black/35 px-3 py-1 text-sm font-bold text-white";

/** Nhạc rơi: các hàng chữ Hán rơi như Piano Tiles. Đọc pinyin ở thanh trên, chạm đúng chữ của hàng thấp nhất trước khi nó chạm đáy. Chạm sai hoặc để rơi mất mạng; bàn phím: 1–4 hoặc D F J K. */
export function RainGame({ words }: { words: GameWord[] }) {
  const [run, setRun] = useState(0);
  return <Round key={run} words={words} onAgain={() => setRun((r) => r + 1)} />;
}

function Round({ words, onAgain }: { words: GameWord[]; onAgain: () => void }) {
  const [s, setS] = useState<RainState>(() => initRain());
  const [started, setStarted] = useState(false);
  const [music, setMusic] = useState(true);
  useGameLoop((dt) => setS((cur) => stepRain(cur, dt, words, Math.random)), started && !s.over);
  const { saved } = useArcadeScore("rain", s.over, (sec) => (s.cleared > 0 ? arcadeRound(s.score, s.cleared, s.cleared + s.missed.length, sec) : null));

  function tap(lane: number) {
    setS((cur) => {
      const next = tapLane(cur, lane);
      if (next.cleared > cur.cleared) { if (music) playNote(melodyNote(cur.cleared)); else playSfx("correct"); }
      else if (next !== cur) playSfx("wrong");
      return next;
    });
  }
  const tapRef = useRef(tap);
  useEffect(() => { tapRef.current = tap; });
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      const lane = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : KEYS.indexOf(e.key.toLowerCase());
      if (lane >= 0) tapRef.current(lane);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started]);

  if (s.over) {
    return (
      <PracticeSummary
        title="Hết mạng rồi, chơi lại nhé"
        stats={[{ label: "Điểm", value: String(s.score) }, { label: "Hàng đúng", value: String(s.cleared) }, { label: "Combo dài nhất", value: String(s.bestCombo) }, { label: "Cấp", value: String(s.level) }]}
        missed={s.missed.map((w, i) => ({ key: `${w.han}-${i}`, term: w.han, pinyin: w.pinyin, meaning: w.meaning ?? "" }))}
        onAgain={onAgain}
      />
    );
  }
  const active = activeRow(s);
  return (
    <div>
      {saved && <p role="status" className="mb-2 text-label-md font-bold text-secondary">Đã ghi điểm luyện tập.</p>}
      <div className={`relative isolate h-[min(72vh,600px)] min-h-[420px] touch-manipulation select-none overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a0b3a] to-[#311a6b] ${s.shake > 0 ? "ring-4 ring-red-500" : ""}`}>
        <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent p-3">
          <span className={chip}>🎵 {s.score}</span>
          <span className={chip}>Cấp {s.level}</span>
          <span className={chip} aria-label={`${s.lives} mạng`}>{Array.from({ length: RAIN_LIVES }, (_, i) => (i < s.lives ? "❤️" : "🖤")).join(" ")}</span>
          {s.combo >= 2 && <span className={`${chip} text-amber-300`}>Combo ×{s.combo}</span>}
        </div>
        {active && (
          <div className="absolute inset-x-3 top-14 z-10 flex items-center justify-center gap-3 rounded-2xl bg-white/90 px-3 py-2 text-slate-900" role="status" aria-live="polite">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tìm chữ</span>
            <span className="text-2xl font-extrabold">{active.words[active.answer].pinyin}</span>
            <PronounceButton text={active.words[active.answer].han} className="!size-10 !bg-slate-200" />
          </div>
        )}
        {s.rows.map((r) => (
          <div key={r.id} className={`absolute inset-x-0 grid grid-cols-4 gap-1.5 px-1.5 pb-1.5 ${r.done ? "opacity-50" : ""}`} style={{ top: `${r.y * 100}%`, height: `${ROW_H * 100}%` }}>
            {r.words.map((w, lane) => {
              const mark = r.done && lane === r.answer ? (r.hit ? "bg-emerald-500 text-white" : "bg-red-500/80 text-white") : "bg-slate-900/90 text-white";
              return (
                <button key={w.han} type="button" tabIndex={-1} onPointerDown={() => r.id === active?.id && tap(lane)} disabled={!started}
                  className={`flex items-center justify-center rounded-xl border border-white/15 text-2xl font-bold sm:text-3xl ${mark}`}>
                  <span lang="zh-Hans">{w.han}</span><span className="sr-only">{lane + 1}</span>
                </button>
              );
            })}
          </div>
        ))}
        {!started && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60 px-6 text-center text-white">
            <p className="text-xl font-bold">Đọc pinyin, chạm đúng chữ</p>
            <p className="max-w-sm text-sm text-white/80">Hàng thấp nhất là hàng đang chờ. Chạm sai hoặc để rơi mất một mạng. Mỗi lần chạm đúng là một nốt của bài “Mạt Lỵ Hoa”, chơi đúng là bạn đang đánh nhạc. Máy tính: phím 1–4 hoặc D F J K.</p>
            <div role="group" aria-label="Độ khó" className="flex gap-2">
              {([["easy", "Dễ"], ["normal", "Vừa"], ["hard", "Khó"]] as [Difficulty, string][]).map(([k, label]) => (
                <button key={k} type="button" aria-pressed={s.base === DIFFICULTY[k]} onClick={() => setS(initRain(DIFFICULTY[k]))} className={`min-h-11 rounded-full border-2 px-5 text-sm font-extrabold ${s.base === DIFFICULTY[k] ? "border-amber-300 bg-amber-300 text-slate-900" : "border-white/40 text-white"}`}>{label}</button>
              ))}
            </div>
            <button type="button" aria-pressed={music} onClick={() => setMusic((v) => !v)} className="min-h-11 rounded-full border-2 border-white/40 px-5 text-sm font-bold text-white">🎵 Nhạc {music ? "BẬT" : "TẮT"}</button>
            <button type="button" onClick={() => setStarted(true)} className="min-h-12 rounded-full bg-amber-300 px-8 text-base font-extrabold text-slate-900 hover:brightness-110">Bắt đầu</button>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 bg-red-500/80" />
      </div>
      <p className="mt-2 text-body-sm text-on-surface-variant">{LANES} cột: chạm chữ ở hàng thấp nhất khớp với pinyin trên đầu.</p>
    </div>
  );
}
