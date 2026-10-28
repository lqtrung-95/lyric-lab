"use client";

import { useState } from "react";
import { COOP_PLACES } from "@/lib/explore/coop/coop-places";
import { MESSAGE_TEMPLATES, composeMessage } from "@/lib/explore/coop/coop-messages";
import { COOP_PHRASES } from "@/lib/explore/coop/coop-state";
import type { Hints } from "./use-story-hints";

/**
 * Soạn câu tiếng Trung nói với đồng đội: chọn mẫu câu, điền nơi chốn (các cảnh của vụ án) rồi gửi; hoặc bấm một câu nói nhanh có sẵn.
 * Không có chữ gõ tự do. Nghĩa tiếng Việt của mẫu chỉ hiện khi bật gợi ý "Nghĩa".
 */
export function CoopComposer({ places, hints, onSay }: { places: readonly string[]; hints: Hints; onSay: (zh: string) => void }) {
  const [tpl, setTpl] = useState(MESSAGE_TEMPLATES[0].id);
  const [place, setPlace] = useState(places[0] ?? "");
  const template = MESSAGE_TEMPLATES.find((t) => t.id === tpl) ?? MESSAGE_TEMPLATES[0];
  const composed = composeMessage(template.id, place);
  const sel = "min-h-11 min-w-0 flex-1 rounded-xl border-2 border-ink bg-surface-container-lowest px-2 text-body-md";
  return (
    <details className="rounded-xl border-2 border-ink bg-surface-container-low p-space-sm">
      <summary className="min-h-11 cursor-pointer text-label-md font-extrabold leading-[2.75rem]">Nói với đồng đội bằng tiếng Trung</summary>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-label-md font-extrabold">Mẫu câu
            <select value={tpl} onChange={(e) => setTpl(e.target.value)} className={sel}>
              {MESSAGE_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.slot ? t.zh.replace("{p}", "…") : t.zh}{hints.vi ? ` (${t.slot ? t.vi.replace("{p}", "…") : t.vi})` : ""}</option>)}
            </select>
          </label>
          {template.slot && (
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-label-md font-extrabold">Nơi chốn
              <select value={place} onChange={(e) => setPlace(e.target.value)} className={sel}>
                {places.map((id) => <option key={id} value={id}>{COOP_PLACES[id]?.zh ?? id}{hints.vi ? ` (${COOP_PLACES[id]?.vi})` : ""}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p lang="zh-Hans" className="min-w-0 flex-1 text-body-lg font-bold">{composed?.zh ?? "…"}</p>
          <button type="button" disabled={!composed} onClick={() => composed && onSay(composed.zh)} className="min-h-11 rounded-full border-2 border-ink bg-primary px-5 text-label-md font-extrabold text-on-primary disabled:opacity-40">Gửi</button>
        </div>
        <div role="group" aria-label="Câu nói nhanh" className="flex flex-wrap gap-1.5">
          {COOP_PHRASES.map((p) => (
            <button key={p.zh} type="button" onClick={() => onSay(p.zh)} title={p.vi} className="min-h-9 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-bold hover:bg-surface-container-low"><span lang="zh-Hans">{p.zh}</span></button>
          ))}
        </div>
      </div>
    </details>
  );
}
