"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { StoredEtymologyNote } from "@/lib/tra-tu/hanzi-info-types";

type State = { phase: "idle" } | { phase: "loading" } | { phase: "error"; message: string } | { phase: "done"; stored: StoredEtymologyNote };
const ERRORS: Record<string, string> = {
  rate_limited: "Bạn đã dùng hết lượt giải nghĩa AI hôm nay, thử lại ngày mai nhé.",
  auth_required: "Cần phiên đăng nhập để nhờ AI giải thích. Tải lại trang rồi thử lại.",
};

/** Lời giải chiết tự do AI viết (chỉ chạy khi bấm nút, có lưu đệm). Luôn gắn nhãn "có thể chưa chính xác"; dữ kiện cấu trúc ở trên là từ Make Me a Hanzi. */
export function EtymologyAiNote({ char, initial, canAskAi }: { char: string; initial: StoredEtymologyNote | null; canAskAi: boolean }) {
  const [state, setState] = useState<State>(initial ? { phase: "done", stored: initial } : { phase: "idle" });
  async function ask() {
    setState({ phase: "loading" });
    try {
      await ensureAnonymousSession();
      const res = await fetch("/api/dictionary/etymology", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ char }) });
      const data = (await res.json().catch(() => ({}))) as Partial<StoredEtymologyNote> & { error?: string };
      if (!res.ok || !data.note || !data.model) throw new Error(data.error ?? "server_error");
      setState({ phase: "done", stored: { note: data.note, model: data.model } });
    } catch (e) {
      setState({ phase: "error", message: ERRORS[(e as Error).message] ?? "AI chưa giải thích được lúc này, bạn thử lại sau nhé." });
    }
  }
  if (state.phase === "done") {
    const { note } = state.stored;
    return (
      <div className="space-y-1 rounded-xl bg-surface-container-low p-space-sm">
        <p className="text-body-md">{note.story}</p>
        {note.mnemonic && <p className="text-body-md"><b>Mẹo nhớ:</b> {note.mnemonic}</p>}
        <p role="note" className="flex items-start gap-1 text-label-md text-on-surface-variant"><Icon name="auto_awesome" size={16} className="mt-0.5 shrink-0" /> Do AI viết dựa trên dữ kiện ở trên, có thể chưa chính xác.</p>
      </div>
    );
  }
  if (!canAskAi) return null;
  return (
    <div className="space-y-1">
      <button type="button" onClick={() => void ask()} disabled={state.phase === "loading"} aria-busy={state.phase === "loading"} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold">
        <span className="inline-flex items-center gap-1">{state.phase === "loading" ? <Spinner size={18} /> : <Icon name="auto_awesome" size={20} />} Nhờ AI giải thích bằng tiếng Việt</span>
      </button>
      {state.phase === "error" && <p role="alert" className="text-body-md text-error">{state.message}</p>}
    </div>
  );
}
