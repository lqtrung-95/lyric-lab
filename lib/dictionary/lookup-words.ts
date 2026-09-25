import type { DictWordRow } from "./build-dictionary-rows";

const CHUNK = 200;

/** Phần tối thiểu của Supabase client mà tra từ điển cần (để dễ thay thế khi test). */
export interface DictQueryClient {
  from(table: "dict_words"): {
    select(columns: string): {
      in(column: "simplified", values: string[]): PromiseLike<{ data: DictWordRow[] | null; error: { message: string } | null }>;
    };
  };
}

/** Tra nhiều từ (giản thể) một lượt. Trả về map từ → các mục (từ nhiều âm có nhiều mục). */
export async function lookupWords(client: DictQueryClient, words: string[]): Promise<Map<string, DictWordRow[]>> {
  const unique = [...new Set(words)];
  const result = new Map<string, DictWordRow[]>();
  for (let i = 0; i < unique.length; i += CHUNK) {
    const { data, error } = await client
      .from("dict_words")
      .select("simplified,traditional,pinyin,meanings,hsk_level,frequency")
      .in("simplified", unique.slice(i, i + CHUNK));
    if (error) throw new Error(`Tra từ điển lỗi: ${error.message}`);
    for (const row of data ?? []) result.set(row.simplified, [...(result.get(row.simplified) ?? []), row]);
  }
  return result;
}

/** Chọn mục chính của từ nhiều âm: ưu tiên mục có cấp HSK (cấp thấp nhất), sau đó mục đầu tiên. */
export function pickPrimaryEntry(entries: DictWordRow[]): DictWordRow | null {
  if (entries.length === 0) return null;
  const withLevel = entries.filter((e) => e.hsk_level !== null).sort((a, b) => a.hsk_level! - b.hsk_level!);
  return withLevel[0] ?? entries[0];
}
