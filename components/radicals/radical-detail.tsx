"use client";

import Link from "next/link";
import { useRadicalProgress } from "@/components/radicals/use-radical-progress";
import { StrokeSection } from "@/components/tra-tu/stroke-section";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { radicalSavedItem, radicalCardKey } from "@/lib/radicals/radical-card";
import type { RadicalChar } from "@/lib/radicals/load-radical-chars";
import { TOPICS, entryByNum, type RadicalEntry } from "@/lib/radicals/radicals";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

/** Một bộ thủ: tên, âm, nghĩa, biến thể, nét viết, mẹo nhớ, các chữ chứa bộ (pinyin từ từ điển) và nút đã biết / lưu thẻ ôn. */
export function RadicalDetail({ entry: e, chars }: { entry: RadicalEntry; chars: RadicalChar[] }) {
  const { progress, toggle } = useRadicalProgress();
  const { state, toggleSaved } = useLearnerState();
  const known = progress.known.includes(e.num);
  const saved = state.saved.some((s) => s.key === radicalCardKey(e));
  const prev = entryByNum(e.num - 1), next = entryByNum(e.num + 1);
  const topic = TOPICS.find((t) => t.id === e.topic);
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <Link href="/radicals" className="inline-flex min-h-11 w-fit items-center text-label-md font-bold underline">← Bộ thủ{topic ? ` · ${topic.title}` : ""}</Link>
      <header className="card-ink flex flex-wrap items-center gap-space-md p-space-md">
        <span lang="zh-Hans" aria-hidden="true" className="flex size-28 shrink-0 items-center justify-center rounded-3xl bg-primary-container font-serif text-[72px] leading-none">{e.char}</span>
        <div className="min-w-0 flex-1">
          <p className="text-label-md text-on-surface-variant">Bộ thủ số {e.num} · {e.strokes} nét</p>
          <h1 className="flex flex-wrap items-center gap-2 text-headline-lg"><span lang="zh-Hans" className="sr-only">{e.char}</span>Bộ {e.name}<PronounceButton text={e.char} /></h1>
          <p className="text-pinyin-reading text-primary">{e.pinyin}</p>
          <p className="text-body-lg">{e.meaning}</p>
          {e.variants.length > 0 && <p className="mt-1 text-body-md"><span className="text-on-surface-variant">Biến thể: </span><span lang="zh-Hans" className="font-serif text-headline-sm">{e.variants.join("  ")}</span></p>}
        </div>
        <div className="flex w-full flex-wrap gap-2">
          <button type="button" aria-pressed={known} onClick={() => toggle(e.num)} className={`btn-3d min-h-11 px-4 text-label-md font-extrabold ${known ? "btn-3d-bright" : "btn-3d-primary"}`}><span className="inline-flex items-center gap-1"><Icon name={known ? "check_circle" : "check"} size={20} filled={known} /> {known ? "Đã biết" : "Đánh dấu đã biết"}</span></button>
          <button type="button" aria-pressed={saved} onClick={() => toggleSaved(radicalSavedItem(e))} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold"><span className="inline-flex items-center gap-1"><Icon name={saved ? "check_circle" : "bookmark_add"} size={20} filled={saved} /> {saved ? "Đã lưu thẻ ôn" : "Lưu vào thẻ ôn"}</span></button>
        </div>
      </header>

      {e.rich ? (
        <section aria-labelledby="rad-mn" className="card-ink space-y-space-sm p-space-md">
          <h2 id="rad-mn" className="text-headline-sm">Mẹo nhớ</h2>
          <p className="text-body-lg">{e.rich.mnemonic}</p>
          <p className="rounded-2xl bg-secondary-container p-space-sm text-body-md text-on-secondary-container"><span className="font-extrabold">Gặp bộ này: </span>{e.rich.use}</p>
        </section>
      ) : (
        <p className="card-ink p-space-md text-body-md text-on-surface-variant">Bộ này ít gặp nên chưa có mẹo nhớ riêng. Hãy chú ý nghĩa “{e.meaning}” khi gặp nó trong chữ lạ.</p>
      )}

      <StrokeSection term={e.char} />

      {chars.length > 0 && (
        <section aria-labelledby="rad-chars" className="card-ink p-space-md">
          <h2 id="rad-chars" className="text-headline-sm">Chữ chứa bộ này</h2>
          <p className="text-body-md text-on-surface-variant">Bấm một chữ để xem chi tiết trong Tra từ.</p>
          <ul className="mt-space-sm grid grid-cols-2 gap-2 sm:grid-cols-3">
            {chars.map((c) => (
              <li key={c.char} className="flex items-start gap-2 rounded-2xl border-2 border-ink bg-surface-container-lowest p-2">
                <Link href={`/dictionary/${encodeURIComponent(c.char)}`} className="flex min-h-11 min-w-0 flex-1 items-start gap-2">
                  <span lang="zh-Hans" className="font-serif text-[36px] leading-none">{c.char}</span>
                  <span className="min-w-0"><span className="block text-label-md font-bold text-primary">{c.pinyin ?? ""}</span><span className="line-clamp-2 text-label-sm text-on-surface-variant">{c.meaning ?? ""}</span></span>
                </Link>
                <PronounceButton text={c.char} className="size-10" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <Link href={`/radicals/practice?topic=${e.topic}`} className="btn-3d btn-3d-primary inline-flex min-h-12 items-center gap-1 px-5 font-extrabold"><Icon name="quiz" size={20} /> Luyện chủ đề “{topic?.title}”</Link>
        <Link href="/review/ghep-bo-thu" className="btn-3d btn-3d-neutral inline-flex min-h-12 items-center gap-1 px-5 font-extrabold"><Icon name="build" size={20} /> Chơi Ghép bộ thủ</Link>
      </div>

      <nav aria-label="Bộ khác" className="flex flex-wrap justify-between gap-2">
        {prev ? <Link href={`/radicals/${prev.num}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold">← <span lang="zh-Hans" className="mx-1 font-serif">{prev.char}</span> {prev.name}</Link> : <span />}
        {next && <Link href={`/radicals/${next.num}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold">{next.name} <span lang="zh-Hans" className="mx-1 font-serif">{next.char}</span> →</Link>}
      </nav>
    </article>
  );
}
