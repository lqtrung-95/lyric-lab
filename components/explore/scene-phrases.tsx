"use client";

import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import type { SceneConversation } from "@/lib/explore/explore-types";

interface Props {
  phrases: { zh: string; vi: string }[];
  conversation?: SceneConversation;
  /** Câu tiếng Trung → pinyin (từ từ điển). */
  pinyin: Record<string, string>;
}

/**
 * "Vận dụng" ở cảnh này: vài câu hay dùng và một hội thoại mẫu ngắn đúng tình huống (có pinyin từ từ điển, nghĩa tiếng Việt, nút nghe),
 * để người học dùng ngay các từ vừa học vào câu nói thật.
 */
export function ScenePhrases({ phrases, conversation, pinyin }: Props) {
  if (phrases.length === 0 && !conversation) return null;
  return (
    <section aria-label="Câu hay dùng và hội thoại mẫu" className="card-ink flex flex-col gap-space-md p-space-md">
      {phrases.length > 0 && (
        <div>
          <h2 className="text-headline-md">Câu hay dùng ở đây</h2>
          <ul className="mt-space-sm grid gap-2 sm:grid-cols-2">
            {phrases.map((p) => (
              <li key={p.zh} className="flex items-start gap-2 rounded-xl border-2 border-ink bg-surface-container-lowest px-space-sm py-2">
                <div className="min-w-0 flex-1">
                  <p lang="zh-Hans" className="text-body-lg font-bold leading-[2.1]"><RubyLine zh={p.zh} pinyin={pinyin[p.zh]} show /></p>
                  <p className="mt-1.5 text-body-sm text-on-surface-variant">{p.vi}</p>
                </div>
                <PronounceButton text={p.zh} className="size-10" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {conversation && (
        <div>
          <h2 className="text-headline-md">Hội thoại mẫu</h2>
          <ol className="mt-space-sm flex flex-col gap-2">
            {conversation.lines.map((l, i) => (
              <li key={i} className={`flex ${l.who === 1 ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[92%] items-start gap-2 rounded-2xl border-2 border-ink px-space-sm py-2 sm:max-w-[78%] ${l.who === 1 ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>
                  <div className="min-w-0">
                    <p className="text-label-md font-extrabold opacity-80">{conversation.speakers[l.who]}</p>
                    <p lang="zh-Hans" className="text-body-lg font-bold leading-[2.1]"><RubyLine zh={l.zh} pinyin={pinyin[l.zh]} show rtClassName="[&_rt]:text-current [&_rt]:opacity-80" fallbackClassName="opacity-90" /></p>
                    <p className="mt-1.5 text-body-sm opacity-80">{l.vi}</p>
                  </div>
                  <PronounceButton text={l.zh} className="size-9" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
