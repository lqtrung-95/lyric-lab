"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RadicalTile } from "@/components/radicals/radical-tile";
import { useRadicalProgress } from "@/components/radicals/use-radical-progress";
import { Icon } from "@/components/ui/icon";
import { ENTRIES, TOPICS, entriesOfTopic, searchRadicals, type TopicId } from "@/lib/radicals/radicals";
import { topicProgress, weakRadicals } from "@/lib/radicals/radicals-progress";

type Strokes = "all" | "1-2" | "3" | "4-5" | "6-7" | "8+";
const STROKE_FILTERS: { id: Strokes; label: string; test: (n: number) => boolean }[] = [
  { id: "all", label: "Mọi số nét", test: () => true }, { id: "1-2", label: "1–2 nét", test: (n) => n <= 2 }, { id: "3", label: "3 nét", test: (n) => n === 3 },
  { id: "4-5", label: "4–5 nét", test: (n) => n === 4 || n === 5 }, { id: "6-7", label: "6–7 nét", test: (n) => n === 6 || n === 7 }, { id: "8+", label: "Từ 8 nét", test: (n) => n >= 8 },
];
const chip = (on: boolean) => `min-h-11 cursor-pointer rounded-full border-2 border-ink px-4 text-label-md font-bold ${on ? "bg-primary-container shadow-[0_2px_0_var(--shadow-ink)]" : "bg-surface-container-lowest hover:brightness-105"}`;

/** Trang chủ Bộ thủ: 214 bộ chia theo chủ đề có tiến độ, tìm kiếm, lọc theo số nét, lưới/danh sách, bộ hay nhầm và lối vào luyện tập. */
export function RadicalsHub() {
  const { progress } = useRadicalProgress();
  const [topic, setTopic] = useState<TopicId | "all">("all");
  const [strokes, setStrokes] = useState<Strokes>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [onlyNew, setOnlyNew] = useState(false);
  const known = useMemo(() => new Set(progress.known), [progress.known]);
  const weak = useMemo(() => weakRadicals(progress).flatMap((n) => ENTRIES[n - 1] ?? []), [progress]);
  const list = useMemo(() => {
    const t = STROKE_FILTERS.find((s) => s.id === strokes)!.test;
    return searchRadicals(q, topic === "all" ? ENTRIES : entriesOfTopic(topic)).filter((e) => t(e.strokes) && (!onlyNew || !known.has(e.num)));
  }, [q, topic, strokes, onlyNew, known]);
  const total = topicProgress(progress, ENTRIES);

  return (
    <div className="flex w-full flex-col gap-space-md">
      <header className="flex flex-wrap items-end justify-between gap-space-sm">
        <div className="min-w-0">
          <h1 className="text-headline-lg">Bộ thủ chữ Hán</h1>
          <p className="text-body-md text-on-surface-variant">214 bộ thủ Khang Hy: nghĩa, âm Hán Việt, thứ tự nét, mẹo nhớ và các chữ chứa bộ. Hiểu bộ thủ là đoán được nghĩa của rất nhiều chữ mới.</p>
        </div>
        <Link href="/radicals/practice" className="btn-3d btn-3d-primary inline-flex min-h-12 items-center gap-1 px-5 font-extrabold"><Icon name="quiz" size={20} /> Luyện tập</Link>
      </header>

      <div className="card-ink p-space-sm">
        <div className="flex items-center justify-between gap-2 text-label-md font-bold"><span>Đã biết {total.known}/{total.total} bộ</span><span className="text-on-surface-variant">{Math.round((total.known / total.total) * 100)}%</span></div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface-container" role="progressbar" aria-valuemin={0} aria-valuemax={total.total} aria-valuenow={total.known} aria-label="Số bộ thủ đã biết"><div className="h-full rounded-full bg-primary" style={{ width: `${(total.known / total.total) * 100}%` }} /></div>
      </div>

      {weak.length > 0 && (
        <section aria-labelledby="rad-weak" className="card-ink p-space-md">
          <h2 id="rad-weak" className="flex items-center gap-1 text-headline-sm"><Icon name="local_fire_department" size={22} /> Bộ bạn hay nhầm</h2>
          <ul className="mt-space-sm flex flex-wrap gap-2">{weak.map((e) => <li key={e.num}><Link href={`/radicals/${e.num}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-error-container px-4 text-label-md font-bold"><span lang="zh-Hans" className="font-serif text-lg">{e.char}</span>Bộ {e.name}</Link></li>)}</ul>
        </section>
      )}

      <section aria-label="Chủ đề" className="grid grid-cols-2 gap-space-sm lg:grid-cols-4">
        {TOPICS.map((t) => {
          const p = topicProgress(progress, entriesOfTopic(t.id));
          const on = topic === t.id;
          return (
            <button key={t.id} type="button" aria-pressed={on} onClick={() => setTopic(on ? "all" : t.id)} className={`min-h-11 cursor-pointer rounded-2xl border-2 border-ink p-space-sm text-left ${on ? "bg-primary-container shadow-[0_3px_0_var(--shadow-ink)]" : "bg-surface-container-lowest hover:brightness-105"}`}>
              <span className="block text-label-lg font-extrabold">{t.title}</span>
              <span className="block text-label-sm text-on-surface-variant">{t.blurb}</span>
              <span className="mt-1 block text-label-md font-bold">{p.known}/{p.total} bộ</span>
              <span className="mt-1 block h-2 overflow-hidden rounded-full bg-surface-container"><span className="block h-full rounded-full bg-primary" style={{ width: `${(p.known / p.total) * 100}%` }} /></span>
            </button>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <label className="min-w-[12rem] flex-1">
          <span className="sr-only">Tìm bộ thủ</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo chữ, pinyin, tên (thủy), nghĩa (nước)…" className="min-h-12 w-full rounded-2xl border-2 border-ink bg-surface-container-lowest px-4 text-body-md" />
        </label>
        <div role="group" aria-label="Kiểu hiển thị" className="flex gap-1">
          <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={chip(view === "grid")}>Lưới</button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={chip(view === "list")}>Danh sách</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo số nét">
        {STROKE_FILTERS.map((s) => <button key={s.id} type="button" aria-pressed={strokes === s.id} onClick={() => setStrokes(s.id)} className={chip(strokes === s.id)}>{s.label}</button>)}
        <button type="button" aria-pressed={onlyNew} onClick={() => setOnlyNew((v) => !v)} className={chip(onlyNew)}>Chỉ bộ chưa biết</button>
      </div>

      <p role="status" className="text-label-md text-on-surface-variant">{list.length} bộ{topic !== "all" ? ` · ${TOPICS.find((t) => t.id === topic)?.title}` : ""}</p>
      {list.length === 0 && <p className="text-body-md text-on-surface-variant">Không có bộ nào khớp bộ lọc.</p>}
      {view === "grid" ? (
        <ul className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{list.map((e) => <li key={e.num}><RadicalTile e={e} known={known.has(e.num)} /></li>)}</ul>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((e) => (
            <li key={e.num}>
              <Link href={`/radicals/${e.num}`} className={`card-ink flex min-h-11 items-center gap-space-sm p-space-sm hover:brightness-105 ${known.has(e.num) ? "!bg-secondary-container" : ""}`}>
                <span className="w-10 text-label-sm text-on-surface-variant">#{e.num}</span>
                <span lang="zh-Hans" className="w-16 font-serif text-[32px] leading-none">{e.char}</span>
                <span className="min-w-0 flex-1"><span className="block text-label-lg font-extrabold">Bộ {e.name} <span className="font-normal text-primary">{e.pinyin}</span></span><span className="block text-body-md text-on-surface-variant">{e.meaning}</span></span>
                <span className="text-label-md text-on-surface-variant">{e.strokes} nét{known.has(e.num) ? " · ✓" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
