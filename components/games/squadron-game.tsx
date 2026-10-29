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

const chip = "rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-sm font-bold";
const LEFT = new Set(["ArrowLeft", "a", "A"]), RIGHT = new Set(["ArrowRight", "d", "D"]);
const FIRE_KEY = " ";

/**
 * Phi đội: di chuột / kéo ngón tay (hoặc phím ←/→, A/D) để lái tàu và canh chữ; bấm chuột, chạm hoặc nhấn Space để bắn (giữ thì bắn liên tiếp). Mỗi đợt có một câu hỏi (nghĩa Việt hoặc pinyin) và bốn máy bay mang chữ Hán: bắn đúng chữ để ghi điểm,
 * bắn nhầm bị trừ điểm và mất combo (nhầm 3 lần trong một đợt thì mất một mạng), để chữ đúng lọt xuống hoặc va phải chữ sai là mất mạng. Combo nhiều thì có vật phẩm rơi (đạn ba, khiên, làm chậm); cứ năm đợt có một trùm nhiều máu.
 */
export function SquadronGame({ words, onAgain }: { words: GameWord[]; onAgain: () => void }) {
  const [s, setS] = useState<SquadronState>(initSquadron);
  const [started, setStarted] = useState(false);
  const keys = useRef({ left: false, right: false });
  const target = useRef<number | null>(null);
  /** Đang giữ nút bắn (chuột, chạm, Space hoặc nút Bắn). */
  const firing = useRef(false);
  const active = started && !s.over;
  useGameLoop((dt) => {
    const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    const input: SquadronInput = { dir: dir as -1 | 0 | 1, targetX: target.current, fire: firing.current };
    setS((cur) => stepSquadron(cur, dt, input, words, Math.random));
  }, active);
  useSquadronSound(s, active);
  const { saved, xp } = useArcadeScore("blaster", s.over, (sec) => (s.kills > 0 ? arcadeRound(s.score, s.kills, s.kills + s.missed.length + s.wrong, sec) : null));

  useEffect(() => {
    if (!active) return;
    const set = (e: KeyboardEvent, down: boolean) => {
      if (LEFT.has(e.key)) keys.current.left = down; else if (RIGHT.has(e.key)) keys.current.right = down; else if (e.key === FIRE_KEY) firing.current = down; else return;
      e.preventDefault();
    };
    const dn = (e: KeyboardEvent) => set(e, true), up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); keys.current = { left: false, right: false }; firing.current = false; };
  }, [active]);

  const aim = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    target.current = (e.clientX - r.left) / r.width;
  };
  const press = (e: React.PointerEvent<HTMLDivElement>) => { if (!active) return; aim(e); firing.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const release = () => { firing.current = false; };

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
        {q ? <>Bắn máy bay mang chữ {q.kind === "meaning" ? "có nghĩa" : "đọc là"}: <b className={q.kind === "pinyin" ? "text-primary" : ""}>{q.prompt}</b></> : started ? "Chuẩn bị…" : "Di chuột (hoặc ←/→, A/D) để lái tàu, bấm chuột hoặc Space để bắn."}
      </p>
      <div className="mx-auto mb-space-sm flex max-w-[520px] flex-wrap items-center gap-2">
        <span className={chip}>🏆 {s.score}</span>
        <span className={chip}>Cấp {s.level}</span>
        <span className={chip} aria-label={`${s.lives} mạng`}>{Array.from({ length: LIVES }, (_, i) => (i < s.lives ? "❤️" : "🖤")).join(" ")}</span>
        <span className={chip} title="Nhầm 3 lần trong một đợt thì mất 1 mạng" aria-label={`${s.strikes} trên 3 lần nhầm`}>✗ {s.strikes}/3</span>
        {s.combo >= 2 && <span key={s.combo} className={`${chip} bz-pop text-primary`}>🔥 ×{s.combo}</span>}
        {s.spread > 0 && <span className={chip}>{POWER_ICON.spread.icon} {Math.ceil(s.spread)}s</span>}
        {s.slow > 0 && <span className={chip}>{POWER_ICON.slow.icon} {Math.ceil(s.slow)}s</span>}
        {s.shield && <span className={chip}>{POWER_ICON.shield.icon}</span>}
        <SoundToggle className={`${chip} min-h-11 min-w-11`} />
      </div>
      <div onPointerMove={aim} onPointerDown={press} onPointerUp={release} onPointerCancel={release} className={`relative isolate mx-auto aspect-[3/4] w-full max-w-[520px] cursor-crosshair touch-none select-none overflow-hidden rounded-3xl border border-white/10 bg-[#040816] ${s.shake > 0 ? "bz-shake" : ""}`}>
        <SquadronScene s={s} />
        {!started && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 px-6 text-center text-white">
            <p className="text-xl font-bold">Lái tàu, canh đúng máy bay rồi bắn</p>
            <p className="max-w-sm text-sm text-white/80">Di chuột hoặc kéo ngón tay (cũng được ←/→, A/D) để lái. Bấm chuột, chạm hoặc nhấn Space để bắn, giữ thì bắn liên tiếp. Chỉ bắn chữ đúng theo đề bài: bắn nhầm bị trừ điểm, nhầm 3 lần trong một đợt là mất 1 mạng. Đừng để chữ đúng lọt xuống.</p>
            <button type="button" onClick={() => setStarted(true)} className="min-h-12 rounded-full bg-cyan-400 px-8 text-base font-extrabold text-slate-900 hover:brightness-110">Cất cánh</button>
          </div>
        )}
      </div>
      <button type="button" disabled={!active} onPointerDown={() => { firing.current = true; }} onPointerUp={release} onPointerLeave={release} onPointerCancel={release} onClick={(e) => { if (e.detail === 0) { firing.current = true; setTimeout(release, 120); } }}
        className="mx-auto mt-space-sm flex min-h-14 w-full max-w-[520px] touch-none select-none items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-primary-container text-lg font-extrabold shadow-[0_4px_0_0_var(--ink)] active:translate-y-1 active:shadow-none disabled:opacity-60">
        💥 Bắn <span className="text-label-md font-semibold text-on-surface-variant">(Space)</span>
      </button>
    </div>
  );
}
