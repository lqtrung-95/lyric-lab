import type { Metadata } from "next";
import { ModeTabs } from "@/components/review/mode-tabs";
import { TruthOrLieGame } from "@/components/practice/truth-or-lie-game";
import { TruthOrLieLobby } from "@/components/practice/truth-or-lie-lobby";
import { loadTruthSet } from "@/lib/practice/load-practice-sets";

export const metadata: Metadata = { title: "Hai thật một giả", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Hai thật một giả (真话还是假话): mỗi lần tải là một bộ câu ngẫu nhiên mới. */
export default async function TruthOrLiePage() {
  const set = await loadTruthSet();
  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Hai thật một giả</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Ba câu tiếng Trung đơn giản, hai câu đúng và một câu sai. Đọc kỹ rồi tìm câu sai. Luyện đọc hiểu, không tính điểm xếp hạng.</p>
        <div className="mt-space-md"><TruthOrLieLobby /></div>
        <div className="mt-space-md"><TruthOrLieGame key={set.trials.map((t) => t.options[0].zh).join("")} trials={set.trials} pinyin={set.pinyin} /></div>
      </div>
    </>
  );
}
