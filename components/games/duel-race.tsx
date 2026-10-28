"use client";

import { useEffect, useRef, useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { HintToggles } from "./hint-toggles";
import { useArcadeHints } from "./use-arcade-hints";
import { playSfx } from "@/lib/feedback/sfx";
import { SKIP_PENALTY_MS } from "@/lib/games/duel";
import type { GameWord } from "@/lib/games/game-word";
import { checkPinyin } from "@/lib/practice/pinyin-answer";

interface Props { words: GameWord[]; theirsDone: number; onProgress: (done: number) => void; onFinish: (ms: number, solved: number) => void }

const nowMs = (): number => Date.now();

/** Đường đua gõ pinyin: nhìn chữ Hán, gõ pinyin (có hoặc không thanh). Đúng thì sang từ kế; sai thì gõ lại; bỏ qua bị cộng 5 giây. Xong hết thì báo thời gian (đã cộng phạt). */
export function DuelRace({ words, theirsDone, onProgress, onFinish }: Props) {
  const hints = useArcadeHints();
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [skips, setSkips] = useState(0);
  const start = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { start.current = nowMs(); inputRef.current?.focus(); }, []);

  function advance(extraSkips: number) {
    const next = i + 1;
    setI(next); setText(""); setMsg(null);
    onProgress(next);
    if (next >= words.length) onFinish(nowMs() - start.current + extraSkips * SKIP_PENALTY_MS, words.length - extraSkips);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = checkPinyin(text, words[i].pinyin);
    if (r === "exact" || r === "no-tone") { playSfx("correct"); advance(skips); return; }
    playSfx("wrong");
    setMsg(r === "wrong-tone" ? "Đúng âm, sai thanh. Thử lại!" : "Chưa đúng, thử lại!");
    setText("");
  }
  function skip() { setSkips((n) => n + 1); advance(skips + 1); }

  if (i >= words.length) return <p role="status" className="rounded-2xl bg-surface-container-low p-space-md text-center text-body-lg font-bold">Bạn về đích! Đang chờ kết quả…</p>;
  const w = words[i];
  return (
    <div className="flex flex-col gap-space-md">
      <div className="grid gap-2 text-label-md font-bold">
        {[["Bạn", i], ["Đối thủ", theirsDone]].map(([label, n]) => (
          <div key={label as string}>
            <div className="flex justify-between"><span>{label}</span><span>{n}/{words.length}</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-container-high" role="progressbar" aria-valuenow={n as number} aria-valuemin={0} aria-valuemax={words.length} aria-label={`${label}: ${n}/${words.length}`}>
              <div className={`h-full rounded-full transition-[width] duration-300 ${label === "Bạn" ? "bg-primary" : "bg-secondary"}`} style={{ width: `${((n as number) / words.length) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl bg-surface-container-low p-space-lg text-center">
        <p className="text-label-md text-on-surface-variant">Từ {i + 1}/{words.length}</p>
        <p lang="zh-Hans" className="mt-1 text-[4rem] font-bold leading-tight">{w.han}</p>
        {hints.meaning && w.meaning && <p className="mt-1 text-body-lg text-on-surface-variant">{w.meaning}</p>}
        <div className="mt-2 flex items-center justify-center gap-2"><PronounceButton text={w.han} /><HintToggles pinyin={false} /></div>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor="duel-input" className="text-label-md font-bold">Gõ pinyin (ví dụ <span className="font-mono">pengyou</span> hoặc <span className="font-mono">peng2 you3</span>)</label>
        <div className="flex gap-2">
          <input ref={inputRef} id="duel-input" value={text} onChange={(e) => { setText(e.target.value); setMsg(null); }} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
            className="min-h-12 min-w-0 flex-1 rounded-2xl bg-surface-container px-4 font-mono text-body-lg outline-none ring-2 ring-transparent focus:ring-secondary" />
          <button type="submit" disabled={!text.trim()} className="min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">Gửi</button>
        </div>
        {msg && <p role="alert" className="text-label-md font-bold text-error">{msg}</p>}
        <button type="button" onClick={skip} className="min-h-11 self-start rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container">Bỏ qua (+5 giây)</button>
      </form>
    </div>
  );
}
