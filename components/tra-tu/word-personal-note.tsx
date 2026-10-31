"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { MAX_NOTE_CHARS } from "@/lib/words/word-notes";
import { useWordNotes } from "./use-word-notes";

/** Ghi chú riêng của người học cho từ này (mẹo nhớ, câu liên tưởng). Lưu ở thiết bị này và hiện ở mặt sau thẻ ôn của từ. */
export function WordPersonalNote({ term }: { term: string }) {
  const { notes, save } = useWordNotes();
  const saved = notes[term] ?? "";
  const [draft, setDraft] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);
  const text = draft ?? saved;
  const dirty = draft !== null && draft.trim() !== saved;
  const commit = () => { if (draft !== null) { save(term, draft); setDraft(null); setSeen(true); } };
  return (
    <section aria-label="Ghi chú của bạn" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <h2 className="flex items-center gap-2 text-headline-sm font-extrabold"><Icon name="edit" size={22} /> Ghi chú của bạn</h2>
      <label className="block">
        <span className="sr-only">Ghi chú cho {term}</span>
        <textarea value={text} maxLength={MAX_NOTE_CHARS} rows={3} onChange={(e) => { setDraft(e.target.value); setSeen(false); }} onBlur={commit}
          placeholder="Mẹo nhớ riêng của bạn: liên tưởng, câu đặt, chỗ hay nhầm…" className="w-full rounded-2xl border-2 border-ink bg-surface-container-lowest p-space-sm text-body-md" />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2 text-label-md text-on-surface-variant">
        <span>{text.length}/{MAX_NOTE_CHARS} · Chỉ lưu trên thiết bị này; hiện ở mặt sau thẻ ôn.</span>
        <span className="flex gap-2">
          {dirty && <button type="button" onClick={commit} className="btn-3d btn-3d-primary min-h-11 px-4 text-label-md font-extrabold">Lưu ghi chú</button>}
          {saved && draft === null && <button type="button" onClick={() => { save(term, ""); setDraft(null); }} className="min-h-11 rounded-full px-3 font-bold underline">Xóa</button>}
          {seen && !dirty && <span role="status" className="inline-flex min-h-11 items-center font-bold text-secondary">Đã lưu</span>}
        </span>
      </div>
    </section>
  );
}
