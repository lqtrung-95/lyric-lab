"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGrammarStats } from "@/components/grammar/use-grammar-stats";
import { Icon } from "@/components/ui/icon";
import { GRAMMAR_PATTERNS, patternsOfLevel } from "@/lib/grammar/grammar-patterns";
import { isMastered, levelProgress, weakPatternIds } from "@/lib/grammar/grammar-stats";
import { GRAMMAR_LEVELS, plain, type GrammarLevel } from "@/lib/grammar/grammar-types";

/** Trang chủ Ngữ pháp: chặng theo cấp HSK có thanh tiến độ, tìm mẫu, danh sách mẫu hay sai, lối vào bài thi cuối cấp. */
export function GrammarHub() {
  const { stats } = useGrammarStats();
  const [level, setLevel] = useState<GrammarLevel>(1);
  const [q, setQ] = useState("");
  const weak = useMemo(() => weakPatternIds(stats).flatMap((id) => GRAMMAR_PATTERNS.find((p) => p.id === id) ?? []), [stats]);
  const query = q.trim().toLowerCase();
  const list = query
    ? GRAMMAR_PATTERNS.filter((p) => [p.title, p.pattern, p.key.join(""), p.examples.map((e) => plain(e.zh)).join("")].join(" ").toLowerCase().includes(query))
    : patternsOfLevel(level);

  return (
    <div className="flex w-full flex-col gap-space-md">
      <header>
        <h1 className="text-headline-lg">Ngữ pháp thông dụng</h1>
        <p className="text-body-md text-on-surface-variant">Các mẫu câu hay gặp trong bài hát và đời sống, xếp theo cấp HSK: công thức, so sánh với tiếng Việt, lỗi hay sai và bài tập.</p>
      </header>

      {weak.length > 0 && (
        <section aria-labelledby="gr-weak" className="card-ink p-space-md">
          <h2 id="gr-weak" className="flex items-center gap-1 text-headline-sm"><Icon name="local_fire_department" size={22} /> Mẫu bạn hay sai</h2>
          <ul className="mt-space-sm flex flex-wrap gap-2">
            {weak.map((p) => (
              <li key={p.id}><Link href={`/grammar/${p.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-error-container px-4 text-label-md font-bold">{p.title}<span className="text-on-surface-variant">{stats[p.id].wrong} lần sai</span></Link></li>
            ))}
          </ul>
        </section>
      )}

      <div role="tablist" aria-label="Cấp HSK" className="flex flex-wrap gap-2">
        {GRAMMAR_LEVELS.map((l) => {
          const prog = levelProgress(stats, patternsOfLevel(l));
          const active = !query && l === level;
          return (
            <button key={l} type="button" role="tab" aria-selected={active} onClick={() => { setQ(""); setLevel(l); }}
              className={`min-h-11 cursor-pointer rounded-2xl border-2 border-ink px-4 py-1 text-left ${active ? "bg-primary-container shadow-[0_3px_0_var(--shadow-ink)]" : "bg-surface-container-lowest hover:brightness-105"}`}>
              <span className="block text-label-md font-extrabold">HSK {l}</span>
              <span className="block text-label-sm text-on-surface-variant">{prog.mastered}/{prog.total} mẫu đã nắm</span>
            </button>
          );
        })}
      </div>

      <label className="block">
        <span className="sr-only">Tìm mẫu ngữ pháp</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm mẫu: 把, 比, “vì… nên”…" className="min-h-12 w-full rounded-2xl border-2 border-ink bg-surface-container-lowest px-4 text-body-md" />
      </label>

      {!query && (() => {
        const prog = levelProgress(stats, patternsOfLevel(level));
        return (
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="min-w-0 flex-1">
              <div className="h-3 overflow-hidden rounded-full bg-surface-container" role="progressbar" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.mastered} aria-label={`Đã nắm ${prog.mastered} trên ${prog.total} mẫu HSK ${level}`}>
                <div className="h-full rounded-full bg-primary" style={{ width: `${(prog.mastered / prog.total) * 100}%` }} />
              </div>
              <p className="mt-1 text-label-sm text-on-surface-variant">Đã nắm {prog.mastered}/{prog.total}, đã thử {prog.tried}/{prog.total}</p>
            </div>
            <Link href={`/grammar/test/${level}`} className="btn-3d btn-3d-primary inline-flex min-h-12 items-center gap-1 px-5 font-extrabold"><Icon name="quiz" size={20} /> Thi cuối cấp HSK {level}</Link>
          </div>
        );
      })()}

      {list.length === 0 && <p className="text-body-md text-on-surface-variant">Không có mẫu nào khớp “{q}”.</p>}
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {list.map((p) => (
          <li key={p.id}>
            <Link href={`/grammar/${p.id}`} className="card-ink flex min-h-11 items-start gap-space-sm p-space-md hover:brightness-105">
              <span className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-ink ${isMastered(stats[p.id]) ? "bg-secondary-container" : "bg-surface-container"}`} aria-hidden="true">{isMastered(stats[p.id]) && <Icon name="check_circle" size={16} filled />}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-headline-sm font-bold">{p.title}</span>
                <span lang="zh-Hans" className="block font-serif text-body-lg text-primary">{p.pattern}</span>
                <span className="block text-label-md text-on-surface-variant">HSK {p.level}{isMastered(stats[p.id]) ? " · đã nắm" : ""}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
