import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { buildHskRows, type HskLevel, type HskRow, type VietnameseGloss } from "./build-hsk-rows";
import { loadHskDictRows } from "./load-hsk-dict-rows";

async function loadHskRows(level: HskLevel): Promise<HskRow[]> {
  const sb = createSupabaseServiceClient();
  const rows = await loadHskDictRows(sb as never, level);
  const chars = [...new Set(rows.flatMap((r) => [...r.traditional]).filter((c) => /\p{Script=Han}/u.test(c)))];
  const sinoViet = new Map<string, string[]>();
  for (let i = 0; i < chars.length; i += 200) {
    const { data, error } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars.slice(i, i + 200));
    if (error) throw new Error(`getHskRows (Hán Việt): ${error.message}`);
    for (const r of data ?? []) sinoViet.set(r.hanzi as string, r.readings as string[]);
  }
  // Nghĩa tiếng Việt (bảng `dict_word_vi`): chưa chạy migration hoặc lỗi đọc thì trang vẫn dựng, chỉ thiếu nghĩa Việt.
  const vietnamese = new Map<string, VietnameseGloss>();
  const terms = rows.map((r) => r.simplified);
  for (let i = 0; i < terms.length; i += 200) {
    const { data, error } = await sb.from("dict_word_vi").select("term,meaning,reading").in("term", terms.slice(i, i + 200));
    if (error) break;
    for (const r of data ?? []) vietnamese.set(r.term as string, { meaning: r.meaning as string, reading: (r.reading as string | null) ?? null });
  }
  return buildHskRows(rows, sinoViet, vietnamese);
}

// Từ điển ít đổi: nhớ kết quả 1 ngày (qua mọi yêu cầu) để không truy vấn hàng nghìn dòng mỗi lần mở trang; `cache` của React gộp lần gọi của metadata và trang trong cùng một lần dựng.
const loadCached = unstable_cache(loadHskRows, ["hsk-rows-v5"], { revalidate: 86400 });

/** Từ vựng của một cấp HSK từ từ điển trong Supabase (dữ liệu công khai, chỉ đọc), kèm âm Hán Việt. */
export const getHskRows = cache((level: HskLevel): Promise<HskRow[]> => loadCached(level));
