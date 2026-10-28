import "server-only";
import { subwordsOf } from "@/lib/analysis/build-line-pinyin";
import { tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { ALL_DIALOGUES, findDialogue } from "./dialogue-catalog";
import { dialogueLevel } from "./dialogue-level";
import type { DialogueDef, DialogueSummary, LevelBand } from "./dialogue-types";

const HAN = /\p{Script=Han}/u;

/** Các từ (jieba) của từng hội thoại, theo id. Chỉ tách từ, chưa tra từ điển. */
function wordsByDialogue(): Map<string, string[]> {
  return new Map(ALL_DIALOGUES.map((d) => {
    const lines = tokenizeLyricLines(normalizeLyricLines(d.lines.map((l, i) => ({ text: l.zh, start: i, end: i + 1 }))));
    return [d.id, lines.flatMap((l) => l.tokens.filter((t) => t.isHan).map((t) => t.simplified))] as const;
  }));
}

/** Cấp HSK của mọi hội thoại: một lượt tra từ điển cho cả kho (từ + đoạn con của từ ghép). Lỗi tra thì trả bản đồ rỗng (danh sách vẫn hiện, chỉ thiếu cấp). */
async function computeLevels(): Promise<Map<string, LevelBand | null>> {
  const words = wordsByDialogue();
  const unique = [...new Set([...words.values()].flat())].filter((w) => HAN.test(w));
  const dictionary = await lookupWords(createSupabaseServiceClient() as never, [...new Set([...unique, ...unique.flatMap(subwordsOf)])]);
  return new Map([...words].map(([id, ws]) => [id, dialogueLevel(ws, dictionary)]));
}

let levelsPromise: Promise<Map<string, LevelBand | null>> | null = null;

/** Cấp được tính một lần cho mỗi tiến trình server (kho cố định); tra lỗi thì lần sau thử lại. */
function getLevels(): Promise<Map<string, LevelBand | null>> {
  levelsPromise ??= computeLevels().catch(() => {
    levelsPromise = null;
    return new Map<string, LevelBand | null>();
  });
  return levelsPromise;
}

export async function loadDialogueSummaries(): Promise<DialogueSummary[]> {
  const levels = await getLevels();
  return ALL_DIALOGUES.map((d) => ({
    id: d.id, title: d.title, topic: d.topic, speakers: d.speakers, lineCount: d.lines.length, sceneId: d.sceneId,
    level: levels.get(d.id) ?? null,
    haystack: [d.title.zh, d.title.vi, ...d.lines.flatMap((l) => [l.zh, l.vi])].join(" ").toLowerCase(),
  }));
}

export interface DialogueDetail { dialogue: DialogueDef; pinyin: Record<string, string>; level: LevelBand | null }

/** Một hội thoại kèm pinyin từ từ điển và cấp HSK. Null nếu không có. */
export async function loadDialogue(id: string): Promise<DialogueDetail | null> {
  const dialogue = findDialogue(id);
  if (!dialogue) return null;
  const [pinyin, levels] = await Promise.all([annotatePinyin(dialogue.lines.map((l) => l.zh)), getLevels()]);
  return { dialogue, pinyin, level: levels.get(id) ?? null };
}
