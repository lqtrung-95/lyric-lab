import Link from "next/link";
import type { RadicalChar } from "@/lib/radicals/load-radical-chars";
import type { RadicalEntry } from "@/lib/radicals/radicals";
import type { SoundAlike } from "@/lib/tra-tu/rank-homophones";
import { wordHref } from "./word-result-row";

const chip = "flex min-h-11 flex-col rounded-2xl border-2 border-ink bg-surface-container-lowest px-3 py-1 hover:bg-surface-container-low";

function Words({ title, words }: { title: string; words: SoundAlike[] }) {
  if (words.length === 0) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-label-lg font-extrabold text-on-surface-variant">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {words.map((w) => (
          <li key={w.simplified}>
            <Link href={wordHref(w.simplified)} className={chip}>
              <span className="flex items-baseline gap-2"><span lang="zh-Hans" className="font-serif text-headline-sm font-bold">{w.simplified}</span><span className="text-label-md text-primary">{w.pinyin}</span></span>
              <span className="max-w-[14rem] truncate text-label-sm text-on-surface-variant">{w.gloss ?? w.meaning}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "Cùng âm" và "Cùng bộ": giúp nhớ chữ qua những chữ giống nhau về âm đọc (dễ nhầm khi nghe) hoặc về bộ thủ (đoán nghĩa). Mọi dữ kiện từ từ điển; mục nào rỗng thì ẩn,
 * cả hai rỗng thì không hiện gì.
 */
export function WordRelated({ same, otherTone, radical, radicalChars, char }: { same: SoundAlike[]; otherTone: SoundAlike[]; radical: RadicalEntry | null; radicalChars: RadicalChar[]; char: string }) {
  const sibs = radicalChars.filter((c) => c.char !== char).slice(0, 10);
  const hasSound = same.length > 0 || otherTone.length > 0;
  if (!hasSound && !(radical && sibs.length > 0)) return null;
  return (
    <section aria-label="Cùng âm và cùng bộ" className="card-ink space-y-space-md bg-surface-container-lowest p-space-md">
      <h2 className="text-headline-sm font-extrabold">Dễ nhầm và dễ nhớ</h2>
      {hasSound && (
        <div className="space-y-space-sm">
          <h3 className="text-headline-sm">Cùng âm</h3>
          <Words title="Cùng cách đọc (cùng thanh)" words={same} />
          <Words title="Cùng âm, khác thanh" words={otherTone} />
        </div>
      )}
      {radical && sibs.length > 0 && (
        <div className="space-y-space-sm">
          <h3 className="flex flex-wrap items-center gap-2 text-headline-sm">Cùng bộ <Link href={`/radicals/${radical.num}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-primary-container px-3 text-label-md font-bold"><span lang="zh-Hans" className="mr-1 font-serif text-lg">{radical.char}</span>Bộ {radical.name} · {radical.meaning}</Link></h3>
          <ul className="flex flex-wrap gap-2">
            {sibs.map((c) => (
              <li key={c.char}>
                <Link href={wordHref(c.char)} className={chip}>
                  <span className="flex items-baseline gap-2"><span lang="zh-Hans" className="font-serif text-headline-sm font-bold">{c.char}</span><span className="text-label-md text-primary">{c.pinyin ?? ""}</span></span>
                  {c.meaning && <span className="max-w-[14rem] truncate text-label-sm text-on-surface-variant">{c.meaning}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
