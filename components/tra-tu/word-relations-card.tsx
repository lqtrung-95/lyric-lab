"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { RelatedWord, WordRelations } from "@/lib/tra-tu/word-relations";
import { wordHref } from "./word-result-row";

type State = { phase: "idle" } | { phase: "loading" } | { phase: "error"; message: string } | { phase: "done"; relations: WordRelations };

const ERRORS: Record<string, string> = {
  rate_limited: "Bạn đã dùng hết lượt nhờ AI hôm nay, thử lại ngày mai nhé.",
  auth_required: "Cần phiên đăng nhập để nhờ AI. Tải lại trang rồi thử lại.",
  unavailable: "Tính năng này chưa sẵn sàng. Bạn thử lại sau nhé.",
};

function Group({ title, tone, words }: { title: string; tone: "syn" | "ant"; words: RelatedWord[] }) {
  if (words.length === 0) return null;
  const cls = tone === "syn" ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container";
  return (
    <div className="space-y-1">
      <h3 className={`inline-block rounded-full px-3 py-0.5 text-label-md font-extrabold ${cls}`}>{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {words.map((w) => (
          <li key={w.term}>
            <Link href={wordHref(w.term)} className="flex min-h-11 flex-col rounded-2xl border-2 border-ink bg-surface-container-lowest px-3 py-1 hover:bg-surface-container-low">
              <span className="flex items-baseline gap-2"><span lang="zh-Hans" className="font-serif text-headline-sm font-bold">{w.term}</span><span className="text-label-md text-primary">{w.pinyin}</span></span>
              {w.meaning && <span className="max-w-[16rem] truncate text-label-sm text-on-surface-variant">{w.meaning}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Từ đồng nghĩa và trái nghĩa. Danh sách do AI gợi ý (lưu đệm theo từ) nhưng CHỈ giữ từ có trong từ điển; pinyin và nghĩa luôn từ từ điển.
 * AI chỉ chạy khi người dùng bấm nút. `canAskAi` false (bảng lưu đệm chưa có) thì ẩn nút.
 */
export function WordRelationsCard({ term, initial, canAskAi }: { term: string; initial: WordRelations | null; canAskAi: boolean }) {
  const [state, setState] = useState<State>(initial ? { phase: "done", relations: initial } : { phase: "idle" });

  async function ask() {
    setState({ phase: "loading" });
    try {
      await ensureAnonymousSession();
      const res = await fetch("/api/dictionary/relations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term }) });
      const data = (await res.json().catch(() => ({}))) as { relations?: WordRelations; error?: string };
      if (!res.ok || !data.relations) throw new Error(data.error ?? "server_error");
      setState({ phase: "done", relations: data.relations });
    } catch (e) {
      setState({ phase: "error", message: ERRORS[(e as Error).message] ?? "AI chưa tìm được lúc này, bạn thử lại sau nhé." });
    }
  }

  const rel = state.phase === "done" ? state.relations : null;
  if (!rel && !canAskAi) return null;
  const empty = rel !== null && rel.synonyms.length === 0 && rel.antonyms.length === 0;
  return (
    <section aria-label="Từ đồng nghĩa và trái nghĩa" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <h2 className="flex items-center gap-2 text-headline-sm font-extrabold"><Icon name="translate" size={22} /> Từ đồng nghĩa và trái nghĩa</h2>
      {rel && !empty && (
        <>
          <Group title="Đồng nghĩa" tone="syn" words={rel.synonyms} />
          <Group title="Trái nghĩa" tone="ant" words={rel.antonyms} />
          <p role="note" className="flex items-start gap-1 rounded-lg bg-tertiary-container px-space-sm py-1 text-label-md text-on-tertiary-container"><Icon name="auto_awesome" size={18} className="mt-0.5 shrink-0" /> Danh sách do AI gợi ý, đã lọc theo từ điển; có thể chưa đầy đủ hoặc khác sắc thái. Pinyin lấy từ từ điển.</p>
        </>
      )}
      {empty && <p className="text-body-md text-on-surface-variant">Chưa tìm được từ đồng nghĩa hay trái nghĩa phù hợp trong từ điển cho từ này.</p>}
      {canAskAi && !rel && (
        <button type="button" onClick={() => void ask()} disabled={state.phase === "loading"} aria-busy={state.phase === "loading"} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold">
          <span className="inline-flex items-center gap-1">{state.phase === "loading" ? <Spinner size={18} /> : <Icon name="auto_awesome" size={20} />} Tìm từ đồng nghĩa, trái nghĩa (AI)</span>
        </button>
      )}
      {state.phase === "error" && <p role="alert" className="text-body-md text-error">{state.message}</p>}
    </section>
  );
}
