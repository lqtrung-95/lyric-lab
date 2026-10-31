"use client";

import { useCallback } from "react";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { EMPTY_NOTES, parseWordNotes, setWordNote, WORD_NOTES_EVENT, WORD_NOTES_KEY, type WordNotes } from "@/lib/words/word-notes";

function readLocal(): WordNotes {
  try { return parseWordNotes(JSON.parse(localStorage.getItem(WORD_NOTES_KEY) ?? "null")); } catch { return EMPTY_NOTES; }
}

/** Ghi chú cá nhân theo từ, lưu ở thiết bị này (chưa đồng bộ tài khoản). */
export function useWordNotes() {
  const [notes, write] = useLocalJson<WordNotes>(WORD_NOTES_KEY, WORD_NOTES_EVENT, parseWordNotes, EMPTY_NOTES);
  const save = useCallback((term: string, text: string) => write(setWordNote(readLocal(), term, text)), [write]);
  return { notes, save };
}
