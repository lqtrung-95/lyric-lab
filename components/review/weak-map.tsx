"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGrammarStats } from "@/components/grammar/use-grammar-stats";
import { usePracticePool } from "@/components/practice/use-practice-pool";
import { useRadicalProgress } from "@/components/radicals/use-radical-progress";
import { Icon } from "@/components/ui/icon";
import { readWeakTerms } from "@/lib/courses/weak-terms";
import { grammarById } from "@/lib/grammar/grammar-patterns";
import { weakPatternIds } from "@/lib/grammar/grammar-stats";
import { entryByNum } from "@/lib/radicals/radicals";
import { weakRadicals } from "@/lib/radicals/radicals-progress";
import { pickHardWords } from "@/lib/review/hard-words";
import { pickAdvice, weakCounts } from "@/lib/review/weak-summary";

const card = "card-ink space-y-space-sm bg-surface-container-lowest p-space-md";
const pill = "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-4 text-label-md font-bold";
const pct = (right: number, wrong: number) => Math.round((right / Math.max(1, right + wrong)) * 100);

/** "Điểm yếu của bạn": gom từ khó (thẻ), ngữ pháp, bộ thủ và từ hay sai ở lộ trình vào một chỗ, kèm việc nên làm trước. Mọi số liệu đều từ việc bạn đã làm, không đoán. */
export function WeakMap() {
  const { cards, status } = usePracticePool();
  const { stats: grammar } = useGrammarStats();
  const { progress: radicals } = useRadicalProgress();
  const [courseTerms, setCourseTerms] = useState<string[] | null>(null);
  useEffect(() => { const t = setTimeout(() => setCourseTerms(readWeakTerms()), 0); return () => clearTimeout(t); }, []);

  const hard = useMemo(() => pickHardWords(cards, 8), [cards]);
  const gIds = useMemo(() => weakPatternIds(grammar, 8), [grammar]);
  const rNums = useMemo(() => weakRadicals(radicals, 8), [radicals]);
  const counts = weakCounts({ hardWords: hard.length, grammar, radicals, courseTerms: courseTerms?.length ?? 0 });
  const advice = pickAdvice(counts);
  const total = counts.vocab + counts.grammar + counts.radical + counts.course;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header>
        <h1 className="text-headline-lg">Điểm yếu của bạn</h1>
        <p className="text-body-md text-on-surface-variant">Những thứ bạn hay quên hoặc làm sai, gom từ thẻ ôn, ngữ pháp, bộ thủ và lộ trình. Luyện đúng chỗ này là cách nhanh nhất để tiến bộ.</p>
      </header>

      {advice ? (
        <section aria-labelledby="weak-advice" className="card-ink flex flex-wrap items-center justify-between gap-space-sm !bg-primary-container p-space-md">
          <div className="min-w-0 flex-1"><h2 id="weak-advice" className="text-headline-sm font-extrabold">Nên làm trước: {advice.title}</h2><p className="text-body-md">{advice.reason}</p></div>
          <Link href={advice.href} className="btn-3d btn-3d-primary inline-flex min-h-12 items-center gap-1 px-5 font-extrabold"><Icon name="local_fire_department" size={20} /> Làm ngay</Link>
        </section>
      ) : (
        <p role="status" className="card-ink p-space-md text-body-md">{status === "loading" ? "Đang tải…" : "Chưa có điểm yếu nào đáng kể. Làm thêm vài bài luyện (từ khó, ngữ pháp, bộ thủ) rồi quay lại: mục nào bạn hay sai sẽ hiện ở đây."}</p>
      )}

      {total > 0 && <p className="text-label-md text-on-surface-variant" role="status">Tổng {total} mục cần chú ý: {counts.vocab} từ khó · {counts.grammar} mẫu ngữ pháp · {counts.radical} bộ thủ · {counts.course} từ ở lộ trình.</p>}

      {hard.length > 0 && (
        <section aria-labelledby="weak-vocab" className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="weak-vocab" className="text-headline-sm font-extrabold">Từ vựng hay quên</h2><Link href="/review/hard" className={`${pill} bg-surface-container`}>Luyện từ khó</Link></div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {hard.map((c) => (
              <li key={c.item_key} className="flex items-center gap-3 rounded-2xl bg-surface-container px-3 py-2">
                <span lang="zh-Hans" className="font-serif text-headline-sm font-bold">{c.term}</span>
                <span className="min-w-0 flex-1"><span className="block text-label-md text-primary">{c.pinyin}</span><span className="block truncate text-label-sm text-on-surface-variant">{c.meaning}</span></span>
                <span className="text-label-sm font-bold text-error">quên {c.lapses} lần</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {gIds.length > 0 && (
        <section aria-labelledby="weak-grammar" className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="weak-grammar" className="text-headline-sm font-extrabold">Mẫu ngữ pháp hay sai</h2><Link href="/grammar" className={`${pill} bg-surface-container`}>Về Ngữ pháp</Link></div>
          <ul className="flex flex-col gap-2">
            {gIds.flatMap((id) => { const p = grammarById(id); const s = grammar[id]; return p && s ? [{ p, s }] : []; }).map(({ p, s }) => (
              <li key={p.id}><Link href={`/grammar/${p.id}`} className="flex min-h-11 items-center gap-3 rounded-2xl bg-error-container px-3 py-2 hover:brightness-105"><span className="min-w-0 flex-1"><span className="block text-label-lg font-extrabold">{p.title}</span><span lang="zh-Hans" className="block font-serif text-body-md">{p.pattern}</span></span><span className="text-label-md font-bold">đúng {pct(s.right, s.wrong)}%</span></Link></li>
            ))}
          </ul>
        </section>
      )}

      {rNums.length > 0 && (
        <section aria-labelledby="weak-rad" className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="weak-rad" className="text-headline-sm font-extrabold">Bộ thủ hay nhầm</h2><Link href="/radicals/practice?source=weak" className={`${pill} bg-surface-container`}>Luyện các bộ này</Link></div>
          <ul className="flex flex-wrap gap-2">
            {rNums.flatMap((n) => entryByNum(n) ?? []).map((e) => <li key={e.num}><Link href={`/radicals/${e.num}`} className={`${pill} bg-error-container`}><span lang="zh-Hans" className="font-serif text-lg">{e.char}</span>Bộ {e.name}</Link></li>)}
          </ul>
        </section>
      )}

      {(courseTerms?.length ?? 0) > 0 && (
        <section aria-labelledby="weak-course" className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="weak-course" className="text-headline-sm font-extrabold">Từ hay sai ở lộ trình HSK</h2><Link href="/courses" className={`${pill} bg-surface-container`}>Về lộ trình</Link></div>
          <ul className="flex flex-wrap gap-2">{courseTerms!.slice(0, 20).map((t) => <li key={t}><Link href={`/dictionary/${encodeURIComponent(t)}`} lang="zh-Hans" className={`${pill} bg-surface-container font-serif text-lg`}>{t}</Link></li>)}</ul>
        </section>
      )}
    </div>
  );
}
