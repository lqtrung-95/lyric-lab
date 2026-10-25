import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { WORD_NOTE_PROMPT_VERSION } from "./build-word-note-prompt";
import { wordMeaningNoteSchema, type StoredWordNote } from "./word-note-schema";

const KIND = "meaning";

/** Bản giải nghĩa AI đã lưu của từ; null khi chưa có HOẶC bảng chưa tạo (migration do người dùng chạy tay). `tableReady` cho giao diện biết có nên hiện nút nhờ AI. */
export async function readWordNote(term: string): Promise<{ stored: StoredWordNote | null; tableReady: boolean }> {
  const { data, error } = await createSupabaseServiceClient().from("dict_word_ai_notes").select("data,model")
    .eq("term", term).eq("kind", KIND).eq("prompt_version", WORD_NOTE_PROMPT_VERSION).maybeSingle();
  if (error) return { stored: null, tableReady: false };
  const parsed = data ? wordMeaningNoteSchema.safeParse(data.data) : null;
  return { stored: parsed?.success ? { note: parsed.data, model: data!.model as string } : null, tableReady: true };
}

export async function writeWordNote(term: string, value: StoredWordNote): Promise<void> {
  const { error } = await createSupabaseServiceClient().from("dict_word_ai_notes").upsert(
    { term, kind: KIND, prompt_version: WORD_NOTE_PROMPT_VERSION, data: value.note, model: value.model },
    { onConflict: "term,kind,prompt_version" },
  );
  if (error) throw new Error(error.message);
}
