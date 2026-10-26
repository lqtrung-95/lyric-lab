"use client";

import { PronounceButton } from "@/components/ui/pronounce-button";

interface Props {
  phrases: { zh: string; vi: string }[];
  /** Câu tiếng Trung → pinyin (từ từ điển). */
  pinyin: Record<string, string>;
}

/** "Câu hay dùng" ở cảnh này: vài câu giao tiếp thật sự dùng ở đây, kèm pinyin, nghĩa tiếng Việt và nút nghe. */
export function ScenePhrases({ phrases, pinyin }: Props) {
  if (phrases.length === 0) return null;
  return (
    <section aria-label="Câu hay dùng" className="card-ink p-space-md">
      <h2 className="text-headline-md">Câu hay dùng ở đây</h2>
      <ul className="mt-space-sm grid gap-2 sm:grid-cols-2">
        {phrases.map((p) => (
          <li key={p.zh} className="flex items-start gap-2 rounded-xl border-2 border-ink bg-surface-container-lowest px-space-sm py-2">
            <div className="min-w-0 flex-1">
              <p lang="zh-Hans" className="text-body-lg font-bold">{p.zh}</p>
              {pinyin[p.zh] && <p className="text-body-sm text-primary">{pinyin[p.zh]}</p>}
              <p className="text-body-sm text-on-surface-variant">{p.vi}</p>
            </div>
            <PronounceButton text={p.zh} className="size-10" />
          </li>
        ))}
      </ul>
    </section>
  );
}
