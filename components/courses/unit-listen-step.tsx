"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { wordLabel } from "@/lib/courses/build-unit-quiz";
import type { UnitWord } from "@/lib/courses/unit-types";
import { playChinese } from "@/lib/speech/play-chinese";

/** Tô đậm từ đang học trong câu (chỉ lần xuất hiện đầu tiên). */
function Highlighted({ text, term }: { text: string; term: string }) {
  const at = text.indexOf(term);
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark className="rounded bg-primary-container px-0.5 text-on-primary-container">{term}</mark>{text.slice(at + term.length)}</>;
}

/** Bước 2: mỗi từ kèm một câu thật lấy từ video đã duyệt (pinyin, nghĩa Việt, nghe lại). Từ chưa có câu thật thì bỏ qua. */
export function UnitListenStep({ words, onNext }: { words: UnitWord[]; onNext: () => void }) {
  const withExamples = words.filter((w) => w.examples.length > 0);
  return (
    <div className="space-y-space-md">
      {withExamples.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">Chặng này chưa có câu thật trong video. Sang bước kiểm tra nhé.</p>
      ) : (
        <ul className="space-y-2">
          {withExamples.map((w) => {
            const ex = w.examples[0];
            return (
              <li key={w.term} className="rounded-2xl border border-outline-variant bg-surface-container-low p-space-sm">
                <p className="text-label-md text-on-surface-variant"><span lang="zh-Hans" className="font-serif text-body-lg text-on-surface">{w.term}</span> · {wordLabel(w)}</p>
                <div className="mt-1 flex items-start gap-space-sm">
                  <button type="button" onClick={() => void playChinese(ex.text)} aria-label={`Nghe câu: ${ex.text}`} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest">
                    <Icon name="volume_up" size={22} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p lang="zh-Hans" className="font-serif text-headline-md"><Highlighted text={ex.text} term={w.term} /></p>
                    <p className="text-body-sm text-primary">{ex.pinyin}</p>
                    <p className="text-body-md">{ex.translation}</p>
                    <Link href={`/video/${ex.videoId}`} className="mt-1 inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline">
                      <Icon name="smart_display" size={18} /> Xem trong video
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" onClick={onNext} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">
        Làm bài kiểm tra <Icon name="arrow_forward" size={20} />
      </button>
    </div>
  );
}
