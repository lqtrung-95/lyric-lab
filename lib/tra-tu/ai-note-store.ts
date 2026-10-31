import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export type AiNoteKind = "meaning" | "etymology" | "relations";

/** Bản ghi AI đã lưu (bảng `dict_word_ai_notes`); `tableReady` false khi bảng chưa tạo (migration do người dùng chạy tay) để giao diện ẩn nút nhờ AI. */
export async function readAiNote(term: string, kind: AiNoteKind, version: string): Promise<{ row: { data: unknown; model: string } | null; tableReady: boolean }> {
  const { data, error } = await createSupabaseServiceClient().from("dict_word_ai_notes").select("data,model")
    .eq("term", term).eq("kind", kind).eq("prompt_version", version).maybeSingle();
  if (error) return { row: null, tableReady: false };
  return { row: data ? { data: data.data, model: data.model as string } : null, tableReady: true };
}

export async function writeAiNote(term: string, kind: AiNoteKind, version: string, data: unknown, model: string): Promise<void> {
  const { error } = await createSupabaseServiceClient().from("dict_word_ai_notes").upsert(
    { term, kind, prompt_version: version, data, model }, { onConflict: "term,kind,prompt_version" },
  );
  if (error) throw new Error(error.message);
}
