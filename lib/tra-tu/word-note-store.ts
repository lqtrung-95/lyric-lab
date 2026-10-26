import "server-only";
import { readAiNote, writeAiNote } from "./ai-note-store";
import { WORD_NOTE_PROMPT_VERSION } from "./build-word-note-prompt";
import { wordMeaningNoteSchema, type StoredWordNote } from "./word-note-schema";

/** Bản giải nghĩa AI đã lưu của từ; null khi chưa có HOẶC bảng chưa tạo (`tableReady`). */
export async function readWordNote(term: string): Promise<{ stored: StoredWordNote | null; tableReady: boolean }> {
  const { row, tableReady } = await readAiNote(term, "meaning", WORD_NOTE_PROMPT_VERSION);
  const parsed = row ? wordMeaningNoteSchema.safeParse(row.data) : null;
  return { stored: parsed?.success ? { note: parsed.data, model: row!.model } : null, tableReady };
}

export const writeWordNote = (term: string, value: StoredWordNote): Promise<void> => writeAiNote(term, "meaning", WORD_NOTE_PROMPT_VERSION, value.note, value.model);
