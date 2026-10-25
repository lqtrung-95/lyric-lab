"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { StoredWordNote } from "@/lib/tra-tu/word-note-schema";

type State = { phase: "idle" } | { phase: "loading" } | { phase: "error"; message: string } | { phase: "done"; stored: StoredWordNote };

const ERRORS: Record<string, string> = {
  rate_limited: "Bạn đã dùng hết lượt giải nghĩa AI hôm nay, thử lại ngày mai nhé.",
  auth_required: "Cần phiên đăng nhập để nhờ AI giải nghĩa. Tải lại trang rồi thử lại.",
};

/**
 * Nghĩa tiếng Việt: bản đã duyệt (từ bài HSK) nếu có, và giải nghĩa chi tiết do AI viết (có lưu đệm). Nội dung AI luôn gắn nhãn "có thể chưa chính xác";
 * AI chỉ chạy khi người dùng bấm nút. `canAskAi` false (bảng lưu đệm chưa có) thì ẩn nút.
 */
export function WordNoteCard({ term, approvedGloss, initial, canAskAi }: {
  term: string; approvedGloss: string | null; initial: StoredWordNote | null; canAskAi: boolean;
}) {
  const [state, setState] = useState<State>(initial ? { phase: "done", stored: initial } : { phase: "idle" });

  async function ask() {
    setState({ phase: "loading" });
    try {
      await ensureAnonymousSession();
      const res = await fetch("/api/tra-tu/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term }) });
      const data = (await res.json().catch(() => ({}))) as Partial<StoredWordNote> & { error?: string };
      if (!res.ok || !data.note || !data.model) throw new Error(data.error ?? "server_error");
      setState({ phase: "done", stored: { note: data.note, model: data.model } });
    } catch (e) {
      setState({ phase: "error", message: ERRORS[(e as Error).message] ?? "AI chưa giải nghĩa được lúc này, bạn thử lại sau nhé." });
    }
  }

  const note = state.phase === "done" ? state.stored.note : null;
  if (!approvedGloss && !note && !canAskAi) return null;
  return (
    <section aria-label="Nghĩa tiếng Việt" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <h2 className="text-headline-sm font-extrabold">Nghĩa tiếng Việt</h2>
      {approvedGloss && <p className="text-body-lg font-bold">{approvedGloss} <span className="ml-1 rounded-full bg-secondary-container px-2 text-label-sm font-bold text-on-secondary-container">đã duyệt</span></p>}
      {note && (
        <div className="space-y-2">
          <p className="text-body-lg font-bold">{!approvedGloss && note.gloss}</p>
          <ol className="list-decimal space-y-1 pl-6 text-body-md marker:font-bold">
            {note.senses.map((s, i) => (
              <li key={i}>{s.pos && <i className="mr-1 text-on-surface-variant">({s.pos})</i>}{s.meaning}{s.usage && <span className="block text-on-surface-variant">{s.usage}</span>}</li>
            ))}
          </ol>
          {note.note && <p className="text-body-md text-on-surface-variant">{note.note}</p>}
        </div>
      )}
      {(note || state.phase === "loading") && (
        <p role="note" className="flex items-start gap-1 rounded-lg bg-tertiary-container px-space-sm py-1 text-label-md text-on-tertiary-container">
          <Icon name="auto_awesome" size={18} className="mt-0.5 shrink-0" /> Phần giải nghĩa này do AI dịch, có thể chưa chính xác. Pinyin, Hán Việt và cấp HSK luôn lấy từ từ điển.
        </p>
      )}
      {canAskAi && !note && (
        <button type="button" onClick={() => void ask()} disabled={state.phase === "loading"} aria-busy={state.phase === "loading"} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold">
          <span className="inline-flex items-center gap-1">{state.phase === "loading" ? <Spinner size={18} /> : <Icon name="auto_awesome" size={20} />} {approvedGloss ? "Giải nghĩa chi tiết bằng AI" : "Nhờ AI giải nghĩa tiếng Việt"}</span>
        </button>
      )}
      {state.phase === "error" && <p role="alert" className="text-body-md text-error">{state.message}</p>}
    </section>
  );
}
