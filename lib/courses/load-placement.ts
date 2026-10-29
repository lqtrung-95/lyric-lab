import "server-only";
import { lookupWords, pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { unitContentSchema, type ExampleSentence } from "./course-types";
import { loadTermSentences } from "./load-term-sentences";
import { buildPlacementQuestions, pickCandidates, PLACEMENT_LEVELS, type PlacementQuestion, type PlacementWord } from "./placement";
import { TtlCache } from "./ttl-cache";

// Kho từ (có nghĩa tiếng Việt) theo cấp đổi rất ít: nhớ 30 phút trong instance. Mỗi lần gọi vẫn lấy mẫu ngẫu nhiên khác nhau.
const poolCache = new TtlCache<Record<number, PlacementWord[]>>(30 * 60_000, 1);
const SENTENCE_CHUNK = 60;

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

/** Bổ sung pinyin (từ điển, một truy vấn) và một câu thật (kho câu video đã duyệt) cho các từ ứng viên. Lỗi thì bỏ qua: thiếu thì dạng câu đó tự rơi về dạng khác. */
async function enrich(candidates: Record<number, PlacementWord[]>): Promise<Record<number, PlacementWord[]>> {
  const terms = [...new Set(Object.values(candidates).flat().map((w) => w.term))];
  const pinyin = new Map<string, string>();
  try {
    const rows = await lookupWords(createSupabaseServiceClient() as never, terms);
    for (const [term, entries] of rows) { const p = pickPrimaryEntry(entries)?.pinyin; if (p) pinyin.set(term, p); }
  } catch { /* thiếu pinyin: không dựng được câu pinyin */ }
  const sentences: Record<string, ExampleSentence[]> = {};
  for (let i = 0; i < terms.length; i += SENTENCE_CHUNK) {
    Object.assign(sentences, await loadTermSentences(terms.slice(i, i + SENTENCE_CHUNK), 1).catch(() => ({})));
  }
  return Object.fromEntries(Object.entries(candidates).map(([level, words]) => [level, words.map((w): PlacementWord => {
    const s = sentences[w.term]?.[0];
    return { ...w, pinyin: pinyin.get(w.term) ?? "", sentence: s ? { text: s.text, translation: s.translation } : undefined };
  })]));
}

/** Bài xếp lớp: 6 câu mỗi cấp HSK 1–6 gồm nhiều dạng (nghĩa, pinyin/thanh điệu, điền từ vào câu thật, nhớ chữ, nghe hiểu), từ ngẫu nhiên trong các chặng đã có nghĩa tiếng Việt. */
export async function loadPlacementQuestions(): Promise<PlacementQuestion[]> {
  const pools = await loadPools();
  return buildPlacementQuestions(pools, await enrich(pickCandidates(pools)));
}
