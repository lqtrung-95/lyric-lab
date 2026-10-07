"use client";

import { useEffect, useRef, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";

const REASONS: [string, string][] = [
  ["offensive_name", "Tên không phù hợp"],
  ["cheating", "Gian lận"],
  ["harassment", "Quấy rối"],
  ["other", "Lý do khác"],
];

/** Nút "Báo cáo" một người chơi (tên không phù hợp, gian lận...). Gửi tới `player_reports` để quản trị viên xem. */
export function ReportPlayerButton({ context, code, name }: { context: "room" | "challenge"; code: string; name: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("offensive_name");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function send() {
    setState("sending");
    const ok = await ensureAnonymousSession();
    const res = ok ? await fetch("/api/reports/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, code, name, reason }) }).catch(() => null) : null;
    setState(res?.ok ? "done" : "error");
  }

  return (
    <>
      <button type="button" onClick={() => { setState("idle"); setOpen(true); }} aria-label={`Báo cáo người chơi ${name}`} className="inline-flex min-h-11 items-center rounded-full px-3 text-label-sm text-on-surface-variant hover:bg-surface-container-high">Báo cáo</button>
      <dialog ref={ref} aria-labelledby="report-player-title" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
        className="m-auto w-[min(92vw,24rem)] rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50">
        <div className="space-y-space-md p-space-lg">
          <h2 id="report-player-title" className="font-serif text-headline-md">Báo cáo {name}</h2>
          {state === "done" ? (
            <p role="status" className="text-body-md text-on-surface-variant">Cảm ơn bạn. Chúng tôi sẽ xem xét báo cáo này.</p>
          ) : (
            <fieldset className="space-y-1">
              <legend className="sr-only">Lý do báo cáo</legend>
              {REASONS.map(([value, label]) => (
                <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-surface-container-low">
                  <input type="radio" name="report-reason" value={value} checked={reason === value} onChange={() => setReason(value)} />
                  {label}
                </label>
              ))}
              {state === "error" && <p role="alert" className="text-label-md text-error">Chưa gửi được. Thử lại sau nhé.</p>}
            </fieldset>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full px-5 text-label-md font-medium hover:bg-surface-container-high">{state === "done" ? "Đóng" : "Hủy"}</button>
            {state !== "done" && <button type="button" disabled={state === "sending"} onClick={() => void send()} className="min-h-11 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary disabled:opacity-60">Gửi báo cáo</button>}
          </div>
        </div>
      </dialog>
    </>
  );
}
