"use client";

import Link from "next/link";
import { GrammarSaveButton } from "@/components/grammar/grammar-save-button";
import { GrammarTest } from "@/components/grammar/grammar-test";
import { useGrammarStats } from "@/components/grammar/use-grammar-stats";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { plain, segments, type GrammarPattern } from "@/lib/grammar/grammar-types";

const hit = (zh: string, keys: string[]) => segments(zh).map((s, i) => (keys.some((k) => s.replace(/[，。！？]/g, "") === k) ? <mark key={i} className="rounded bg-primary-container px-0.5">{s}</mark> : <span key={i}>{s}</span>));

/** Nội dung một mẫu: công thức, giải thích, so sánh với tiếng Việt, lỗi hay sai, ví dụ có pinyin và giọng đọc, rồi luyện tập. */
export function GrammarDetail({ pattern: p, pinyin, prev, next }: { pattern: GrammarPattern; pinyin: Record<string, string>; prev: GrammarPattern | null; next: GrammarPattern | null }) {
  const { stats } = useGrammarStats();
  const st = stats[p.id];
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <Link href="/grammar" className="inline-flex min-h-11 w-fit items-center text-label-md font-bold underline">← Ngữ pháp · HSK {p.level}</Link>
      <header className="card-ink p-space-md">
        <h1 className="text-headline-lg">{p.title}</h1>
        <p lang="zh-Hans" className="mt-1 font-serif text-headline-md text-primary">{p.pattern}</p>
        <p className="mt-space-sm text-body-lg">{p.explain}</p>
        <div className="mt-space-sm flex flex-wrap items-center gap-2">
          <GrammarSaveButton pattern={p} />
          {st && st.right + st.wrong > 0 && <span className="rounded-full bg-surface-container px-3 py-1 text-label-md font-bold">Bạn đúng {st.right}, sai {st.wrong}</span>}
        </div>
      </header>

      <section aria-labelledby="gr-vs" className="card-ink p-space-md">
        <h2 id="gr-vs" className="text-headline-sm">So với tiếng Việt</h2>
        <p className="mt-1 text-body-md">{p.vsVi}</p>
      </section>

      <section aria-labelledby="gr-ex" className="card-ink p-space-md">
        <h2 id="gr-ex" className="text-headline-sm">Ví dụ</h2>
        <ul className="mt-space-sm space-y-space-sm">
          {p.examples.map((e) => (
            <li key={e.zh} className="flex items-start gap-2">
              <PronounceButton text={plain(e.zh)} />
              <div className="min-w-0">
                <p lang="zh-Hans" className="font-serif text-headline-sm">{hit(e.zh, p.key)}</p>
                {pinyin[plain(e.zh)] && <p className="text-pinyin-reading text-primary">{pinyin[plain(e.zh)]}</p>}
                <p className="text-body-md text-on-surface-variant">{e.vi}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="gr-mis" className="card-ink p-space-md">
        <h2 id="gr-mis" className="text-headline-sm">Lỗi hay gặp</h2>
        <ul className="mt-space-sm space-y-space-sm">
          {p.mistakes.map((m) => (
            <li key={m.wrong} className="rounded-2xl bg-surface-container p-space-sm">
              <p lang="zh-Hans" className="font-serif text-body-lg"><span className="mr-1 font-sans text-label-md font-extrabold text-error">Sai</span><s>{m.wrong}</s></p>
              <p lang="zh-Hans" className="font-serif text-body-lg"><span className="mr-1 font-sans text-label-md font-extrabold text-secondary">Đúng</span>{m.right}</p>
              {(pinyin[m.right]) && <p className="text-pinyin-reading text-primary">{pinyin[m.right]}</p>}
              <p className="mt-1 text-body-md text-on-surface-variant">{m.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="gr-prac" className="space-y-space-sm">
        <h2 id="gr-prac" className="text-headline-sm">Luyện mẫu này</h2>
        <GrammarTest level={p.level} patternId={p.id} title={`Kết quả: ${p.title}`} />
      </section>

      <nav aria-label="Mẫu khác" className="flex flex-wrap justify-between gap-2">
        {prev ? <Link href={`/grammar/${prev.id}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold">← {prev.title}</Link> : <span />}
        {next && <Link href={`/grammar/${next.id}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold">{next.title} →</Link>}
      </nav>
    </article>
  );
}
