import type { AnalyzedLine, PreviewItem, SongAnalysis } from "@/lib/analysis/analysis-types";
import { buildChoices, buildCloze } from "@/lib/practice/cloze";
import { seededRng, shuffle } from "@/lib/practice/random";
import type { RoomChoice, RoomQuestionPublic, RoomQuestionSet } from "./room-question-types";
import { splitPinyinAroundTerm } from "./split-pinyin";

const HAN = /\p{Script=Han}/u;
const CHOICES_PER_QUESTION = 4;
const MIN_CLIP_SEC = 2;
const MAX_CLIP_SEC = 12;
const MAX_MEANING_CHARS = 60;

export type RoomSongInput = Pick<SongAnalysis, "videoId" | "lines" | "items">;

const hanCount = (s: string) => [...s].filter((c) => HAN.test(c)).length;
const shorten = (s: string) => (s.length > MAX_MEANING_CHARS ? `${s.slice(0, MAX_MEANING_CHARS - 1)}…` : s);

/** Từ làm ô trống được khi nó xuất hiện đúng một lần trong dòng (xuất hiện lại thì phần còn lại của dòng làm lộ đáp án) và dòng đủ dài. */
function isClozeFriendly(term: string, text: string): boolean {
  if (!HAN.test(term)) return false;
  if (text.split(term).length !== 2) return false;
  return hanCount(text) >= hanCount(term) + 2 && buildCloze(term, text) !== null;
}

interface Candidate {
  item: PreviewItem;
  line: AnalyzedLine;
}

/** Cặp (từ vựng, dòng chứa nó) dùng được cho Điền lời: mỗi từ chỉ lấy dòng đầu tiên phù hợp. */
function collectCandidates(vocab: PreviewItem[], lineByIndex: ReadonlyMap<number, AnalyzedLine>): Candidate[] {
  const out: Candidate[] = [];
  for (const item of vocab) {
    for (const occ of item.occurrences) {
      const line = lineByIndex.get(occ.lineIndex);
      if (line && isClozeFriendly(item.term, line.text)) {
        out.push({ item, line });
        break;
      }
    }
  }
  return out;
}

/** Mục ngữ pháp của dòng, chỉ khi cả mẫu câu lẫn lời giải thích không chứa từ đáp án (không làm lộ đáp án). */
function safeGrammarNote(items: PreviewItem[], lineIndex: number, answer: string): { pattern: string; explanation: string } | null {
  const grammar = items.find((i) => i.type === "grammar" && i.occurrences.some((o) => o.lineIndex === lineIndex));
  if (!grammar) return null;
  const text = `${grammar.term} ${grammar.meaningInContext} ${grammar.explanation ?? ""}`;
  return text.includes(answer) ? null : { pattern: grammar.term, explanation: grammar.meaningInContext };
}

function clipRange(line: AnalyzedLine): { clipStart: number; clipEnd: number } {
  const clipStart = Math.max(0, line.start);
  const length = Math.min(MAX_CLIP_SEC, Math.max(MIN_CLIP_SEC, line.end - line.start));
  return { clipStart, clipEnd: clipStart + length };
}

/**
 * Dựng bộ câu Điền lời cho một phòng từ phân tích của bài. Cùng `seed` ra cùng bộ; mỗi dòng và mỗi từ chỉ ra một lần; bốn đáp án
 * gồm từ đúng và ba từ nhiễu lấy từ các từ vựng khác của chính bài (nhiễu không nằm trong dòng nên không thể là đáp án thứ hai).
 * Trả null khi bài không đủ dữ liệu cho `count` câu (bài đó không chọn được cho phòng).
 */
export function buildRoomQuestions(song: RoomSongInput, seed: number, count: number): RoomQuestionSet | null {
  const rng = seededRng(seed);
  const vocab = song.items.filter((i) => i.type === "vocab");
  const lineByIndex = new Map(song.lines.map((l) => [l.index, l]));
  const byTerm = new Map(vocab.map((i) => [i.term, i]));
  const pool = vocab.map((i) => i.term);

  const questions: RoomQuestionPublic[] = [];
  const correctIndexes: number[] = [];
  const correctTerms: string[] = [];
  const usedLines = new Set<number>();

  for (const { item, line } of shuffle(collectCandidates(vocab, lineByIndex), rng)) {
    if (questions.length === count) break;
    if (usedLines.has(line.index)) continue;
    const terms = buildChoices(item.term, pool, line.text, rng, CHOICES_PER_QUESTION);
    if (terms.length < CHOICES_PER_QUESTION) continue;

    const cloze = buildCloze(item.term, line.text)!;
    const pinyin = splitPinyinAroundTerm(line.pinyin, item.reading);
    const choices: RoomChoice[] = terms.map((t) => {
      const it = byTerm.get(t);
      return { term: t, reading: it?.reading ?? null, sinoViet: it?.sinoViet ?? null, meaning: shorten(it?.meaningInContext ?? "") };
    });
    usedLines.add(line.index);
    questions.push({
      videoId: song.videoId,
      lineIndex: line.index,
      before: cloze.before,
      after: cloze.after,
      pinyinBefore: pinyin?.before ?? null,
      pinyinAfter: pinyin?.after ?? null,
      translation: line.translation ?? null,
      choices,
      ...clipRange(line),
      grammarNote: safeGrammarNote(song.items, line.index, item.term),
    });
    correctIndexes.push(terms.indexOf(item.term));
    correctTerms.push(item.term);
  }
  return questions.length === count ? { questions, correctIndexes, correctTerms } : null;
}
