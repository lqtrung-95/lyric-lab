"use client";

import { useEffect, useRef, useState } from "react";
import { PracticeSummary } from "@/components/practice/practice-summary";
import { arcadeRound } from "@/lib/games/arcade-score";
import type { GameWord } from "@/lib/games/game-word";
import { initSquadron, stepSquadron } from "@/lib/games/squadron-engine";
import { LIVES, type SquadronInput, type SquadronState } from "@/lib/games/squadron-types";
import { GameKeyframes } from "./game-keyframes";
import { SoundToggle } from "./sound-toggle";
import { POWER_ICON, SquadronScene } from "./squadron-scene";
import { useArcadeScore } from "./use-arcade-score";
import { useGameLoop } from "./use-game-loop";
import { useSquadronSound } from "./use-squadron-sound";

const chip = "rounded-full border border-white/15 bg-slate-900/70 px-3 py-1 text-sm font-bold text-white";
const LEFT = new Set(["ArrowLeft", "a", "A"]), RIGHT = new Set(["ArrowRight", "d", "D"]);

/**
 * Phi đội: kéo chuột / ngón tay (hoặc phím ←/→, A/D) để lái tàu, tàu tự bắn. Mỗi đợt có một câu hỏi (nghĩa Việt hoặc pinyin) và bốn máy bay mang chữ Hán: bắn đúng chữ để ghi điểm,
 * bắn nhầm là mất combo, để chữ đúng lọt xuống hoặc va phải chữ sai là mất mạng. Combo nhiều thì có vật phẩm rơi (đạn ba, khiên, làm chậm); cứ năm đợt có một trùm nhiều máu.
 */
export function SquadronGame({ words, onAgain }: { words: GameWord[]; onAgain: () => void }) {
  const [s, setS] = useState<SquadronState>(initSquadron);
  const [started, setStarted] = useState(false);
  const keys = useRef({ left: false, right: false });
  const target = useRef<number | null>(null);
  const active = started && !s.over;
  useGameLoop((dt) => {
    const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    const input: SquadronInput = { dir: dir as -1 | 0 | 1, targetX: target.current };
    setS((cur) => stepSquadron(cur, dt, input, words, Math.random));
  }, active);
  useSquadronSound(s, active);
  const { saved, xp } = useArcadeScore("blaster", s.over, (sec) => (s.kills > 0 ? arcadeRound(s.score, s.kills, s.kills + s.missed.length + s.wrong, sec) : null));

  useEffect(() => {
    if (!active) return;
    const set = (e: KeyboardEvent, down: boolean) => {
      if (LEFT.has(e.key)) keys.current.left = down; else if (RIGHT.has(e.key)) keys.current.right = down; else return;
      e.preventDefault();
    };
    const dn = (e: KeyboardEvent) => set(e, true), up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); keys.current = { left: false, right: false }; };
  }, [active]);

  const aim = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    target.current = (e.clientX - r.left) / r.width;
  };

  if (s.over) {
    return (
      <PracticeSummary
        xp={saved ? xp : undefined}
        title="Phi đội bị hạ rồi, bay lại nhé"
        stats={[{ label: "Điểm", value: String(s.score) }, { label: "Chữ đã bắn đúng", value: String(s.kills) }, { label: "Combo dài nhất", value: String(s.bestCombo) }, { label: "Cấp", value: String(s.level) }]}
        missed={s.missed.map((w, i) => ({ key: `${w.han}-${i}`, term: w.han, pinyin: w.pinyin, meaning: w.meaning ?? "" }))}
        onAgain={onAgain}
      />
    );
  }
  const q = s.question;
  return (
    <div>
      <GameKeyframes />
      <p role="status" className="mb-space-sm min-h-12 rounded-2xl bg-surface-container px-4 py-2 text-center text-body-lg">
        {q ? <>Bắn máy bay mang chữ {q.kind === "meaning" ? "có nghĩa" : "đọc là"}: <b className={q.kind === "pinyin" ? "text-primary" : ""}>{q.prompt}</b></> : started ? "Chuẩn bị…" : "Kéo chuột (hoặc ←/→, A/D) để lái tàu, tàu tự bắn."}
      </p>
      <div onPointerMove={aim} onPointerDown={aim} className={`relative isolate mx-auto aspect-[3/4] w-full max-w-[520px] cursor-crosshair touch-none select-none overflow-hidden rounded-3xl border border-white/10 bg-[#040816] ${s.shake > 0 ? "bz-shake" : ""}`}>
        <SquadronScene s={s} />
        <div className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
          <span className={chip}>🏆 {s.score}</span>
          <span className={chip}>Cấp {s.level}</span>
          <span className={chip} aria-label={`${s.lives} mạng`}>{Array.from({ length: LIVES }, (_, i) => (i < s.lives ? "❤️" : "🖤")).join(" ")}</span>
          {s.combo >= 2 && <span key={s.combo} className={`${chip} bz-pop text-amber-300`}>🔥 ×{s.combo}</span>}
          {s.spread > 0 && <span className={chip}>{POWER_ICON.spread.icon} {Math.ceil(s.spread)}s</span>}
          {s.slow > 0 && <span className={chip}>{POWER_ICON.slow.icon} {Math.ceil(s.slow)}s</span>}
          {s.shield && <span className={chip}>{POWER_ICON.shield.icon}</span>}
          <SoundToggle className={`${chip} min-h-11 min-w-11`} />
        </div>
        {!started && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 px-6 text-center text-white">
            <p className="text-xl font-bold">Lái tàu, bắn đúng máy bay</p>
            <p className="max-w-sm text-sm text-white/80">Tàu tự bắn. Di chuột hoặc kéo ngón tay (cũng được ←/→, A/D) để lái. Bắn đúng chữ theo đề bài, tránh chữ sai, đừng để chữ đúng lọt xuống.</p>
            <button type="button" onClick={() => setStarted(true)} className="min-h-12 rounded-full bg-cyan-400 px-8 text-base font-extrabold text-slate-900 hover:brightness-110">Cất cánh</button>
          </div>
        )}
      </div>
    </div>
  );
}
