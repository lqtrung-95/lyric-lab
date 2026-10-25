import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExampleSentences } from "@/components/tra-tu/example-sentences";
import { SaveCardButton } from "@/components/tra-tu/save-card-button";
import { WordHeader } from "@/components/tra-tu/word-header";
import { WordMeanings } from "@/components/tra-tu/word-meanings";
import { WordNoteCard } from "@/components/tra-tu/word-note-card";
import type { ExampleSentence } from "@/lib/courses/course-types";
import { loadTermSentences } from "@/lib/courses/load-term-sentences";
import { loadWordDetail } from "@/lib/tra-tu/load-word-detail";
import { savedItemForDetail } from "@/lib/tra-tu/saved-item-for-detail";
import { readWordNote } from "@/lib/tra-tu/word-note-store";

type Params = Promise<{ term: string }>;

const decode = (raw: string): string => { try { return decodeURIComponent(raw); } catch { return raw; } };
const HAN_TERM = /^\p{Script=Han}{1,12}$/u;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const term = decode((await params).term);
  return { title: `${term} · Tra từ`, robots: { index: false } };
}

export default async function WordPage({ params }: { params: Params }) {
  const term = decode((await params).term);
  // Không phải từ Hán hợp lệ hoặc không có trong từ điển: đưa về tìm kiếm với chính chuỗi đó (có thể là pinyin/nghĩa).
  const detail = HAN_TERM.test(term) ? await loadWordDetail(term) : null;
  if (!detail) redirect(`/tra-tu?q=${encodeURIComponent(term.slice(0, 80))}`);

  const [note, sentences] = await Promise.all([
    readWordNote(detail.simplified).catch(() => ({ stored: null, tableReady: false })),
    loadTermSentences([detail.simplified], 6).catch(() => ({})),
  ]);
  const examples = (sentences as Record<string, ExampleSentence[]>)[detail.simplified] ?? [];
  const cardItem = savedItemForDetail(detail, examples[0], note.stored?.note.gloss ?? null);

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <WordHeader detail={detail}><SaveCardButton term={detail.simplified} item={cardItem} /></WordHeader>
      <WordNoteCard term={detail.simplified} approvedGloss={detail.gloss} initial={note.stored} canAskAi={note.tableReady} />
      <WordMeanings readings={detail.readings} />
      <ExampleSentences term={detail.simplified} forms={[detail.simplified, ...detail.traditionalForms]} examples={examples} />
    </div>
  );
}
