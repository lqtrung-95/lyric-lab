"use client";

import { Icon } from "@/components/ui/icon";
import type { VoiceClip } from "@/lib/speech/voice-clip";
import { useClipRecorder } from "./use-clip-recorder";

/**
 * "Báo + đọc to": ghi vài giây giọng bạn đọc manh mối (tiếng Trung) rồi gửi cùng tin báo; đồng đội vừa đọc câu vừa nghe bạn đọc.
 * Vừa là giao tiếp vừa là luyện nói. Bản ghi chỉ đi thẳng sang đồng đội, không lưu ở đâu.
 */
export function VoiceReportButton({ clueId, disabled, onSend }: { clueId: string; disabled: boolean; onSend: (clip: VoiceClip) => void }) {
  const { recording, error, start, stop } = useClipRecorder((_, clip) => onSend(clip));
  const mine = recording === clueId;
  return (
    <>
      <button type="button" disabled={disabled || (!!recording && !mine)} onClick={() => (mine ? void stop() : void start(clueId))}
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink px-4 text-label-md font-extrabold disabled:opacity-40 ${mine ? "bg-error text-on-error" : "bg-primary-container text-on-primary-container"}`}>
        <Icon name={mine ? "stop" : "mic"} size={18} filled />{mine ? "Đang ghi… bấm để gửi" : "Báo + đọc to"}
      </button>
      {error && <span role="alert" className="text-label-md font-bold text-error">{error}</span>}
    </>
  );
}
