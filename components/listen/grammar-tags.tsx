"use client";

import { useMemo } from "react";
import { detectGrammar } from "@/lib/grammar/detect-grammar";

/** Nhãn mẫu ngữ pháp nhận ra trong câu đang hát; mở ở tab mới để không ngắt bài. Tách thành chunk riêng (nạp bằng `next/dynamic`) vì kéo theo cả thư viện mẫu. */
export default function GrammarTags({ text }: { text: string }) {
  const tags = useMemo(() => detectGrammar(text), [text]);
  if (tags.length === 0) return null;
  return (
    <ul aria-label="Mẫu ngữ pháp trong câu này" className="flex flex-wrap gap-1.5">
      {tags.map((p) => (
        <li key={p.id}>
          <a href={`/grammar/${p.id}`} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} title={p.pattern} className="inline-flex min-h-8 items-center rounded-full border-2 border-secondary px-2.5 text-label-sm font-bold text-secondary hover:bg-secondary-container md:min-h-9">
            Ngữ pháp: {p.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
