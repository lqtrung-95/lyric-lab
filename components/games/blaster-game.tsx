"use client";

import { useRef, useState } from "react";
import { PracticeSummary } from "@/components/practice/practice-summary";
import { arcadeRound } from "@/lib/games/arcade-score";
import { LIVES, initBlaster, setTyped, stepBlaster, typeLetter, type BlasterState } from "@/lib/games/blaster-engine";
import type { GameWord } from "@/lib/games/game-word";
import { BlasterScene } from "./blaster-scene";
import { GameKeyframes } from "./game-keyframes";
import { HintToggles } from "./hint-toggles";
import { SoundToggle } from "./sound-toggle";
import { useArcadeHints } from "./use-arcade-hints";
import { useArcadeScore } from "./use-arcade-score";
import { useBlasterSound } from "./use-blaster-sound";
import { useGameLoop } from "./use-game-loop";

const chip = "rounded-full border border-white/15 bg-slate-900/70 px-3 py-1 text-sm font-bold text-white";

/** Bắn chữ: từ Hán rơi từ trên xuống; nhìn chữ, nhớ pinyin rồi gõ các chữ cái (không cần thanh) để bắn nổ trước khi chạm đáy. Hết 3 mạng là thua; càng bắn nhiều, cấp càng cao, từ rơi càng nhanh. */
export function BlasterGame({ words }: { words: GameWord[] }) {
  const [run, setRun] = useState(0);
  return <Round key={run} words={words} onAgain={() => setRun((r) => r + 1)} />;
}

function Round({ words, onAgain }: { words: GameWord[]; onAgain: () => void }) {
  const [s, setS] = useState<BlasterState>(initBlaster);
  const [started, setStarted] = useState(false);
  const hints = useArcadeHints();
  const inputRef = useRef<HTMLInputElement>(null);
  useGameLoop((dt) => setS((cur) => stepBlaster(cur, dt, words, Math.random)), started && !s.over);
  useBlasterSound(s, started);
  const { saved, xp } = useArcadeScore("blaster", s.over, (sec) => (s.kills > 0 ? arcadeRound(s.score, s.kills, s.kills + s.missed.length, sec) : null));

  function onType(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z]/g, "");
    setS((cur) => {
      if (clean.length <= cur.typed.length) return setTyped(cur, clean);
      return [...clean.slice(cur.typed.length)].reduce(typeLetter, cur);
    });
  }
  function start() { setStarted(true); inputRef.current?.focus(); }

  if (s.over) {
    return (
      <PracticeSummary
        xp={saved ? xp : undefined}
        title="Hạm đội bị phá rồi, thử lại nhé"
        stats={[{ label: "Điểm", value: String(s.score) }, { label: "Từ đã bắn", value: String(s.kills) }, { label: "Combo dài nhất", value: String(s.bestCombo) }, { label: "Cấp", value: String(s.level) }]}
        missed={s.missed.map((w, i) => ({ key: `${w.han}-${i}`, term: w.han, pinyin: w.pinyin, meaning: w.meaning ?? "" }))}
        onAgain={onAgain}
      />
    );
  }
  return (
    <div>
      <GameKeyframes />
      <div onClick={() => inputRef.current?.focus()} className={`relative isolate h-[min(68vh,540px)] min-h-[380px] select-none overflow-hidden rounded-3xl border border-white/10 bg-[#040816] ${s.shake > 0 ? "bz-shake" : ""}`}>
        <BlasterScene s={s} showPinyin={hints.pinyin} showMeaning={hints.meaning} />
        <div className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
          <span className={chip}>🏆 {s.score}</span>
          <span className={chip}>Cấp {s.level}</span>
          <span className={chip} aria-label={`${s.lives} mạng`}>{Array.from({ length: LIVES }, (_, i) => (i < s.lives ? "❤️" : "🖤")).join(" ")}</span>
          {s.combo >= 2 && <span key={s.combo} className={`${chip} bz-pop text-amber-300`}>🔥 Combo ×{s.combo}</span>}
          <SoundToggle className={`${chip} min-h-11 min-w-11`} />
          <HintToggles dark />
        </div>
        {!started && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 px-6 text-center text-white">
            <p className="text-xl font-bold">Nhìn chữ Hán, gõ pinyin để bắn</p>
            <p className="max-w-sm text-sm text-white/80">Gõ chữ cái pinyin không cần thanh, ví dụ <span className="font-mono">pengyou</span> cho 朋友. Đừng để từ chạm đáy.</p>
            <button type="button" onClick={start} className="min-h-12 rounded-full bg-cyan-400 px-8 text-base font-extrabold text-slate-900 hover:brightness-110">Bắt đầu</button>
          </div>
        )}
      </div>
      <label className="mt-space-sm block text-label-md font-bold">Gõ pinyin của từ đang rơi
        <input ref={inputRef} value={s.typed} onChange={(e) => onType(e.target.value)} autoFocus autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} inputMode="text" aria-label="Gõ pinyin"
          className="mt-1 min-h-12 w-full rounded-2xl bg-surface-container px-4 font-mono text-body-lg outline-none ring-2 ring-transparent focus:ring-secondary" placeholder="pengyou…" />
      </label>
    </div>
  );
}
