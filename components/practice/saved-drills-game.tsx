"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ModeTabs } from "@/components/review/mode-tabs";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { playSfx } from "@/lib/feedback/sfx";
import { buildSavedDrills, usableCards, type SavedDrill } from "@/lib/review/saved-drills";
import { PracticeFrame } from "./practice-frame";
import { usePracticePool } from "./use-practice-pool";
import { useWordGameScore } from "./use-word-game-score";

const ROUND = 10;
const opt = "min-h-14 cursor-pointer rounded-2xl border-2 border-ink bg-surface-container-lowest px-4 py-2 text-left text-body-lg font-bold shadow-[0_3px_0_var(--shadow-ink)] hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:cursor-default";

/** Luyện từ đã lưu: bộ 10 câu trắc nghiệm tự tạo từ thẻ của bạn (từ → nghĩa, nghĩa → từ, từ → pinyin), ưu tiên thẻ đến hạn hoặc hay quên; trả lời được chấm vào lịch FSRS khi thẻ đến hạn. */
export function SavedDrillsGame() {
  const { status, cards, grade } = usePracticePool();
  const usable = useMemo(() => usableCards(cards), [cards]);
  const [drills, setDrills] = useState<SavedDrill[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<SavedDrill[]>([]);
  const done = !!drills && i >= drills.length;
  const { saved } = useWordGameScore({ mode: "drill", done, correct: score, total: drills?.length ?? 1 });

  const start = () => { setDrills(buildSavedDrills(cards, ROUND)); setI(0); setPicked(null); setScore(0); setMissed([]); };
  const d = drills && !done ? drills[i] : null;
  const choose = (o: string) => {
    if (!d || picked !== null) return;
    const ok = o === d.answer;
    const card = cards.find((c) => c.item_key === d.cardKey);
    if (card) grade(card, ok ? "correct" : "wrong");
    playSfx(ok ? "correct" : "wrong");
    setPicked(o);
    if (ok) setScore((s) => s + 1); else setMissed((m) => [...m, d]);
  };

  return (
    <>
      <ModeTabs />
      <PracticeFrame title="Luyện từ đã lưu" status={status} intro="Bộ bài tự tạo từ các thẻ bạn đã lưu: nhớ nghĩa, nhớ chữ, nhớ cách đọc. Thẻ đến hạn hoặc hay quên được ưu tiên."
        blocked={usable.length < 4 ? "Cần ít nhất 4 thẻ từ vựng đã lưu (có nghĩa) để tạo bài. Lưu thêm từ từ bài hát hoặc trang Tra từ nhé." : null}>
        {!drills && <button type="button" onClick={start} className="btn-3d btn-3d-primary min-h-12 px-8 font-extrabold">Bắt đầu {Math.min(ROUND, usable.length)} câu</button>}
        {d && (
          <section aria-label="Luyện từ đã lưu" className="card-ink p-space-md sm:p-space-lg">
            <p className="text-label-md text-on-surface-variant">Câu {i + 1}/{drills!.length}</p>
            <h2 className="mt-1 text-body-lg font-bold">{d.prompt}</h2>
            <p lang={d.kind === "term" ? undefined : "zh-Hans"} className={`my-space-md text-center ${d.kind === "term" ? "text-headline-md font-extrabold" : "font-serif text-[56px] leading-none"}`}>{d.shown}</p>
            <div lang={d.kind === "term" ? "zh-Hans" : undefined} className="grid gap-2 sm:grid-cols-2">
              {d.options.map((o) => {
                const right = picked !== null && o === d.answer, wrong = picked === o && o !== d.answer;
                return <button key={o} type="button" disabled={picked !== null} onClick={() => choose(o)} className={`${opt} ${d.kind === "term" ? "font-serif text-headline-md" : ""} ${right ? "!bg-secondary-container" : wrong ? "!bg-error-container" : ""}`}>{o}</button>;
              })}
            </div>
            {picked !== null && (
              <div role="status" className={`mt-space-md rounded-2xl border-2 p-space-sm ${picked === d.answer ? "border-secondary bg-secondary-container" : "border-error bg-error-container"}`}>
                <p className="flex items-center gap-1 font-extrabold"><Icon name={picked === d.answer ? "check_circle" : "close"} size={20} filled />{picked === d.answer ? "Đúng rồi!" : "Chưa đúng"}</p>
                <p className="mt-1 flex items-center gap-2 text-body-md"><span lang="zh-Hans" className="font-serif text-headline-sm font-bold">{d.term}</span><PronounceButton text={d.term} className="size-10" /></p>
                <button type="button" onClick={() => { setI((n) => n + 1); setPicked(null); }} className="btn-3d btn-3d-primary mt-space-sm min-h-11 px-5 font-extrabold">{i + 1 >= drills!.length ? "Xem kết quả" : "Câu tiếp"}</button>
              </div>
            )}
          </section>
        )}
        {done && (
          <section className="card-ink p-space-lg text-center" aria-labelledby="sd-done">
            <h2 id="sd-done" className="font-serif text-headline-md">Kết quả</h2>
            <p className="mt-space-sm text-headline-lg font-extrabold">{score}/{drills!.length}</p>
            {saved && <p role="status" className="text-label-lg font-bold text-secondary">Đã ghi +{score * 100} điểm luyện tập</p>}
            {missed.length > 0 && (
              <>
                <p className="mt-space-sm text-body-md text-on-surface-variant">Ôn lại các từ này:</p>
                <ul className="mt-1 flex flex-wrap justify-center gap-2">{[...new Map(missed.map((m) => [m.cardKey, m])).values()].map((m) => <li key={m.cardKey}><Link href={`/dictionary/${encodeURIComponent(m.term)}`} lang="zh-Hans" className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-surface-container px-4 font-serif text-lg font-bold">{m.term}</Link></li>)}</ul>
              </>
            )}
            <button type="button" onClick={start} className="btn-3d btn-3d-primary mt-space-md min-h-12 px-6 font-extrabold">Bộ bài mới</button>
          </section>
        )}
      </PracticeFrame>
    </>
  );
}
