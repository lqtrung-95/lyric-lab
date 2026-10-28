"use client";

import { useState } from "react";
import { SOUND_ARTICULATION } from "@/lib/pronunciation/articulation-data";
import type { Sound } from "@/lib/pronunciation/pinyin-chart-data";
import { SoundExampleButtons } from "./sound-example-buttons";
import { TongueDiagram } from "./tongue-diagram";

/**
 * Nhóm nguyên âm đơn dạng chọn-xem: một hàng nút chọn nguyên âm và một thẻ chi tiết (hình lớn, ví dụ nghe được, mẹo, vị trí lưỡi và môi).
 * Bấm nguyên âm khác thì đổi hình tại chỗ, nên so sánh được các vị trí lưỡi mà không phải cuộn qua bảy thẻ lặp lại.
 */
export function VowelExplorer({ sounds }: { sounds: Sound[] }) {
  const [symbol, setSymbol] = useState(sounds[0].symbol);
  const sound = sounds.find((s) => s.symbol === symbol) ?? sounds[0];
  const art = SOUND_ARTICULATION[sound.symbol];
  return (
    <div className="flex flex-col gap-space-md">
      <div role="tablist" aria-label="Chọn nguyên âm" className="flex flex-wrap gap-2">
        {sounds.map((s) => (
          <button key={s.symbol} type="button" role="tab" id={`vowel-${s.symbol}`} aria-selected={s.symbol === sound.symbol} aria-controls="vowel-detail" onClick={() => setSymbol(s.symbol)}
            className={`min-h-12 min-w-14 rounded-xl border-2 px-4 font-serif text-headline-md ${s.symbol === sound.symbol ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container"}`}>
            {s.symbol}
          </button>
        ))}
      </div>
      <div id="vowel-detail" role="tabpanel" aria-labelledby={`vowel-${sound.symbol}`} className="grid items-start gap-space-md rounded-xl border border-outline-variant bg-surface-container-lowest p-space-md md:grid-cols-[minmax(0,300px)_1fr]">
        {art && <TongueDiagram kind={art.diagram} alt={`Hình cắt dọc miệng khi phát âm ${sound.symbol}: ${art.where}`} className="mx-auto w-full max-w-[300px]" />}
        <div className="flex min-w-0 flex-col gap-space-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-serif text-headline-lg text-primary">{sound.symbol}</span>
            <SoundExampleButtons examples={sound.examples} />
          </div>
          <p className="text-body-md text-on-surface-variant">{sound.tip}</p>
          {art && (
            <div className="border-t border-outline-variant pt-space-sm">
              <p className="text-label-lg font-extrabold text-primary">Vị trí lưỡi và môi</p>
              <p className="mt-1 border-l-4 border-primary pl-3 text-body-lg">{art.where}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-body-md text-on-surface-variant">{art.how.map((h) => <li key={h}>{h}</li>)}</ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
