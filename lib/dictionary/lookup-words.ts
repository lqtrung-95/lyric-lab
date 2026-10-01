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

// Mục chỉ là biến thể / tham chiếu sang mục khác (vd. 咲 → biến thể của 笑) không nên làm mục chính.
const VARIANT = /^(old |archaic |erhua |japanese |korean )?(variant|see |used in )/i;
// Quy ước CEDICT: pinyin viết hoa chữ đầu là mục họ người (vd. "Dū" = họ Đô, khác "dū"/"dōu" nghĩa thường). Chữ nhiều
// âm như 都/还 hay bị gắn nhầm cấp HSK vào đúng mục họ người này (dữ liệu nguồn HSK gộp chung các cách đọc một chữ
// làm một "từ"), nên hạ ưu tiên mục họ người trước khi so cấp HSK.
const SURNAME_PINYIN = /^[A-ZÀ-Ỹ]/;

// Vài chữ nhiều âm mà mọi mục cùng được gắn chung một cấp HSK (dữ liệu nguồn không phân biệt được cách đọc phổ
// biến hơn — vd. 说 cả "shuō: nói" lẫn "shuì: thuyết phục" (cổ, hiếm) cùng cấp 1) nên phải ghi đè thủ công theo
// cách đọc thông dụng trong tiếng Trung hiện đại. Chỉ thêm khi đã xác nhận qua báo lỗi thực tế.
const COMMON_READING: Record<string, string> = {
  说: "shuō",
  听: "tīng",
};
const pinyinKey = (p: string) => p.replace(/\s+/g, "").toLowerCase();

/**
 * Chọn mục chính của từ nhiều âm: ghi đè thủ công (nếu có) thắng tuyệt đối; không thì bỏ mục biến thể và mục họ
 * người nếu còn lựa chọn khác, ưu tiên mục có cấp HSK (cấp thấp nhất), sau đó mục đầu tiên.
 */
export function pickPrimaryEntry(entries: DictWordRow[]): DictWordRow | null {
  if (entries.length === 0) return null;
  const override = COMMON_READING[entries[0].simplified];
  if (override) {
    const forced = entries.find((e) => pinyinKey(e.pinyin) === pinyinKey(override));
    if (forced) return forced;
  }
  const nonVariant = entries.filter((e) => !VARIANT.test(e.meanings[0] ?? ""));
  let pool = nonVariant.length > 0 ? nonVariant : entries;
  const nonSurname = pool.filter((e) => !SURNAME_PINYIN.test(e.pinyin));
  pool = nonSurname.length > 0 ? nonSurname : pool;
  const withLevel = pool.filter((e) => e.hsk_level !== null).sort((a, b) => a.hsk_level! - b.hsk_level!);
  return withLevel[0] ?? pool[0];
}
