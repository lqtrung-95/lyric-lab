"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { completedObjectives, objectivesOf } from "@/lib/roleplay/objectives";

/**
 * Mục tiêu của tình huống (3 việc nhỏ) với dấu ✓ khi đã nói được; bấm vào một mục chưa đạt để xem câu gợi ý (chữ Hán, nghe được). Chấm bằng mẫu chữ trên lời bạn nói, không tốn lượt AI.
 * `compact` dùng ở màn tổng kết (chỉ liệt kê, không gợi ý).
 */
export function ObjectivesPanel({ scenarioId, userLines, compact = false }: { scenarioId: string; userLines: string[]; compact?: boolean }) {
  const list = objectivesOf(scenarioId);
  const [open, setOpen] = useState<string | null>(null);
  if (list.length === 0) return null;
  const done = completedObjectives(scenarioId, userLines);
  const all = done.size === list.length;
  return (
    <section aria-label="Mục tiêu của tình huống" className="rounded-2xl border-2 border-ink bg-surface-container-lowest p-space-sm">
      <h3 className="flex flex-wrap items-center gap-2 text-label-lg font-extrabold">Mục tiêu {done.size}/{list.length}{all && <span className="rounded-full bg-secondary-container px-2 text-label-sm text-on-secondary-container">Hoàn thành!</span>}</h3>
      <ul className="mt-1 flex flex-col gap-1">
        {list.map((o) => {
          const ok = done.has(o.id);
          return (
            <li key={o.id}>
              {compact || ok ? (
                <p className={`flex min-h-8 items-center gap-2 text-body-md ${ok ? "font-bold text-secondary" : "text-on-surface-variant"}`}><Icon name={ok ? "check_circle" : "close"} size={18} filled={ok} />{o.label}<span className="sr-only">{ok ? " (đã đạt)" : " (chưa đạt)"}</span></p>
              ) : (
                <>
                  <button type="button" aria-expanded={open === o.id} onClick={() => setOpen(open === o.id ? null : o.id)} className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-1 text-left text-body-md hover:bg-surface-container">
                    <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full border-2 border-ink" />{o.label}<span className="ml-auto text-label-sm text-primary underline">{open === o.id ? "Ẩn gợi ý" : "Gợi ý"}</span>
                  </button>
                  {open === o.id && <p className="ml-7 flex items-center gap-2 rounded-xl bg-surface-container px-3 py-1"><span lang="zh-Hans" className="font-serif text-headline-sm font-bold">{o.hint}</span><PronounceButton text={o.hint} className="size-10" /></p>}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
