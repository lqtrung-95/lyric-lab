"use client";

import { Spinner } from "@/components/ui/spinner";
import { useTranslateMissing, type FilledTranslation } from "./use-translate-missing";

/**
 * Báo video còn câu chưa có bản dịch tiếng Việt và cho bất kỳ ai bấm "Dịch phần còn lại bằng AI". Tự biến mất khi đã dịch hết.
 * Bấm một lần là dịch lặp tới khi hết (hoặc tới khi hết hạn mức/AI quá tải), hiện số câu còn lại.
 */
export function TranslateMissingBanner({ videoId, missing, total, onFilled }: { videoId: string; missing: number; total: number; onFilled: (entries: FilledTranslation[]) => void }) {
  const { state, start } = useTranslateMissing(videoId, onFilled);
  if (missing <= 0) return null;
  const running = state.status === "running";
  return (
    <div role="note" className="mb-space-md flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-surface-container-low p-3 text-label-md text-on-surface-variant">
      <div className="min-w-0 flex-1">
        <p>
          {missing === total ? "Video này chưa có bản dịch tiếng Việt." : `Còn ${missing}/${total} câu chưa có bản dịch tiếng Việt.`}{" "}
          Bạn vẫn luyện chép chính tả và nói theo như bình thường.
        </p>
        {running && <p role="status" className="mt-1 font-medium text-on-surface">Đang dịch bằng AI, còn {state.remaining} câu…</p>}
        {state.status === "stopped" && <p role="status" className="mt-1 font-medium text-error">{state.message}</p>}
      </div>
      <button
        type="button" disabled={running} onClick={() => void start(missing)} aria-busy={running}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-container px-5 text-label-md font-semibold text-on-primary-container hover:bg-primary hover:text-on-primary disabled:opacity-60"
      >
        {running && <Spinner size={16} />}
        {running ? "Đang dịch…" : "Dịch phần còn lại bằng AI"}
      </button>
    </div>
  );
}
