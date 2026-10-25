"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { hskLabel } from "@/lib/tra-tu/han-display";
import { playSequence } from "@/lib/tra-tu/play-sequence";
import type { CompoundWord } from "@/lib/tra-tu/rank-compounds";
import { splitByTerms } from "@/lib/tra-tu/split-by-terms";
import { isChineseAudioBusy, playChinese } from "@/lib/speech/play-chinese";
import { wordHref } from "./word-result-row";

const FIRST_PAGE = 12;

/**
 * Từ ghép: các từ trong từ điển chứa từ/chữ này, xếp từ phổ biến đến ít gặp. Bấm để tra tiếp; "Nghe lần lượt" đọc các từ đang hiện theo thứ tự.
 * Không có ảnh minh họa (rủi ro bản quyền): chỉ chữ, pinyin và nghĩa.
 */
export function CompoundWords({ term, forms, words }: { term: string; forms: string[]; words: CompoundWord[] }) {
  const [all, setAll] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const stop = useRef(false);
  if (words.length === 0) return null;
  const shown = all ? words : words.slice(0, FIRST_PAGE);

  async function toggle() {
    if (playing !== null) { stop.current = true; return; }
    stop.current = false;
    try {
      await playSequence(shown.map((w) => w.simplified), {
        play: playChinese, isBusy: isChineseAudioBusy, shouldStop: () => stop.current, onStep: setPlaying,
        sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
      });
    } finally { setPlaying(null); }
  }

  return (
    <section aria-label="Từ ghép" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-headline-sm font-extrabold">Từ ghép với {term}</h2>
        <button type="button" onClick={() => void toggle()} aria-pressed={playing !== null} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold">
          <span className="inline-flex items-center gap-1"><Icon name={playing !== null ? "stop" : "play_arrow"} size={20} filled /> {playing !== null ? "Dừng" : "Nghe lần lượt"}</span>
        </button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {shown.map((w, i) => (
          <li key={w.simplified}>
            <Link href={wordHref(w.simplified)} aria-current={playing === i ? "true" : undefined}
              className={`flex min-h-14 flex-col rounded-2xl border border-outline-variant p-space-sm hover:bg-surface-container-low ${playing === i ? "bg-primary-container text-on-primary-container" : "bg-surface-container-low"}`}>
              <span className="flex items-baseline justify-between gap-2">
                <span lang="zh-Hans" className="font-serif text-headline-md font-bold">
                  {splitByTerms(w.simplified, forms).map((s, k) => <span key={k} className={s.hit ? "text-primary" : ""}>{s.text}</span>)}
                </span>
                {w.hskLevel != null && <span className="shrink-0 rounded-full border-2 border-ink/30 px-2 text-label-sm font-bold">{hskLabel(w.hskLevel)}</span>}
              </span>
              <span className="text-body-sm font-bold text-primary">{w.pinyin}</span>
              <span className="text-body-md text-on-surface-variant">{w.gloss ?? w.meaning}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-x-space-md">
        {words.length > FIRST_PAGE && <button type="button" onClick={() => setAll((v) => !v)} className="min-h-11 text-label-md font-extrabold text-primary hover:underline">{all ? "Thu gọn" : `Xem thêm ${words.length - FIRST_PAGE} từ`}</button>}
        <Link href={`/tra-tu?q=${encodeURIComponent(term)}`} className="inline-flex min-h-11 items-center text-label-md font-extrabold text-primary hover:underline">Xem mọi từ chứa “{term}”</Link>
      </div>
    </section>
  );
}
