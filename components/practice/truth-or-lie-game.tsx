"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import { playSfx } from "@/lib/feedback/sfx";
import type { Trial } from "@/lib/practice/truth-or-lie";
import { truthOptionBadge, truthOptionClass, type TruthOptionKind } from "./truth-or-lie-option-style";
import { useWordGameScore } from "./use-word-game-score";

const tog = (on: boolean) => `min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-extrabold ${on ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`;

/**
 * Hai thật một giả (真话还是假话): ba câu tiếng Trung, hai đúng một sai; chọn câu sai. Chọn xong thì lộ đáp án, nghĩa tiếng Việt và lời giải thích.
 * Luyện đọc hiểu câu đơn giản; làm xong được tính điểm luyện tập (XP).
 */
export function TruthOrLieGame({ trials, pinyin }: { trials: Trial[]; pinyin: Record<string, string> }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVi, setShowVi] = useState(false);
  const done = i >= trials.length;
  const { saved } = useWordGameScore({ mode: "truth", done, correct: score, total: trials.length });
  if (done) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-space-lg text-center" data-testid="tol-done">
        <p className="font-serif text-headline-md">Bạn tìm đúng {score}/{trials.length} câu sai</p>
        {saved && <p role="status" className="mt-1 text-label-lg font-bold text-secondary">Đã ghi +{score * 100} điểm luyện tập</p>}
        <button type="button" onClick={() => router.refresh()} className="mt-space-md min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">Chơi bộ khác</button>
      </div>
    );
  }
  const trial = trials[i];
  const answered = picked !== null;
  function pick(idx: number) {
    if (answered) return;
    setPicked(idx);
    const ok = idx === trial.lieIndex;
    if (ok) setScore((s) => s + 1);
    playSfx(ok ? "correct" : "wrong");
  }
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label-lg font-extrabold">Vòng {i + 1}/{trials.length} · {trial.topic}</p>
        <div role="group" aria-label="Gợi ý" className="flex gap-1.5">
          <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={tog(showPinyin)}>Pinyin</button>
          <button type="button" aria-pressed={showVi} onClick={() => setShowVi((v) => !v)} className={tog(showVi)}>Nghĩa</button>
        </div>
      </div>
      <p className="text-body-lg font-bold">Hai câu đúng, một câu SAI. Chọn câu sai.</p>
      <ul className="flex flex-col gap-2">
        {trial.options.map((o, idx) => {
          const isLie = idx === trial.lieIndex;
          const kind: TruthOptionKind = !answered ? "idle" : isLie ? "lie" : idx === picked ? "wrong-pick" : "other";
          const badge = truthOptionBadge(kind);
          return (
            <li key={o.zh} className="flex items-stretch gap-2">
              <button type="button" onClick={() => pick(idx)} disabled={answered} aria-pressed={picked === idx}
                className={truthOptionClass(kind)}>
                <span lang="zh-Hans" className={`block text-body-lg font-bold ${showPinyin ? "leading-[2.2]" : ""}`}><RubyLine zh={o.zh} pinyin={pinyin[o.zh]} show={showPinyin} /></span>
                {(showVi || answered) && <span className="block text-body-sm text-on-surface-variant">{o.vi}</span>}
                {badge && <span className={badge.className}>{badge.text}{isLie && idx === picked ? " · bạn chọn" : ""}</span>}
              </button>
              <PronounceButton text={o.zh} className="size-14 self-center" />
            </li>
          );
        })}
      </ul>
      {answered && (
        <div role="status" className="rounded-xl bg-surface-container-low p-space-sm">
          <p className="text-body-md font-bold">{picked === trial.lieIndex ? "Chính xác!" : "Chưa đúng."} {trial.explain}</p>
          <button type="button" onClick={() => { setI((n) => n + 1); setPicked(null); }} className="mt-2 min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">{i + 1 === trials.length ? "Xem kết quả" : "Vòng tiếp"}</button>
        </div>
      )}
    </div>
  );
}
