"use client";

import Link from "next/link";
import { useMemo } from "react";
import { detectGrammar } from "@/lib/grammar/detect-grammar";
import type { GrammarPattern } from "@/lib/grammar/grammar-types";

/** "Ngữ pháp trong cảnh": các mẫu câu nhận ra ở câu hay dùng và hội thoại của cảnh, mỗi mẫu kèm câu thật trong cảnh và lối sang bài học. Không có mẫu nào thì không hiện gì. */
export default function SceneGrammar({ lines }: { lines: string[] }) {
  const found = useMemo(() => {
    const byId = new Map<string, { p: GrammarPattern; line: string }>();
    for (const line of lines) for (const p of detectGrammar(line, 3)) if (!byId.has(p.id)) byId.set(p.id, { p, line });
    return [...byId.values()].slice(0, 4);
  }, [lines]);
  if (found.length === 0) return null;
  return (
    <div>
      <h2 className="text-headline-md">Ngữ pháp trong cảnh này</h2>
      <ul className="mt-space-sm grid gap-2 sm:grid-cols-2">
        {found.map(({ p, line }) => (
          <li key={p.id}>
            <Link href={`/grammar/${p.id}`} className="flex min-h-11 flex-col rounded-xl border-2 border-secondary bg-surface-container-lowest px-space-sm py-2 hover:bg-secondary-container">
              <span className="text-label-lg font-extrabold text-secondary">{p.title}</span>
              <span lang="zh-Hans" className="font-serif text-body-md">{line}</span>
              <span className="text-body-sm text-on-surface-variant">{p.pattern}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
