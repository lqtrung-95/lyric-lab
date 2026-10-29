import "server-only";
import { subwordsOf } from "@/lib/analysis/build-line-pinyin";
import { tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import { dialogueLevel } from "@/lib/dialogues/dialogue-level";
import type { LevelBand } from "@/lib/dialogues/dialogue-types";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { findReading, READINGS } from "./reading-catalog";
import { segmentReply, type ReplyToken } from "@/lib/roleplay/segment-reply";
import { allSentences, type ReadingDef, type ReadingSummary } from "./reading-types";

const HAN = /\p{Script=Han}/u;

/** Cấp HSK từng truyện (cùng quy tắc phân vị 90% như hội thoại): một lượt tra từ điển cho cả kho. Lỗi tra thì trả rỗng (danh sách vẫn hiện, chỉ thiếu cấp). */
async function computeLevels(): Promise<Map<string, LevelBand | null>> {
  const words = new Map(READINGS.map((r) => {
    const lines = tokenizeLyricLines(normalizeLyricLines(allSentences(r).map((s, i) => ({ text: s.zh, start: i, end: i + 1 }))));
    return [r.id, lines.flatMap((l) => l.tokens.filter((t) => t.isHan).map((t) => t.simplified))] as const;
  }));
  const unique = [...new Set([...words.values()].flat())].filter((w) => HAN.test(w));
  const dictionary = await lookupWords(createSupabaseServiceClient() as never, [...new Set([...unique, ...unique.flatMap(subwordsOf)])]);
  return new Map([...words].map(([id, ws]) => [id, dialogueLevel(ws, dictionary)]));
}

let levelsPromise: Promise<Map<string, LevelBand | null>> | null = null;
function getLevels(): Promise<Map<string, LevelBand | null>> {
  levelsPromise ??= computeLevels().catch(() => { levelsPromise = null; return new Map<string, LevelBand | null>(); });
  return levelsPromise;
}

export async function loadReadingSummaries(): Promise<ReadingSummary[]> {
  const levels = await getLevels();
  return READINGS.map((r) => ({ id: r.id, title: r.title, emoji: r.emoji, sentenceCount: allSentences(r).length, level: levels.get(r.id) ?? null }));
}

export interface ReadingDetail { reading: ReadingDef; pinyin: Record<string, string>; /** Từ của từng câu (jieba) để bấm tra. */ tokens: Record<string, ReplyToken[]>; level: LevelBand | null }

export async function loadReading(id: string): Promise<ReadingDetail | null> {
  const reading = findReading(id);
  if (!reading) return null;
  const [pinyin, levels] = await Promise.all([annotatePinyin(allSentences(reading).map((s) => s.zh)), getLevels()]);
  const tokens = Object.fromEntries(allSentences(reading).map((s) => [s.zh, segmentReply(s.zh)]));
  return { reading, pinyin, tokens, level: levels.get(id) ?? null };
}
