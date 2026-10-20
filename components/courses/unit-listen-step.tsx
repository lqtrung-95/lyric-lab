"use client";

import { useState } from "react";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { Icon } from "@/components/ui/icon";
import { wordLabel } from "@/lib/courses/build-unit-quiz";
import type { UnitWord } from "@/lib/courses/unit-types";
import { snippetRange } from "@/lib/preview/preview-format";
import { playChinese } from "@/lib/speech/play-chinese";

/** Tô đậm từ đang học trong câu (chỉ lần xuất hiện đầu tiên). */
function Highlighted({ text, term }: { text: string; term: string }) {
  const at = text.indexOf(term);
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark className="rounded bg-primary-container px-0.5 text-on-primary-container">{term}</mark>{text.slice(at + term.length)}</>;
}

/**
 * Bước 2: mỗi từ kèm một câu thật lấy từ video đã duyệt: nghe giọng đọc, XEM ĐÚNG ĐOẠN VIDEO ngay trong trang (khung nhỏ tự dừng cuối đoạn), bật/tắt pinyin và bản dịch để tự thử nghe hiểu.
 * Từ chưa có câu thật thì bỏ qua.
 */
export function UnitListenStep({ words, onNext }: { words: UnitWord[]; onNext: () => void }) {
  const withExamples = words.filter((w) => w.examples.length > 0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [clip, setClip] = useState<{ videoId: string; request: SnippetRequest } | null>(null);
  const playClip = (videoId: string, label: string, start: number, end: number) =>
    setClip((prev) => ({ videoId, request: { nonce: (prev?.request.nonce ?? 0) + 1, label, ...snippetRange({ start, end }) } }));
  const toggle = "inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold";
  return (
    <div className="space-y-space-md">
      {withExamples.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Hiển thị">
          <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={`${toggle} ${showPinyin ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>Pinyin</button>
          <button type="button" aria-pressed={showTranslation} onClick={() => setShowTranslation((v) => !v)} className={`${toggle} ${showTranslation ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>Bản dịch</button>
        </div>
      )}
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
                    {showPinyin && <p className="text-body-sm text-primary">{ex.pinyin}</p>}
                    {showTranslation && <p className="text-body-md">{ex.translation}</p>}
                    <button type="button" onClick={() => playClip(ex.videoId, `${w.term}`, ex.start, ex.end)} className="mt-1 inline-flex min-h-11 items-center gap-1 text-label-md font-bold text-primary hover:underline">
                      <Icon name="smart_display" size={18} /> Xem đoạn video
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" onClick={onNext} className="btn-3d btn-3d-bright">Làm bài kiểm tra <Icon name="arrow_forward" size={20} /></button>
      {clip && <SnippetPlayer key={clip.videoId} videoId={clip.videoId} request={clip.request} />}
    </div>
  );
}
