"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { roomErrorMessage } from "@/lib/rooms/room-messages";
import { DisplayNameField } from "./display-name-field";
import { createRoomRequest } from "./room-requests";
import { SongPicker } from "./song-picker";
import { useDisplayName } from "./use-display-name";

/** Hộp thoại tạo phòng: tên hiển thị, chọn bài (ngẫu nhiên hoặc tự chọn), rồi vào phòng chờ với mã 6 số. */
export function CreateRoomDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const display = useDisplayName();
  const [pick, setPick] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function create() {
    setSubmitted(true);
    if (display.valid === null || (pick && !videoId)) return;
    setBusy(true);
    setError(null);
    const result = await createRoomRequest(display.valid, pick ? videoId : null);
    if (result.ok) return router.push(`/room/${result.data.code}`);
    setError(roomErrorMessage(result.error));
    setBusy(false);
  }

  const radio = (on: boolean) =>
    `flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-label-md font-medium transition-colors ${on ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`;

  return (
    <dialog
      ref={ref} aria-labelledby="create-room-title"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,30rem)] rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <h2 id="create-room-title" className="font-serif text-headline-md">Tạo phòng thi đấu</h2>
        <DisplayNameField {...display} showError={submitted} />
        <fieldset>
          <legend className="text-label-md font-medium text-on-surface">Bài hát</legend>
          <div className="mt-1 flex gap-2">
            <label className={radio(!pick)}>
              <input type="radio" name="song-mode" checked={!pick} onChange={() => setPick(false)} className="sr-only" />
              Ngẫu nhiên
            </label>
            <label className={radio(pick)}>
              <input type="radio" name="song-mode" checked={pick} onChange={() => setPick(true)} className="sr-only" />
              Tự chọn bài
            </label>
          </div>
          {pick ? (
            <div className="mt-space-sm">
              <SongPicker selected={videoId} onSelect={setVideoId} />
              {submitted && !videoId && <p role="alert" className="mt-1 text-label-md text-error">Chọn một bài hoặc đổi sang &ldquo;Ngẫu nhiên&rdquo;.</p>}
            </div>
          ) : (
            <p className="mt-2 text-label-md text-on-surface-variant">Hệ thống chọn một bài phổ biến khi bắt đầu ván.</p>
          )}
        </fieldset>
        {error && <p role="alert" className="text-label-md text-error">{error}</p>}
        <div className="flex flex-col-reverse gap-space-sm sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="min-h-11 rounded-full px-5 text-label-md font-medium text-on-surface hover:bg-surface-container-high">Hủy</button>
          <button type="button" onClick={create} disabled={busy} className="min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
            {busy ? "Đang tạo…" : "Tạo phòng"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
