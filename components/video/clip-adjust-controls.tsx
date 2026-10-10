import { CLIP_ADJUST_STEP, isAdjusted, type ClipAdjust } from "@/lib/video/clip-range";

const stepButton = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-outline-variant px-2 text-label-md font-semibold text-on-surface hover:bg-surface-container";
const STEP_TEXT = String(CLIP_ADJUST_STEP).replace(".", ",");
const fmt = (n: number) => (n === 0 ? "0" : `${n > 0 ? "+" : "−"}${Math.abs(n).toString().replace(".", ",")}`);

/**
 * "Đoạn nghe bị lệch?": chỉnh đầu và cuối đoạn phát của câu đang học theo nấc 0,5 giây (mốc phụ đề YouTube chỉ có giây nguyên nên có khi cụt chữ hoặc lẫn câu bên cạnh).
 * Mỗi lần bấm phát lại đoạn vừa chỉnh để nghe ngay; chỉnh được lưu theo câu trong trình duyệt của người học.
 */
export function ClipAdjustControls({ adjust, onNudge, onReset }: { adjust: ClipAdjust; onNudge: (edge: keyof ClipAdjust, delta: number) => void; onReset: () => void }) {
  return (
    <details className="rounded-xl bg-surface-container-low px-3 py-1 text-label-md text-on-surface-variant" open={isAdjusted(adjust) || undefined}>
      <summary className="min-h-11 cursor-pointer select-none py-2.5">Đoạn nghe bị lệch (cụt chữ hoặc lẫn câu khác)?{isAdjusted(adjust) && <span className="ml-1 font-medium text-primary">· đã chỉnh</span>}</summary>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pb-2">
        <div role="group" aria-label="Đầu đoạn" className="flex items-center gap-1">
          <span className="w-16">Đầu đoạn</span>
          <button type="button" aria-label={`Bắt đầu sớm hơn ${STEP_TEXT} giây`} title="Bắt đầu sớm hơn" onClick={() => onNudge("start", -CLIP_ADJUST_STEP)} className={stepButton}>−</button>
          <span aria-live="polite" className="w-12 text-center font-medium text-on-surface">{fmt(adjust.start)}s</span>
          <button type="button" aria-label={`Bắt đầu muộn hơn ${STEP_TEXT} giây`} title="Bắt đầu muộn hơn" onClick={() => onNudge("start", CLIP_ADJUST_STEP)} className={stepButton}>+</button>
        </div>
        <div role="group" aria-label="Cuối đoạn" className="flex items-center gap-1">
          <span className="w-16">Cuối đoạn</span>
          <button type="button" aria-label={`Kết thúc sớm hơn ${STEP_TEXT} giây`} title="Kết thúc sớm hơn" onClick={() => onNudge("end", -CLIP_ADJUST_STEP)} className={stepButton}>−</button>
          <span aria-live="polite" className="w-12 text-center font-medium text-on-surface">{fmt(adjust.end)}s</span>
          <button type="button" aria-label={`Kết thúc muộn hơn ${STEP_TEXT} giây`} title="Kết thúc muộn hơn" onClick={() => onNudge("end", CLIP_ADJUST_STEP)} className={stepButton}>+</button>
        </div>
        {isAdjusted(adjust) && <button type="button" onClick={onReset} className="min-h-11 rounded-full px-3 font-medium text-primary hover:bg-surface-container">Đặt lại</button>}
      </div>
    </details>
  );
}
