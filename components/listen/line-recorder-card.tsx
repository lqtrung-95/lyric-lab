"use client";

import { Icon } from "@/components/ui/icon";
import { useLineRecorder } from "./use-line-recorder";

const FAIL_TEXT = {
  denied: "Chưa ghi âm được — kiểm tra bạn đã cho phép dùng micro chưa.",
  unsupported: "Trình duyệt này chưa hỗ trợ ghi âm.",
} as const;

/**
 * Ghi âm giọng hát theo câu đang phát để tự nghe lại so với bản gốc — chỉ lưu tạm trên máy, không gửi lên server,
 * không chấm điểm tự động (bản tối giản để thử phản ứng người dùng trước khi đầu tư nhận diện giọng nói).
 */
export function LineRecorderCard({ lineIndex }: { lineIndex: number }) {
  const { state, audioUrl, start, stop, reset } = useLineRecorder();

  return (
    <div key={lineIndex} className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <h3 className="flex items-center gap-2 text-label-md font-semibold text-on-surface">
        <Icon name="mic" size={18} className="text-primary" />
        Luyện phát âm
      </h3>
      <p className="mt-1 text-label-sm text-on-surface-variant">Ghi âm câu này rồi nghe lại so với bản gốc — không chấm điểm, chỉ để tự nghe.</p>

      <div className="mt-3 flex items-center gap-2">
        {state === "idle" || state === "denied" || state === "unsupported" ? (
          <button type="button" onClick={() => void start()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container">
            <Icon name="mic" size={18} />Ghi âm
          </button>
        ) : state === "requesting" ? (
          <p role="status" className="text-label-md text-on-surface-variant">Đang xin quyền dùng micro…</p>
        ) : state === "recording" ? (
          <button type="button" onClick={stop} aria-label="Dừng ghi âm"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-error px-4 text-label-md font-semibold text-on-error">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-on-error" />
            Đang ghi… bấm để dừng
          </button>
        ) : (
          <>
            <audio controls src={audioUrl ?? undefined} className="h-11 max-w-full flex-1" />
            <button type="button" onClick={() => void start()} aria-label="Ghi âm lại" title="Ghi âm lại"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high">
              <Icon name="mic" size={18} />
            </button>
            <button type="button" onClick={reset} aria-label="Xóa bản ghi" title="Xóa bản ghi"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
              <Icon name="close" size={18} />
            </button>
          </>
        )}
      </div>
      {(state === "denied" || state === "unsupported") && (
        <p role="alert" className="mt-2 text-label-sm text-error">{FAIL_TEXT[state]}</p>
      )}
    </div>
  );
}
