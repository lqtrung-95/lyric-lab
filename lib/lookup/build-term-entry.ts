import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { sinoVietForWord } from "@/lib/dictionary/sino-viet";

/** Thông tin từ điển của một từ: mọi trường lấy từ từ điển, không qua LLM (quy tắc 2). */
export interface TermEntry {
  term: string;
  traditional: string;
  pinyin: string;
  sinoViet: string | null;
  hskLevel: number | null;
  meanings: string[];
}

const MAX_MEANINGS = 4;

export function buildTermEntry(rows: DictWordRow[], sinoViet: ReadonlyMap<string, string[]>): TermEntry | null {
  const entry = pickPrimaryEntry(rows);
  if (!entry) return null;
  return {
    term: entry.simplified,
    traditional: entry.traditional,
    pinyin: entry.pinyin,
    sinoViet: sinoVietForWord(entry.traditional, sinoViet),
    hskLevel: entry.hsk_level,
    meanings: entry.meanings.slice(0, MAX_MEANINGS),
  };
}
