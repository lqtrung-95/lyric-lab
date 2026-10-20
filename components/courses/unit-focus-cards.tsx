"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { wordLabel } from "@/lib/courses/build-unit-quiz";
import type { UnitWord } from "@/lib/courses/unit-types";
import { playChinese } from "@/lib/speech/play-chinese";
import { WordReadAloud } from "./word-read-aloud";

/** Tô đậm từ đang học trong câu (lần xuất hiện đầu tiên). */
function Highlighted({ text, term }: { text: string; term: string }) {
  const at = text.indexOf(term);
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark className="rounded bg-primary-container px-0.5 text-on-primary-container">{term}</mark>{text.slice(at + term.length)}</>;
}

/**
 * Học từng từ một: mặt trước chỉ có chữ Hán (kèm emoji gợi ý nếu có) để người học tự đoán nghĩa; bấm "Xem nghĩa" (hoặc Space) mới hiện pinyin, âm Hán Việt, nghĩa, mẹo nhớ,
 * câu ví dụ và nút Đọc to. Người học tự đánh giá "Nhớ rồi" / "Chưa nhớ"; cuối lượt báo các từ chưa nhớ để học lại.
 */
export function UnitFocusCards({ words, onDone }: { words: UnitWord[]; onDone: (unsure: string[]) => void }) {
  const order = words;
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [unsure, setUnsure] = useState<string[]>([]);
  const w = order[i];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key !== " ") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "BUTTON" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return; // để nút đang focus tự xử lý Space
      e.preventDefault();
      setRevealed(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function rate(known: boolean) {
    const nextUnsure = known ? unsure : unsure.includes(w.term) ? unsure : [...unsure, w.term];
    setUnsure(nextUnsure);
    if (i + 1 >= order.length) { onDone(nextUnsure); return; }
    setI(i + 1);
    setRevealed(false);
    void playChinese(order[i + 1].term); // người học vừa bấm nên trình duyệt cho phát tiếng
  }
  const ex = w.examples[0];

  return (
    <div className="space-y-space-md" data-testid="focus-card">
      <div>
        <p className="text-label-md font-bold text-on-surface-variant" aria-live="polite">Từ {i + 1}/{order.length}</p>
        <div role="progressbar" aria-label="Tiến độ làm quen từ" aria-valuemin={0} aria-valuemax={order.length} aria-valuenow={i} className="mt-1 h-2 overflow-hidden rounded-full border-2 border-[var(--ink-soft)] bg-surface-container-high">
          <div className="h-full rounded-full bg-primary-container transition-[width] motion-reduce:transition-none" style={{ width: `${(100 * i) / order.length}%` }} />
        </div>
      </div>

      <div className="card-ink p-space-md text-center">
        {w.emoji && <p aria-hidden="true" className="text-6xl leading-none">{w.emoji}</p>}
        <p lang="zh-Hans" className="mt-2 font-serif text-[88px] font-semibold leading-none">{w.term}</p>
        <button type="button" onClick={() => void playChinese(w.term)} aria-label={`Nghe ${w.term}`} className="mx-auto mt-space-sm flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">
          <Icon name="volume_up" size={22} filled /> Nghe
        </button>

        {!revealed ? (
          <div className="mt-space-md">
            <p className="text-body-md text-on-surface-variant">Thử đoán nghĩa trong đầu trước nhé.</p>
            <button type="button" onClick={() => setRevealed(true)} className="btn-3d btn-3d-bright mt-space-sm">Xem nghĩa <kbd aria-hidden="true" className="ml-1 rounded bg-surface-container-highest px-1.5 text-[10px] font-semibold">Space</kbd></button>
          </div>
        ) : (
          <div className="mt-space-md space-y-space-sm text-left" aria-live="polite">
            <p className="flex flex-wrap items-baseline justify-center gap-x-3 text-center">
              <span className="text-headline-md text-primary">{w.pinyin}</span>
              {w.sinoViet && <span className="rounded-full border-2 border-ink bg-tertiary-container px-3 py-0.5 text-label-md font-bold text-on-tertiary-container"><span className="sr-only">Âm </span>Hán Việt: {w.sinoViet}</span>}
            </p>
            <p className="text-center text-headline-md">{wordLabel(w)}</p>
            {w.tip && (
              <p className="flex items-start gap-2 rounded-xl bg-surface-container-low p-space-sm text-body-md">
                <Icon name="lightbulb" size={20} className="mt-0.5 shrink-0 text-primary" />
                <span><strong>Mẹo nhớ</strong> <span className="text-label-sm text-on-surface-variant">(AI gợi ý)</span>: {w.tip}</span>
              </p>
            )}
            {ex && (
              <div className="rounded-xl bg-surface-container-low p-space-sm">
                <p lang="zh-Hans" className="font-serif text-xl"><Highlighted text={ex.text} term={w.term} /></p>
                <p className="text-body-sm text-primary">{ex.pinyin}</p>
                <p className="text-body-md">{ex.translation}</p>
              </div>
            )}
            <WordReadAloud key={w.term} term={w.term} />
            <div className="flex flex-wrap justify-center gap-2 pt-space-sm">
              <button type="button" onClick={() => rate(false)} className="btn-3d btn-3d-neutral"><Icon name="replay" size={20} /> Chưa nhớ</button>
              <button type="button" onClick={() => rate(true)} className="btn-3d btn-3d-secondary"><Icon name="check" size={20} /> Nhớ rồi</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
