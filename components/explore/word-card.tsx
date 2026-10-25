"use client";

import { PronounceButton } from "@/components/ui/pronounce-button";
import type { SceneWord } from "@/lib/explore/explore-types";

/** Thẻ từ hiện sau khi chạm một vật: chữ Hán lớn, pinyin, Hán Việt, nghĩa, câu ví dụ trong ngữ cảnh và nút nghe. Pinyin, Hán Việt, cấp HSK lấy từ từ điển. */
export function WordCard({ word, onClose }: { word: SceneWord; onClose: () => void }) {
  return (
    <section aria-label={`Từ ${word.term}`} className="card-ink p-space-md">
      <div className="flex items-start gap-space-sm">
        <div className="min-w-0 flex-1">
          <p lang="zh-Hans" className="text-5xl font-extrabold leading-tight">{word.term}</p>
          <p className="text-headline-md text-primary">{word.pinyin}</p>
          <p className="text-body-lg font-bold">{word.gloss}</p>
          <p className="mt-1 flex flex-wrap gap-x-3 text-label-md text-on-surface-variant">
            {word.sinoViet && <span>Hán Việt: <b className="text-on-surface">{word.sinoViet}</b></span>}
            {word.hskLevel != null && <span>HSK {word.hskLevel}</span>}
          </p>
        </div>
        <PronounceButton text={word.term} className="size-14" />
      </div>
      <div className="mt-space-sm rounded-xl bg-surface-container-low px-space-sm py-2">
        <div className="flex items-center gap-2">
          <p lang="zh-Hans" className="min-w-0 flex-1 text-body-lg font-bold">{word.example.zh}</p>
          <PronounceButton text={word.example.zh} className="size-11" />
        </div>
        <p className="text-body-md text-on-surface-variant">{word.example.vi}</p>
      </div>
      <button type="button" onClick={onClose} className="mt-space-sm min-h-11 text-label-md font-extrabold text-primary hover:underline">Đóng</button>
    </section>
  );
}
