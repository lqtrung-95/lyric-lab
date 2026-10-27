"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/icon";

interface Props {
  /** Câu đang chọn là của người học? Chỉ khi đó mới hiện nút ghi âm. */
  yourTurn: boolean;
  recording: boolean;
  /** Bản ghi của câu đang chọn (blob URL), nếu có. */
  currentRecording: string | undefined;
  recordedCount: number;
  totalMine: number;
  replaying: boolean;
  error: string | null;
  onRecord: () => void;
  onStopRecord: () => void;
  onReplayAll: () => void;
  onStopReplay: () => void;
}

const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink px-space-sm text-label-lg font-extrabold disabled:opacity-40";

/** Khung ghi âm khi đóng vai: ghi câu của bạn, nghe lại bản ghi, và nghe cả hội thoại (câu của bạn xen giọng mẫu). Bản ghi chỉ nằm trên máy này. */
export function DialogueRecordingPanel(p: Props) {
  const preview = useRef<HTMLAudioElement | null>(null);
  const playOwn = () => {
    if (!p.currentRecording) return;
    preview.current?.pause();
    preview.current = new Audio(p.currentRecording);
    void preview.current.play();
  };
  return (
    <section aria-label="Ghi âm và nghe lại" className="card-ink flex flex-col gap-space-sm bg-surface-container-lowest p-space-sm">
      <h2 className="text-headline-md">Ghi âm giọng bạn</h2>
      <p className="text-body-sm text-on-surface-variant">Bản ghi chỉ nằm trên máy này, không gửi đi đâu và mất khi bạn đóng trang.</p>
      {p.yourTurn ? (
        <div className="flex flex-wrap items-center gap-2">
          {p.recording ? (
            <button type="button" onClick={p.onStopRecord} className={`${btn} bg-error text-on-error`}><Icon name="stop" size={20} filled />Dừng ghi</button>
          ) : (
            <button type="button" onClick={p.onRecord} className={`${btn} bg-primary text-on-primary`}><Icon name="mic" size={20} filled />{p.currentRecording ? "Ghi lại" : "Ghi âm câu này"}</button>
          )}
          {p.currentRecording && !p.recording && <button type="button" onClick={playOwn} className={`${btn} bg-surface-container-lowest`}><Icon name="play_arrow" size={20} filled />Nghe bản ghi</button>}
          {p.recording && <span role="status" className="text-label-lg font-extrabold">Đang ghi… hãy đọc to câu trên.</span>}
        </div>
      ) : (
        <p className="text-body-md">Đến câu của bạn, nút ghi âm sẽ hiện ở đây.</p>
      )}
      {p.error && <p role="alert" className="text-body-sm font-bold text-error">{p.error}</p>}
      <div className="flex flex-wrap items-center gap-2 border-t-2 border-outline-variant pt-space-sm">
        <span className="text-label-lg font-extrabold">Đã ghi {p.recordedCount}/{p.totalMine} câu của bạn</span>
        {p.replaying ? (
          <button type="button" onClick={p.onStopReplay} className={`${btn} bg-secondary text-on-secondary`}><Icon name="stop" size={20} filled />Dừng</button>
        ) : (
          <button type="button" onClick={p.onReplayAll} disabled={p.recordedCount === 0 || p.recording} className={`${btn} bg-secondary text-on-secondary`}><Icon name="headphones" size={20} />Nghe cả hội thoại</button>
        )}
      </div>
    </section>
  );
}
