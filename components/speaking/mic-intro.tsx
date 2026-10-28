"use client";

import { useState } from "react";
import { checkMic, type MicCheck } from "@/lib/speaking/vad-recorder";

interface Props { title: string; steps: string[]; startLabel?: string; onStart: (mic: MicCheck) => void }

const NOTE: Record<Exclude<MicCheck, "ok">, string> = {
  denied: "Micro đang bị chặn nên bài này sẽ chuyển sang gõ chữ. Muốn nói, hãy bật quyền micro cho trang trong cài đặt trình duyệt rồi tải lại.",
  unsupported: "Trình duyệt này chưa ghi âm được nên bài này sẽ chuyển sang gõ chữ.",
};

/** Màn mở đầu các bài Nói phản xạ: nêu cách chơi, xin quyền micro đúng lúc bấm Bắt đầu, rồi cho vào bài. Mic lỗi thì báo rõ và vẫn luyện được bằng gõ chữ. */
export function MicIntro({ title, steps, startLabel = "Bật micro và bắt đầu", onStart }: Props) {
  const [note, setNote] = useState<Exclude<MicCheck, "ok"> | null>(null);
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const mic = await checkMic();
    setBusy(false);
    if (mic === "ok") return onStart(mic);
    setNote(mic);
  }
  return (
    <div className="rounded-2xl bg-surface-container-low p-space-lg" data-testid="mic-intro">
      <h2 className="font-serif text-headline-md">{title}</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-body-md">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
      {note ? (
        <>
          <p role="alert" className="mt-3 text-body-md text-error">{NOTE[note]}</p>
          <button type="button" onClick={() => onStart(note)} className="mt-3 min-h-12 rounded-full bg-primary px-6 text-label-lg font-bold text-on-primary">Tiếp tục bằng gõ chữ</button>
        </>
      ) : (
        <button type="button" onClick={() => void go()} disabled={busy} className="mt-space-md min-h-12 rounded-full bg-primary px-6 text-label-lg font-bold text-on-primary hover:brightness-110 disabled:opacity-50">{startLabel}</button>
      )}
    </div>
  );
}
