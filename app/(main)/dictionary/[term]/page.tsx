import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CompoundWords } from "@/components/tra-tu/compound-words";
import { ExampleSentences } from "@/components/tra-tu/example-sentences";
import { SaveCardButton } from "@/components/tra-tu/save-card-button";
import { StrokeSection } from "@/components/tra-tu/stroke-section";
import { WordMap } from "@/components/tra-tu/word-map";
import { WordPractice } from "@/components/tra-tu/word-practice";
import { WordHeader } from "@/components/tra-tu/word-header";
import { WordMeanings } from "@/components/tra-tu/word-meanings";
import { WordRelated } from "@/components/tra-tu/word-related";
import { WordNoteCard } from "@/components/tra-tu/word-note-card";
import { WordRelationsCard } from "@/components/tra-tu/word-relations-card";
import type { ExampleSentence } from "@/lib/courses/course-types";
import { loadTermSentences } from "@/lib/courses/load-term-sentences";
import { loadRadicalChars } from "@/lib/radicals/load-radical-chars";
import { radicalByChar } from "@/lib/radicals/radicals-core";
import { ENTRIES } from "@/lib/radicals/radicals";
import { loadSoundAlikes } from "@/lib/tra-tu/load-sound-alikes";
import { loadCompounds } from "@/lib/tra-tu/load-compounds";
import { findExploreScene } from "@/lib/tra-tu/find-explore-scene";
import { loadPracticePool } from "@/lib/tra-tu/load-practice-pool";
import { loadHanziInfo } from "@/lib/tra-tu/load-hanzi-info";
import { loadWordMap } from "@/lib/tra-tu/load-word-map";
import { loadWordDetail } from "@/lib/tra-tu/load-word-detail";
import { savedItemForDetail } from "@/lib/tra-tu/saved-item-for-detail";
import { readWordNote } from "@/lib/tra-tu/word-note-store";
import { enrichRelations, readWordRelations } from "@/lib/tra-tu/word-relations-store";

import { EtymologyBlock } from "./etymology-block";

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
  if (!detail) redirect(`/dictionary?q=${encodeURIComponent(term.slice(0, 80))}`);

  const [note, rel, sentences, compounds, pool] = await Promise.all([
    readWordNote(detail.simplified).catch(() => ({ stored: null, tableReady: false })),
    readWordRelations(detail.simplified).catch(() => ({ raw: null, tableReady: false, model: null })),
    loadTermSentences([detail.simplified], 6).catch(() => ({})),
    loadCompounds(detail.simplified),
    loadPracticePool(detail.hskLevel),
  ]);
  const firstHan = [...detail.simplified][0];
  const info = (await loadHanziInfo([firstHan])).items[0];
  const mapGroups = await loadWordMap(detail.simplified, compounds, info);
  const examples = (sentences as Record<string, ExampleSentence[]>)[detail.simplified] ?? [];
  const mainPinyin = detail.readings[0]?.pinyin ?? "";
  const rad = info ? radicalByChar(info.radical.char) : undefined;
  const radEntry = rad ? ENTRIES[rad.num - 1] : null;
  const [sounds, radChars] = await Promise.all([
    loadSoundAlikes(detail.simplified, mainPinyin),
    radEntry ? loadRadicalChars(radEntry).catch(() => []) : Promise.resolve([]),
  ]);
  const relations = rel.raw ? await enrichRelations(rel.raw, detail.simplified) : null;
  const hasViMeaning = !!detail.gloss || !!note.stored;
  const cardItem = savedItemForDetail(detail, examples[0], note.stored?.note.gloss ?? null);

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <WordHeader detail={detail}><SaveCardButton term={detail.simplified} item={cardItem} /></WordHeader>
      <WordNoteCard term={detail.simplified} approvedGloss={detail.gloss} initial={note.stored} canAskAi={note.tableReady} />
      <WordRelationsCard term={detail.simplified} initial={relations} canAskAi={rel.tableReady} />
      <WordMeanings readings={detail.readings} defaultOpen={!hasViMeaning} />
      <ExampleSentences term={detail.simplified} forms={[detail.simplified, ...detail.traditionalForms]} examples={examples} />
      <WordPractice term={detail.simplified} examples={examples} pool={pool} scene={findExploreScene(detail.simplified)} />
      <CompoundWords term={detail.simplified} forms={[detail.simplified, ...detail.traditionalForms]} words={compounds} />
      <WordRelated same={sounds.same} otherTone={sounds.otherTone} radical={[...detail.simplified].length === 1 ? radEntry : null} radicalChars={radChars} char={detail.simplified} />
      <WordMap term={detail.simplified} groups={mapGroups} />
      <StrokeSection term={detail.simplified} />
      <EtymologyBlock term={detail.simplified} />
    </div>
  );
}
