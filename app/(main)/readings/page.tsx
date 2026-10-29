import type { Metadata } from "next";
import Link from "next/link";
import { ListenSwitch } from "@/components/layout/listen-switch";
import { loadReadingSummaries } from "@/lib/readings/load-readings";

export const metadata: Metadata = { title: "Truyện ngắn", robots: { index: false } };

/** Truyện ngắn tự viết theo cấp HSK: đọc có pinyin, nghe từng câu, xem nghĩa Việt, rồi trả lời câu hỏi đọc hiểu. */
export default async function ReadingsPage() {
  const items = await loadReadingSummaries();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-md">
      <ListenSwitch current="readings" />
      <header>
        <h1 className="text-headline-lg">Truyện ngắn</h1>
        <p className="text-body-md text-on-surface-variant">Đọc truyện ngắn có pinyin, nghe từng câu và trả lời vài câu hỏi để kiểm tra mình hiểu bao nhiêu.</p>
      </header>
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {items.map((r) => (
          <li key={r.id}>
            <Link href={`/readings/${r.id}`} className="card-ink flex min-h-11 items-center gap-space-sm p-space-md hover:brightness-105">
              <span aria-hidden="true" className="text-3xl">{r.emoji}</span>
              <span className="min-w-0 flex-1">
                <span lang="zh-Hans" className="block font-serif text-headline-sm font-bold">{r.title.zh}</span>
                <span className="block text-body-md">{r.title.vi}</span>
                <span className="block text-label-md text-on-surface-variant">{r.sentenceCount} câu{r.level ? ` · HSK ${r.level >= 6 ? "6+" : r.level}` : ""}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
