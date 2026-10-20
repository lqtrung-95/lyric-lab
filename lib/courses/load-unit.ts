import "server-only";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { QUIZ_LENGTH } from "./build-unit-quiz";
import { unitContentSchema, type UnitContent } from "./course-types";
import { TtlCache } from "./ttl-cache";
import { CHECKPOINT_POOL, CHECKPOINT_QUIZ_LENGTH, FINAL_POOL, FINAL_QUIZ_LENGTH, pickReviewTerms, type ReviewSource } from "./review-pool";
import { loadTermSentences } from "./load-term-sentences";
import type { UnitDetail, UnitKind, UnitWord } from "./unit-types";

const EXAMPLES_PER_WORD = 2;
// Chặng học là dữ liệu công khai, ít đổi: nhớ kết quả 10 phút trong bộ nhớ instance. Chặng ôn lấy mẫu ngẫu nhiên mỗi lần nên KHÔNG đệm (người học nhận mẫu mới).
const unitCache = new TtlCache<UnitDetail | null>(10 * 60_000, 300);

/** Đọc một chặng đang hiện (`listed`) kèm thông tin từ điển và câu ví dụ thật của từng từ. Trả null nếu khóa/chặng không có hoặc nội dung sai định dạng. */
export async function loadUnit(slug: string, idx: number, weak: string[] = []): Promise<UnitDetail | null> {
  const key = `${slug}/${idx}`;
  const cached = unitCache.get(key);
  if (cached !== undefined) return cached;
  const unit = await loadUnitUncached(slug, idx, weak);
  if (!unit || unit.unit.kind === "hsk") unitCache.set(key, unit);
  return unit;
}

async function loadUnitUncached(slug: string, idx: number, weak: string[]): Promise<UnitDetail | null> {
  const sb = createSupabaseServiceClient();
  const course = await sb.from("courses").select("id,slug,title").eq("slug", slug).eq("status", "listed").maybeSingle();
  if (!course.data) return null;
  const unit = await sb.from("course_units").select("id,idx,title,content").eq("course_id", course.data.id).eq("idx", idx).eq("status", "listed").maybeSingle();
  if (!unit.data) return null;
  const content = unitContentSchema.safeParse(unit.data.content);
  if (!content.success) return null;

  // Đếm tổng chặng và lấy danh sách từ chạy song song (hai truy vấn độc lập).
  const [total, pool] = await Promise.all([
    sb.from("course_units").select("id", { count: "exact", head: true }).eq("course_id", course.data.id).eq("status", "listed"),
    termPool(sb, course.data.id as string, content.data, weak),
  ]);
  if (!pool) return null;
  const { terms, glosses, emojis, tips } = pool;
  const [entries, examples] = await Promise.all([Promise.all(terms.map((t) => lookupTermEntry(t))), loadTermSentences(terms, EXAMPLES_PER_WORD)]);
  const words: UnitWord[] = terms.map((term, i) => ({
    term,
    pinyin: entries[i]?.pinyin ?? "",
    sinoViet: entries[i]?.sinoViet ?? null,
    hskLevel: entries[i]?.hskLevel ?? null,
    gloss: glosses?.[term] ?? null,
    emoji: emojis?.[term],
    tip: tips?.[term],
    meanings: entries[i]?.meanings ?? [],
    examples: examples[term] ?? [],
  }));
  const kind: UnitKind = content.data.kind === "hsk" ? "hsk" : content.data.variant;
  const quizLength = kind === "final" ? FINAL_QUIZ_LENGTH : kind === "checkpoint" ? CHECKPOINT_QUIZ_LENGTH : QUIZ_LENGTH;
  return { course: { slug: course.data.slug as string, title: course.data.title as string }, unit: { id: unit.data.id as string, idx: unit.data.idx as number, title: unit.data.title as string, topic: content.data.topic ?? null, total: total.count ?? 0, kind, quizLength }, words };
}

/** Từ của chặng: chặng học dùng danh sách riêng; chặng ôn lấy mẫu từ các chặng học nguồn của cùng khóa (nhóm `from`–`to`, hoặc cả khóa với bài cuối cấp). */
async function termPool(sb: ReturnType<typeof createSupabaseServiceClient>, courseId: string, content: UnitContent, weak: string[]): Promise<{ terms: string[]; glosses?: Record<string, string>; emojis?: Record<string, string>; tips?: Record<string, string> } | null> {
  if (content.kind === "hsk") return { terms: content.terms, glosses: content.glosses, emojis: content.emojis, tips: content.tips };
  const rows = await sb.from("course_units").select("idx,content").eq("course_id", courseId).eq("status", "listed").order("idx");
  if (rows.error) return null;
  const sources: ReviewSource[] = [];
  for (const r of rows.data as { idx: number; content: unknown }[]) {
    const c = unitContentSchema.safeParse(r.content);
    if (!c.success || c.data.kind !== "hsk") continue;
    if (content.variant === "checkpoint" && (r.idx < (content.from ?? 1) || r.idx > (content.to ?? Infinity))) continue;
    sources.push({ terms: c.data.terms, glosses: c.data.glosses });
  }
  if (sources.length === 0) return null;
  return pickReviewTerms(sources, content.variant === "final" ? FINAL_POOL : CHECKPOINT_POOL, Math.random, weak);
}
