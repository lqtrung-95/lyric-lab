"use client";

import { useState } from "react";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { WordReadAloud } from "@/components/courses/word-read-aloud";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { ExampleSentence } from "@/lib/courses/course-types";
import { snippetRange } from "@/lib/preview/preview-format";
import { splitByTerms } from "@/lib/tra-tu/split-by-terms";

const FIRST_PAGE = 3;
const toggle = "inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold";
const on = "bg-primary-container text-on-primary-container";

function Sentence({ text, forms }: { text: string; forms: string[] }) {
  return <>{splitByTerms(text, forms).map((s, i) => (s.hit ? <mark key={i} className="rounded bg-primary-container px-0.5 text-on-primary-container">{s.text}</mark> : <span key={i}>{s.text}</span>))}</>;
}

/**
 * Câu thật chứa từ này, lấy từ video/bài hát đã duyệt của SongHanzi: nghe giọng đọc, xem đúng đoạn video ngay trong trang, bật/tắt pinyin và bản dịch để tự thử nghe hiểu,
 * đọc to để chấm. Hiện phẳng (chưa nhóm theo nghĩa): kho câu không gắn nhãn nghĩa nên không có cơ sở đáng tin để nhóm.
 */
export function ExampleSentences({ term, forms, examples }: { term: string; forms: string[]; examples: ExampleSentence[] }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [all, setAll] = useState(false);
  const [reading, setReading] = useState<number | null>(null);
  const [clip, setClip] = useState<{ videoId: string; request: SnippetRequest } | null>(null);
  const shown = all ? examples : examples.slice(0, FIRST_PAGE);
  const playClip = (ex: ExampleSentence) => setClip((prev) => ({ videoId: ex.videoId, request: { nonce: (prev?.request.nonce ?? 0) + 1, label: term, ...snippetRange(ex) } }));

  return (
    <section aria-label="Câu ví dụ" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <h2 className="text-headline-sm font-extrabold">Câu thật trong bài hát, video</h2>
      {examples.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">Từ này chưa xuất hiện trong video hay bài hát đã duyệt của SongHanzi.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Hiển thị">
            <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={`${toggle} ${showPinyin ? on : "bg-surface-container-lowest"}`}>Pinyin</button>
            <button type="button" aria-pressed={showTranslation} onClick={() => setShowTranslation((v) => !v)} className={`${toggle} ${showTranslation ? on : "bg-surface-container-lowest"}`}>Bản dịch</button>
          </div>
          <ul className="space-y-2">
            {shown.map((ex, i) => (
              <li key={`${ex.videoId}-${ex.lineIdx}`} className="rounded-2xl border border-outline-variant bg-surface-container-low p-space-sm">
                <div className="flex items-start gap-space-sm">
                  <PronounceButton text={ex.text} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p lang="zh-Hans" className="font-serif text-headline-md"><Sentence text={ex.text} forms={forms} /></p>
                    {showPinyin && <p className="text-body-sm text-primary">{ex.pinyin}</p>}
                    {showTranslation && <p className="text-body-md">{ex.translation}</p>}
                    <div className="flex flex-wrap gap-x-space-sm">
                      <button type="button" onClick={() => playClip(ex)} className="inline-flex min-h-11 items-center gap-1 text-label-md font-bold text-primary hover:underline"><Icon name="smart_display" size={18} /> Xem đoạn video</button>
                      <button type="button" aria-expanded={reading === i} onClick={() => setReading(reading === i ? null : i)} className="inline-flex min-h-11 items-center gap-1 text-label-md font-bold text-primary hover:underline"><Icon name="mic" size={18} /> Đọc to câu này</button>
                    </div>
                    {reading === i && <WordReadAloud term={ex.text} />}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {examples.length > FIRST_PAGE && (
            <button type="button" onClick={() => setAll((v) => !v)} className="min-h-11 text-label-md font-extrabold text-primary hover:underline">{all ? "Thu gọn" : `Xem thêm ${examples.length - FIRST_PAGE} câu`}</button>
          )}
        </>
      )}
      {clip && <SnippetPlayer key={clip.videoId} videoId={clip.videoId} request={clip.request} />}
    </section>
  );
}
