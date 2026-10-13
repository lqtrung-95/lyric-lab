import "server-only";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { ConvertDeps } from "./convert-han-text";

/** Tra từ điển và bảng âm Hán Việt thật trong Supabase (dữ liệu công khai, chỉ đọc). */
export function createConvertDeps(): ConvertDeps {
  const sb = createSupabaseServiceClient();
  return {
    lookupWords: (terms) => lookupWords(sb as never, terms),
    sinoVietReadings: async (chars) => {
      const out = new Map<string, string[]>();
      for (let i = 0; i < chars.length; i += 200) {
        const { data, error } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars.slice(i, i + 200));
        if (error) throw new Error(`Tra âm Hán Việt lỗi: ${error.message}`);
        for (const r of data ?? []) out.set(r.hanzi as string, r.readings as string[]);
      }
      return out;
    },
  };
}
