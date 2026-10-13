import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { buildHskRows, type HskLevel, type HskRow } from "./build-hsk-rows";

const PAGE = 1000;

async function loadHskRows(level: HskLevel): Promise<HskRow[]> {
  const sb = createSupabaseServiceClient();
  const rows: DictWordRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from("dict_words").select("simplified,traditional,pinyin,meanings,hsk_level,frequency")
      .eq("hsk_level", level).order("simplified").range(from, from + PAGE - 1);
    if (error) throw new Error(`getHskRows: ${error.message}`);
    rows.push(...((data ?? []) as DictWordRow[]));
    if ((data ?? []).length < PAGE) break;
  }
  const chars = [...new Set(rows.flatMap((r) => [...r.traditional]).filter((c) => /\p{Script=Han}/u.test(c)))];
  const sinoViet = new Map<string, string[]>();
  for (let i = 0; i < chars.length; i += 200) {
    const { data, error } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars.slice(i, i + 200));
    if (error) throw new Error(`getHskRows (Hán Việt): ${error.message}`);
    for (const r of data ?? []) sinoViet.set(r.hanzi as string, r.readings as string[]);
  }
  return buildHskRows(rows, sinoViet);
}

// Từ điển ít đổi: nhớ kết quả 1 ngày (qua mọi yêu cầu) để không truy vấn hàng nghìn dòng mỗi lần mở trang; `cache` của React gộp lần gọi của metadata và trang trong cùng một lần dựng.
const loadCached = unstable_cache(loadHskRows, ["hsk-rows-v1"], { revalidate: 86400 });

/** Từ vựng của một cấp HSK từ từ điển trong Supabase (dữ liệu công khai, chỉ đọc), kèm âm Hán Việt. */
export const getHskRows = cache((level: HskLevel): Promise<HskRow[]> => loadCached(level));
