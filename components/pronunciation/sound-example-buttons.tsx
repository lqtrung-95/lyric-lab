"use client";

import { Icon } from "@/components/ui/icon";
import type { SoundExample } from "@/lib/pronunciation/pinyin-chart-data";
import { playChinese } from "@/lib/speech/play-chinese";

/** Hai nút nghe ví dụ của một âm (pinyin + chữ Hán). */
export function SoundExampleButtons({ examples }: { examples: readonly SoundExample[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {examples.map((e) => (
        <button key={e.han} type="button" onClick={() => void playChinese(e.han)} aria-label={`Nghe ${e.pinyin} (${e.han})`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 text-label-md hover:bg-surface-container">
          <Icon name="volume_up" size={18} />
          <span>{e.pinyin}</span>
          <span lang="zh-Hans" className="text-on-surface-variant">{e.han}</span>
        </button>
      ))}
    </span>
  );
}
