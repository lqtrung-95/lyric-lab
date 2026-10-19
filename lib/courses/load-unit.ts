import "server-only";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { unitContentSchema } from "./course-types";
import { loadTermSentences } from "./load-term-sentences";
import type { UnitDetail, UnitWord } from "./unit-types";

const EXAMPLES_PER_WORD = 2;

/** Đọc một chặng đang hiện (`listed`) kèm thông tin từ điển và câu ví dụ thật của từng từ. Trả null nếu khóa/chặng không có hoặc nội dung sai định dạng. */
export async function loadUnit(slug: string, idx: number): Promise<UnitDetail | null> {
  const sb = createSupabaseServiceClient();
  const course = await sb.from("courses").select("id,slug,title").eq("slug", slug).eq("status", "listed").maybeSingle();
  if (!course.data) return null;
  const unit = await sb.from("course_units").select("id,idx,title,content").eq("course_id", course.data.id).eq("idx", idx).eq("status", "listed").maybeSingle();
  if (!unit.data) return null;
  const content = unitContentSchema.safeParse(unit.data.content);
  if (!content.success) return null;
  const { terms, glosses, topic } = content.data;

  const total = await sb.from("course_units").select("id", { count: "exact", head: true }).eq("course_id", course.data.id).eq("status", "listed");
  const [entries, examples] = await Promise.all([Promise.all(terms.map((t) => lookupTermEntry(t))), loadTermSentences(terms, EXAMPLES_PER_WORD)]);
  const words: UnitWord[] = terms.map((term, i) => ({
    term,
    pinyin: entries[i]?.pinyin ?? "",
    sinoViet: entries[i]?.sinoViet ?? null,
    hskLevel: entries[i]?.hskLevel ?? null,
    gloss: glosses?.[term] ?? null,
    meanings: entries[i]?.meanings ?? [],
    examples: examples[term] ?? [],
  }));
  return { course: { slug: course.data.slug as string, title: course.data.title as string }, unit: { id: unit.data.id as string, idx: unit.data.idx as number, title: unit.data.title as string, topic: topic ?? null, total: total.count ?? 0 }, words };
}
