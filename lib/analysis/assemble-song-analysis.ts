import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { sinoVietForWord } from "@/lib/dictionary/sino-viet";
import type { AnalyzedLine, LyricsSourceLabel, PreviewItem, SongAnalysis, TokenizedLine } from "./analysis-types";
import { PROMPT_VERSION } from "./build-analysis-prompt";
import type { LlmOutput } from "./llm-output-schema";
import type { ValidatedOutput } from "./validate-llm-output";

export interface AssembleInput {
  videoId: string;
  lyricsSource: LyricsSourceLabel;
  track?: { title: string; artist: string };
  lines: TokenizedLine[];
  llm: Pick<LlmOutput, "summary" | "moods">;
  validated: ValidatedOutput;
  dictionary: ReadonlyMap<string, DictWordRow[]>;
  /** Bảng âm Hán Việt theo chữ phồn thể. */
  sinoViet: ReadonlyMap<string, string[]>;
  model: string;
}

/** Ghép lựa chọn của LLM với dữ liệu từ điển: pinyin, cấp HSK, Hán Việt và vị trí không bao giờ lấy từ LLM. */
export function assembleSongAnalysis(input: AssembleInput): SongAnalysis {
  const { lines, validated, dictionary, sinoViet } = input;

  const vocabItems: PreviewItem[] = validated.vocab.map((v) => ({
    id: `vocab:${v.candidate.term}`,
    type: "vocab",
    term: v.candidate.term,
    reading: v.candidate.pinyin,
    sinoViet: sinoVietForWord(v.candidate.traditional, sinoViet) ?? undefined,
    level: v.candidate.hskLevel,
    meaningInContext: v.meaningInContext,
    explanation: v.contextNote,
    occurrences: v.candidate.occurrences,
    priority: v.priority,
  }));

  const grammarItems: PreviewItem[] = validated.grammar.map((g, i) => ({
    id: `grammar:${i}`,
    type: "grammar",
    term: g.pattern,
    level: g.level ?? null,
    meaningInContext: g.explanation,
    example: g.example,
    commonMistake: g.commonMistake,
    occurrences: g.occurrences,
    priority: g.priority,
  }));

  const itemIdByTerm = new Map(vocabItems.map((i) => [i.term, i.id]));
  const analyzedLines: AnalyzedLine[] = lines.map((line) => ({
    index: line.index,
    text: line.text,
    start: line.start,
    end: line.end,
    pinyin: line.tokens
      .map((t) => (t.isHan ? pickPrimaryEntry(dictionary.get(t.simplified) ?? [])?.pinyin ?? t.text : t.text))
      .join(" "),
    translation: validated.translations.get(line.index),
    tokens: line.tokens.map((t) => ({ text: t.text, itemId: itemIdByTerm.get(t.simplified) })),
  }));

  return {
    videoId: input.videoId,
    lyricsSource: input.lyricsSource,
    track: input.track,
    summary: input.llm.summary,
    moods: input.llm.moods,
    lines: analyzedLines,
    items: [...vocabItems, ...grammarItems].sort((a, b) => b.priority - a.priority),
    promptVersion: PROMPT_VERSION,
    model: input.model,
  };
}
