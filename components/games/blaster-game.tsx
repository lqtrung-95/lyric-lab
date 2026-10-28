"use client";

import { useRef, useState } from "react";
import { PracticeSummary } from "@/components/practice/practice-summary";
import { playSfx } from "@/lib/feedback/sfx";
import { arcadeRound } from "@/lib/games/arcade-score";
import { LIVES, initBlaster, setTyped, stepBlaster, typeLetter, type BlasterState } from "@/lib/games/blaster-engine";
import type { GameWord } from "@/lib/games/game-word";
import { useArcadeScore } from "./use-arcade-score";
import { useGameLoop } from "./use-game-loop";

const STARS = "radial-gradient(1.5px 1.5px at 12% 22%, #fff8, transparent), radial-gradient(1px 1px at 38% 64%, #fff6, transparent), radial-gradient(1.5px 1.5px at 66% 18%, #fff7, transparent), radial-gradient(1px 1px at 84% 52%, #fff6, transparent), radial-gradient(1px 1px at 52% 86%, #fff5, transparent), radial-gradient(1.5px 1.5px at 24% 80%, #fff6, transparent)";
const chip = "rounded-full border border-white/15 bg-slate-900/70 px-3 py-1 text-sm font-bold text-white";

/** Bắn chữ: từ Hán rơi từ trên xuống; nhìn chữ, nhớ pinyin rồi gõ các chữ cái (không cần thanh) để bắn nổ trước khi chạm đáy. Hết 3 mạng là thua; càng bắn nhiều, cấp càng cao, từ rơi càng nhanh. */
export function BlasterGame({ words }: { words: GameWord[] }) {
  const [run, setRun] = useState(0);
  return <Round key={run} words={words} onAgain={() => setRun((r) => r + 1)} />;
}

function Round({ words, onAgain }: { words: GameWord[]; onAgain: () => void }) {
  const [s, setS] = useState<BlasterState>(initBlaster);
  const [started, setStarted] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  useGameLoop((dt) => setS((cur) => stepBlaster(cur, dt, words, Math.random)), started && !s.over);
  const { saved } = useArcadeScore("blaster", s.over, (sec) => (s.kills > 0 ? arcadeRound(s.score, s.kills, s.kills + s.missed.length, sec) : null));

  function onType(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z]/g, "");
    setS((cur) => {
      if (clean.length <= cur.typed.length) return setTyped(cur, clean);
      const next = [...clean.slice(cur.typed.length)].reduce(typeLetter, cur);
      if (next.kills > cur.kills) playSfx("correct");
      else if (cur.combo > 0 && next.combo === 0) playSfx("wrong");
      return next;
    });
  }
  function start() { setStarted(true); inputRef.current?.focus(); }

  if (s.over) {
    return (
      <PracticeSummary
        title="Hạm đội bị phá rồi, thử lại nhé"
        stats={[{ label: "Điểm", value: String(s.score) }, { label: "Từ đã bắn", value: String(s.kills) }, { label: "Combo dài nhất", value: String(s.bestCombo) }, { label: "Cấp", value: String(s.level) }]}
        missed={s.missed.map((w, i) => ({ key: `${w.han}-${i}`, term: w.han, pinyin: w.pinyin, meaning: w.meaning ?? "" }))}
        onAgain={onAgain}
      />
    );
  }
  const locked = s.targets.find((t) => t.id === s.lockedId);
  return (
    <div>
      {saved && <p role="status" className="mb-2 text-label-md font-bold text-secondary">Đã ghi điểm luyện tập.</p>}
      <div onClick={() => inputRef.current?.focus()} className="relative isolate h-[min(68vh,540px)] min-h-[380px] select-none overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#040816] to-[#0b2150]" style={{ backgroundImage: `${STARS}, linear-gradient(to bottom, #040816, #0b2150)` }}>
        <div className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
          <span className={chip}>🏆 {s.score}</span>
          <span className={chip}>Cấp {s.level}</span>
          <span className={chip} aria-label={`${s.lives} mạng`}>{Array.from({ length: LIVES }, (_, i) => (i < s.lives ? "❤️" : "🖤")).join(" ")}</span>
          {s.combo >= 2 && <span className={`${chip} text-amber-300`}>Combo ×{s.combo}</span>}
          <button type="button" aria-pressed={showPinyin} onClick={(e) => { e.stopPropagation(); setShowPinyin((v) => !v); }} className={`${chip} min-h-11`}>Pinyin {showPinyin ? "BẬT" : "TẮT"}</button>
        </div>
        {!started && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center text-white">
            <p className="text-xl font-bold">Nhìn chữ Hán, gõ pinyin để bắn</p>
            <p className="max-w-sm text-sm text-white/80">Gõ chữ cái pinyin không cần thanh, ví dụ <span className="font-mono">pengyou</span> cho 朋友. Đừng để từ chạm đáy.</p>
            <button type="button" onClick={start} className="min-h-12 rounded-full bg-cyan-400 px-8 text-base font-extrabold text-slate-900 hover:brightness-110">Bắt đầu</button>
          </div>
        )}
        {s.targets.map((t) => {
          const on = t.id === s.lockedId;
          return (
            <div key={t.id} className={`absolute rounded-2xl border bg-slate-900/85 px-3 py-2 text-white ${on ? "border-cyan-300 shadow-[0_0_22px_rgba(34,211,238,.55)]" : "border-white/20"}`} style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}>
              <div className="flex items-baseline gap-2">
                <span lang="zh-Hans" className="text-2xl font-bold leading-none">{t.word.han}</span>
                {t.word.meaning && <span className="rounded-md bg-blue-900/80 px-1.5 text-xs text-blue-200">({t.word.meaning})</span>}
              </div>
              <div className="mt-1 flex gap-0.5 font-mono text-sm leading-none" aria-hidden="true">
                {[...t.letters].map((ch, i) => <span key={i} className={on && i < s.typed.length ? "text-cyan-300" : showPinyin ? "text-white/70" : "text-white/30"}>{on && i < s.typed.length || showPinyin ? ch : "_"}</span>)}
              </div>
              {showPinyin && <p className="mt-0.5 text-[11px] text-white/50">{t.word.pinyin}</p>}
            </div>
          );
        })}
        {s.blasts.map((b) => <span key={b.id} aria-hidden="true" className="pointer-events-none absolute -translate-x-1/2 text-3xl" style={{ left: `${b.x * 100 + 6}%`, top: `${b.y * 100}%`, opacity: 1 - b.age * 2 }}>💥</span>)}
        {locked && <span aria-hidden="true" className="absolute w-0.5 bg-gradient-to-t from-cyan-300 to-transparent" style={{ left: `calc(${locked.x * 100}% + 2rem)`, top: `${locked.y * 100 + 12}%`, bottom: 48 }} />}
        <span aria-hidden="true" className="absolute bottom-3 -translate-x-1/2 text-4xl transition-[left] duration-150" style={{ left: locked ? `calc(${locked.x * 100}% + 2rem)` : "50%" }}>🚀</span>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-red-600/80 to-transparent" />
      </div>
      <label className="mt-space-sm block text-label-md font-bold">Gõ pinyin của từ đang rơi
        <input ref={inputRef} value={s.typed} onChange={(e) => onType(e.target.value)} autoFocus autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} inputMode="text" aria-label="Gõ pinyin"
          className="mt-1 min-h-12 w-full rounded-2xl bg-surface-container px-4 font-mono text-body-lg outline-none ring-2 ring-transparent focus:ring-secondary" placeholder="pengyou…" />
      </label>
    </div>
  );
}
