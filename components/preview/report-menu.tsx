"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from "@/lib/analysis/report-schema";

interface ReportMenuProps {
  videoId: string;
  itemId: string;
  promptVersion: string;
  termLabel: string;
}

/** Menu ⋯ "Báo sai" với 3 lý do (PV-09). Gửi tới /api/reports. */
export function ReportMenu({ videoId, itemId, promptVersion, termLabel }: ReportMenuProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send(reason: ReportReason) {
    setStatus("sending");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, itemId, promptVersion, reason }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Báo sai thẻ ${termLabel}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
      >
        <Icon name="more_horiz" size={20} />
      </button>
      {open && (
        <div role="menu" className="absolute bottom-12 right-0 z-20 w-52 rounded-xl bg-surface-container-lowest p-1 shadow-lg ring-1 ring-outline-variant">
          {status === "sent" ? (
            <p role="status" className="p-3 text-label-md text-on-surface">Cảm ơn bạn đã báo. Mình sẽ kiểm tra thẻ này.</p>
          ) : (
            <>
              <p className="px-3 pb-1 pt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Báo sai</p>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  role="menuitem"
                  disabled={status === "sending"}
                  onClick={() => send(reason)}
                  className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-body-md text-on-surface hover:bg-surface-container-high disabled:opacity-60"
                >
                  {REPORT_REASON_LABELS[reason]}
                </button>
              ))}
              {status === "error" && <p role="alert" className="px-3 pb-2 text-label-sm text-error">Chưa gửi được, thử lại nhé.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
