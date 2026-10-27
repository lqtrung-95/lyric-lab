import { PronounceButton } from "@/components/ui/pronounce-button";
import type { Phrase, PhraseGroup } from "@/lib/tools/everyday/everyday-types";

/** Một thẻ từ hoặc câu: chữ Hán lớn, pinyin, nghĩa tiếng Việt, ghi chú cách dùng và nút nghe. */
export function PhraseCard({ phrase }: { phrase: Phrase }) {
  return (
    <li className="card-ink flex items-start gap-3 p-space-sm">
      <div className="min-w-0 flex-1">
        <p lang="zh" className="font-serif text-headline-md leading-tight">{phrase.zh}</p>
        <p className="text-body-md text-primary">{phrase.pinyin}</p>
        <p className="text-body-md text-on-surface">{phrase.vi}</p>
        {phrase.note && <p className="mt-1 text-body-sm text-on-surface-variant">{phrase.note}</p>}
      </div>
      <PronounceButton text={phrase.zh} className="size-10" />
    </li>
  );
}

/** Các nhóm từ và câu (mỗi nhóm một tiêu đề, một đoạn dẫn tùy chọn và lưới thẻ). */
export function PhraseGroups({ groups }: { groups: readonly PhraseGroup[] }) {
  return (
    <div className="space-y-space-lg">
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`group-${g.id}`}>
          <h2 id={`group-${g.id}`} className="font-serif text-headline-md">{g.title}</h2>
          {g.intro && <p className="mt-1 text-body-md text-on-surface-variant">{g.intro}</p>}
          <ul className="mt-space-sm grid gap-gutter sm:grid-cols-2">{g.phrases.map((p) => <PhraseCard key={p.zh} phrase={p} />)}</ul>
        </section>
      ))}
    </div>
  );
}
