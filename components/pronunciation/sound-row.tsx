import type { Sound } from "@/lib/pronunciation/pinyin-chart-data";
import { SoundExampleButtons } from "./sound-example-buttons";

/** Một âm: ký hiệu, hai ví dụ nghe được và mẹo so với tiếng Việt. */
export function SoundRow({ sound }: { sound: Sound }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-space-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex min-w-14 items-center justify-center rounded-xl bg-primary-container px-3 py-1 font-serif text-headline-md text-on-primary-container">{sound.symbol}</span>
        <SoundExampleButtons examples={sound.examples} />
      </div>
      <p className="text-body-md text-on-surface-variant">{sound.tip}</p>
    </li>
  );
}
