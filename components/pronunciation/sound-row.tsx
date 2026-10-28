import { SOUND_ARTICULATION } from "@/lib/pronunciation/articulation-data";
import type { Sound } from "@/lib/pronunciation/pinyin-chart-data";
import { SoundExampleButtons } from "./sound-example-buttons";
import { TongueDiagram } from "./tongue-diagram";

/**
 * Một âm: ký hiệu, hai ví dụ nghe được, mẹo so với tiếng Việt. `withDiagram` (nhóm nguyên âm đơn, mỗi âm một chỗ đặt lưỡi riêng) thêm hình lớn
 * ở đầu thẻ và mô tả vị trí lưỡi ở cuối thẻ.
 */
export function SoundRow({ sound, withDiagram = false }: { sound: Sound; withDiagram?: boolean }) {
  const art = withDiagram ? SOUND_ARTICULATION[sound.symbol] : undefined;
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-space-sm">
      {art && <TongueDiagram kind={art.diagram} alt={`Hình cắt dọc miệng khi phát âm ${sound.symbol}: ${art.where}`} className="w-full" />}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex min-w-14 items-center justify-center rounded-xl bg-primary-container px-3 py-1 font-serif text-headline-md text-on-primary-container">{sound.symbol}</span>
        <SoundExampleButtons examples={sound.examples} />
      </div>
      <p className="text-body-md text-on-surface-variant">{sound.tip}</p>
      {art && (
        <div className="mt-auto border-t border-outline-variant pt-2 text-body-sm">
          <p className="font-extrabold text-primary">Vị trí lưỡi và môi</p>
          <p>{art.where}</p>
          {art.how.map((h) => <p key={h} className="mt-0.5 text-on-surface-variant">{h}</p>)}
        </div>
      )}
    </li>
  );
}
