"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { courseLevel, suggestGrammar, suggestScenes } from "@/lib/courses/unit-suggestions";
import type { UnitWord } from "@/lib/courses/unit-types";
import { SCENES } from "@/lib/explore/scenes";
import { detectGrammar } from "@/lib/grammar/detect-grammar";

const card = "flex min-h-11 flex-col rounded-2xl border-2 border-ink bg-surface-container-lowest p-space-sm text-left hover:brightness-105";

/**
 * "Học tiếp từ chặng này" ở màn kết quả: cảnh Khám phá có nhiều từ vừa học và mẫu ngữ pháp nhận ra trong câu thật của chặng; chặng ôn tổng hợp thì mời thi ngữ pháp của cấp.
 * Chỉ hiện khi có gợi ý đáng tin (đủ số từ trùng, mẫu khớp câu thật). Nạp riêng bằng `next/dynamic` vì kéo theo danh sách cảnh và thư viện mẫu ngữ pháp.
 */
export default function UnitNextSteps({ slug, words, isReview }: { slug: string; words: UnitWord[]; isReview: boolean }) {
  const level = courseLevel(slug);
  const scenes = useMemo(() => (isReview ? [] : suggestScenes(words.map((w) => w.term), Object.values(SCENES))), [words, isReview]);
  const grammar = useMemo(() => (isReview ? [] : suggestGrammar(words.flatMap((w) => w.examples.map((e) => e.text)), level, detectGrammar)), [words, level, isReview]);
  const testLevel = isReview && level !== null ? Math.min(level, 6) : null;
  if (scenes.length === 0 && grammar.length === 0 && testLevel === null) return null;
  return (
    <section aria-label="Học tiếp từ chặng này" className="mt-space-md rounded-2xl bg-surface-container p-space-sm text-left">
      <h2 className="text-label-lg font-extrabold">Học tiếp từ chặng này</h2>
      <ul className="mt-1 grid gap-2 sm:grid-cols-2">
        {scenes.map((s) => (
          <li key={s.id}>
            <Link href={`/explore/${s.id}`} className={card}>
              <span className="inline-flex items-center gap-1 text-label-lg font-extrabold"><Icon name="search" size={18} /> Cảnh {s.title}</span>
              <span className="text-body-sm text-on-surface-variant">Có {s.shared.length} từ bạn vừa học: <span lang="zh-Hans">{s.shared.slice(0, 4).join("、")}</span></span>
            </Link>
          </li>
        ))}
        {grammar.map((g) => (
          <li key={g.pattern.id}>
            <Link href={`/grammar/${g.pattern.id}`} className={card}>
              <span className="inline-flex items-center gap-1 text-label-lg font-extrabold text-secondary"><Icon name="list_alt" size={18} /> Ngữ pháp: {g.pattern.title}</span>
              <span lang="zh-Hans" className="font-serif text-body-md">{g.sentence}</span>
              <span className="text-body-sm text-on-surface-variant">{g.pattern.pattern}</span>
            </Link>
          </li>
        ))}
        {testLevel !== null && (
          <li>
            <Link href={`/grammar/test/${testLevel}`} className={card}>
              <span className="inline-flex items-center gap-1 text-label-lg font-extrabold text-secondary"><Icon name="quiz" size={18} /> Thi ngữ pháp HSK {testLevel}</span>
              <span className="text-body-sm text-on-surface-variant">Ôn các mẫu câu của cấp này bằng 12 câu trộn.</span>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
