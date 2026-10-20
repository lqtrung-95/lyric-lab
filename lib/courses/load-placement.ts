import "server-only";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { unitContentSchema } from "./course-types";
import { buildPlacementQuestions, PLACEMENT_LEVELS, type PlacementQuestion, type PlacementWord } from "./placement";
import { TtlCache } from "./ttl-cache";

// Kho từ (có nghĩa tiếng Việt) theo cấp đổi rất ít: nhớ 30 phút trong instance. Mỗi lần gọi vẫn lấy mẫu ngẫu nhiên khác nhau.
const poolCache = new TtlCache<Record<number, PlacementWord[]>>(30 * 60_000, 1);

async function loadPools(): Promise<Record<number, PlacementWord[]>> {
  const cached = poolCache.get("pools");
  if (cached) return cached;
  const sb = createSupabaseServiceClient();
  const pools: Record<number, PlacementWord[]> = {};
  for (const level of PLACEMENT_LEVELS) {
    const course = await sb.from("courses").select("id").eq("slug", `hsk-${level}`).eq("status", "listed").maybeSingle();
    if (!course.data) continue;
    const units = await sb.from("course_units").select("content").eq("course_id", course.data.id).eq("status", "listed");
    const words: PlacementWord[] = [];
    for (const u of (units.data ?? []) as { content: unknown }[]) {
      const c = unitContentSchema.safeParse(u.content);
      if (!c.success || c.data.kind !== "hsk") continue;
      for (const term of c.data.terms) if (c.data.glosses?.[term]) words.push({ term, pinyin: "", gloss: c.data.glosses[term] });
    }
    pools[level] = words;
  }
  poolCache.set("pools", pools);
  return pools;
}

/** Bài xếp lớp: 5 câu mỗi cấp HSK 1–6 lấy ngẫu nhiên từ các chặng đã có nghĩa tiếng Việt, kèm pinyin tra từ từ điển. */
export async function loadPlacementQuestions(): Promise<PlacementQuestion[]> {
  const questions = buildPlacementQuestions(await loadPools());
  return Promise.all(questions.map(async (q) => ({ ...q, pinyin: (await lookupTermEntry(q.term))?.pinyin ?? "" })));
}
