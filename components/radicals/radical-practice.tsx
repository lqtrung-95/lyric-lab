"use client";

import Link from "next/link";
import { useState } from "react";
import { useRadicalProgress } from "@/components/radicals/use-radical-progress";
import { useWordGameScore } from "@/components/practice/use-word-game-score";
import { Icon } from "@/components/ui/icon";
import { playSfx } from "@/lib/feedback/sfx";
import { buildRadicalDrills, type RadicalDrill } from "@/lib/radicals/radical-drills";
import { ENTRIES, TOPICS, entriesOfTopic, entryByNum, type RadicalEntry, type TopicId } from "@/lib/radicals/radicals";
import { weakRadicals } from "@/lib/radicals/radicals-progress";

const ROUND = 10;
type Source = TopicId | "all" | "weak" | "unknown";
const opt = "min-h-14 cursor-pointer rounded-2xl border-2 border-ink bg-surface-container-lowest px-4 py-2 text-left text-body-lg font-bold shadow-[0_3px_0_var(--shadow-ink)] hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:cursor-default";

/** Luyện bộ thủ: 10 câu trộn bốn kiểu (tên và nghĩa, bộ theo nghĩa, bộ của một chữ, chữ chứa bộ); ghi đúng/sai theo từng bộ và cộng điểm luyện tập. */
export function RadicalPractice({ initialTopic, initialSource }: { initialTopic: TopicId | null; initialSource?: "weak" | "unknown" | null }) {
  const { progress, record } = useRadicalProgress();
  const [source, setSource] = useState<Source>(initialTopic ?? initialSource ?? "all");
  const [drills, setDrills] = useState<RadicalDrill[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongNums, setWrongNums] = useState<number[]>([]);
  const done = !!drills && i >= drills.length;
  const { saved } = useWordGameScore({ mode: "radical", done, correct: score, total: drills?.length ?? 1 });

  const pool = (s: Source): RadicalEntry[] => {
    if (s === "all") return ENTRIES;
    if (s === "weak") return weakRadicals(progress, 12).flatMap((n) => entryByNum(n) ?? []);
    if (s === "unknown") return ENTRIES.filter((e) => !progress.known.includes(e.num));
    return entriesOfTopic(s);
  };
  const start = (s: Source) => {
    const list = pool(s);
    const d = buildRadicalDrills(list.length ? list : ENTRIES, ROUND);
    setDrills(d); setI(0); setPicked(null); setScore(0); setWrongNums([]);
  };

  if (!drills) {
    const weakN = weakRadicals(progress, 12).length;
    return (
      <div className="card-ink flex flex-col gap-space-md p-space-lg">
        <h2 className="text-headline-sm">Chọn phạm vi luyện</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {([["all", "Tất cả 214 bộ"], ["unknown", "Chỉ bộ chưa biết"], ...(weakN > 0 ? [["weak", `Bộ hay nhầm (${weakN})`]] : []), ...TOPICS.map((t) => [t.id, t.title])] as [Source, string][]).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={source === id} onClick={() => setSource(id)} className={`min-h-11 cursor-pointer rounded-2xl border-2 border-ink px-4 py-2 text-left text-label-lg font-bold ${source === id ? "bg-primary-container shadow-[0_3px_0_var(--shadow-ink)]" : "bg-surface-container-lowest hover:brightness-105"}`}>{label}</button>
          ))}
        </div>
        <button type="button" onClick={() => start(source)} className="btn-3d btn-3d-primary min-h-12 w-fit px-8 font-extrabold">Bắt đầu {ROUND} câu</button>
      </div>
    );
  }

  if (done) {
    const weak = [...new Set(wrongNums)];
    return (
      <section className="card-ink p-space-lg text-center" aria-labelledby="rad-done">
        <h2 id="rad-done" className="font-serif text-headline-md">Kết quả</h2>
        <p className="mt-space-sm text-headline-lg font-extrabold">{score}/{drills.length}</p>
        {saved && <p role="status" className="text-label-lg font-bold text-secondary">Đã ghi +{score * 100} điểm luyện tập</p>}
        {weak.length > 0 && (
          <>
            <p className="mt-space-sm text-body-md text-on-surface-variant">Ôn lại các bộ này:</p>
            <ul className="mt-1 flex flex-wrap justify-center gap-2">{weak.map((n) => { const e = entryByNum(n)!; return <li key={n}><Link href={`/radicals/${n}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-surface-container px-4 text-label-md font-bold"><span lang="zh-Hans" className="font-serif text-lg">{e.char}</span>Bộ {e.name}</Link></li>; })}</ul>
          </>
        )}
        <div className="mt-space-md flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => start(source)} className="btn-3d btn-3d-primary min-h-12 px-6 font-extrabold">Làm lại</button>
          <button type="button" onClick={() => setDrills(null)} className="btn-3d btn-3d-neutral min-h-12 px-6 font-extrabold">Đổi phạm vi</button>
        </div>
      </section>
    );
  }

  const d = drills[i];
  const ok = picked !== null && picked === d.answer;
  const choose = (o: string) => {
    if (picked !== null) return;
    const correct = o === d.answer;
    record(d.num, correct);
    playSfx(correct ? "correct" : "wrong");
    setPicked(o);
    if (correct) setScore((s) => s + 1); else setWrongNums((w) => [...w, d.num]);
  };
  const han = d.kind === "which" || d.kind === "meaning";
  return (
    <section aria-label="Luyện bộ thủ" className="card-ink p-space-md sm:p-space-lg">
      <p className="text-label-md text-on-surface-variant">Câu {i + 1}/{drills.length}</p>
      <h2 className="mt-1 text-body-lg font-bold">{d.prompt}</h2>
      <p lang={han || d.kind === "contains" ? "zh-Hans" : undefined} className={`my-space-md text-center ${d.kind === "reverse" ? "text-headline-md font-extrabold" : "font-serif text-[64px] leading-none"}`}>{d.shown}</p>
      <div lang={d.kind === "meaning" ? undefined : "zh-Hans"} className={`grid gap-2 ${d.kind === "meaning" ? "" : "grid-cols-2"}`}>
        {d.options.map((o) => {
          const right = picked !== null && o === d.answer, wrong = picked === o && o !== d.answer;
          return <button key={o} type="button" disabled={picked !== null} onClick={() => choose(o)} className={`${opt} ${d.kind === "meaning" ? "" : "font-serif text-headline-md"} ${right ? "!bg-secondary-container" : wrong ? "!bg-error-container" : ""}`}>{o}</button>;
        })}
      </div>
      {picked !== null && (
        <div role="status" className={`mt-space-md rounded-2xl border-2 p-space-sm ${ok ? "border-secondary bg-secondary-container" : "border-error bg-error-container"}`}>
          <p className="flex items-center gap-1 font-extrabold"><Icon name={ok ? "check_circle" : "close"} size={20} filled />{ok ? "Đúng rồi!" : "Chưa đúng"}</p>
          <p className="mt-1 text-body-md">{d.explain}</p>
          <button type="button" onClick={() => { setI((n) => n + 1); setPicked(null); }} className="btn-3d btn-3d-primary mt-space-sm min-h-11 px-5 font-extrabold">{i + 1 >= drills.length ? "Xem kết quả" : "Câu tiếp"}</button>
        </div>
      )}
    </section>
  );
}
