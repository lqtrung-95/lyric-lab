import "server-only";
import { readAiNote, writeAiNote } from "./ai-note-store";
import { ETYMOLOGY_PROMPT_VERSION } from "./etymology-note";
import type { StoredEtymologyNote } from "./hanzi-info-types";

const isNote = (d: unknown): d is StoredEtymologyNote["note"] => typeof (d as { story?: unknown } | null)?.story === "string";

export async function readEtymologyNote(char: string): Promise<{ stored: StoredEtymologyNote | null; tableReady: boolean }> {
  const { row, tableReady } = await readAiNote(char, "etymology", ETYMOLOGY_PROMPT_VERSION);
  return { stored: row && isNote(row.data) ? { note: row.data, model: row.model } : null, tableReady };
}

export const writeEtymologyNote = (char: string, v: StoredEtymologyNote): Promise<void> => writeAiNote(char, "etymology", ETYMOLOGY_PROMPT_VERSION, v.note, v.model);
