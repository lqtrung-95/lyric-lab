import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrammarDetail } from "@/components/grammar/grammar-detail";
import { ExampleSentences } from "@/components/tra-tu/example-sentences";
import type { ExampleSentence } from "@/lib/courses/course-types";
import { loadTermSentences } from "@/lib/courses/load-term-sentences";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { GRAMMAR_PATTERNS, grammarById } from "@/lib/grammar/grammar-patterns";
import { plain } from "@/lib/grammar/grammar-types";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = grammarById((await params).id);
  return { title: p ? `${p.title} · Ngữ pháp` : "Ngữ pháp", robots: { index: false } };
}

export default async function GrammarPatternPage({ params }: { params: Params }) {
  const p = grammarById((await params).id);
  if (!p) notFound();
  const term = p.term ?? p.key[0];
  const [pinyin, sentences] = await Promise.all([
    annotatePinyin([...p.examples.map((e) => plain(e.zh)), ...p.mistakes.map((m) => m.right)]),
    loadTermSentences([term], 4).catch(() => ({})),
  ]);
  const real = (sentences as Record<string, ExampleSentence[]>)[term] ?? [];
  const i = GRAMMAR_PATTERNS.findIndex((x) => x.id === p.id);
  return (
    <div className="flex flex-col gap-space-md">
      <GrammarDetail pattern={p} pinyin={pinyin} prev={GRAMMAR_PATTERNS[i - 1] ?? null} next={GRAMMAR_PATTERNS[i + 1] ?? null} />
      {real.length > 0 && (
        <div className="mx-auto w-full max-w-3xl space-y-space-sm">
          <h2 className="text-headline-sm">Gặp trong bài hát và video</h2>
          <p className="text-body-md text-on-surface-variant">Các câu thật có chứa “{term}”, nghe đúng đoạn để thấy mẫu này được dùng ra sao.</p>
          <ExampleSentences term={term} forms={p.key} examples={real} />
        </div>
      )}
    </div>
  );
}
