import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { HSK1_GLOSS_OVERRIDES } from "@/lib/courses/hsk1-gloss-overrides";
import { buildGlossIndex, type GlossIndex } from "./gloss-search";
import { buildSinoVietIndex, type SinoVietIndex } from "./sino-viet-search";

// Hai bảng nhỏ, ít đổi (≈9 nghìn chữ Hán Việt; ≈7 nghìn nghĩa đã duyệt) nên giữ trong bộ nhớ từng instance: tìm theo Hán Việt/nghĩa Việt không dấu cần quét toàn bảng, mà quét ở DB thì không dùng được chỉ mục.
const TTL = 6 * 60 * 60 * 1000;
const PAGE = 1000;

async function readAll<T>(table: string, columns: string, order: string): Promise<T[]> {
  const sb = createSupabaseServiceClient();
  const head = await sb.from(table).select("*", { count: "exact", head: true });
  if (head.error) throw new Error(`${table}: ${head.error.message}`);
  const pages = Math.ceil((head.count ?? 0) / PAGE);
  const parts = await Promise.all(Array.from({ length: pages }, async (_, i) => {
    const { data, error } = await sb.from(table).select(columns).order(order).range(i * PAGE, (i + 1) * PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data ?? []) as T[];
  }));
  return parts.flat();
}

const memoized = new Map<string, { promise: Promise<unknown>; expires: number }>();
/** Nhớ KẾT QUẢ ĐANG TẢI (không phải giá trị) để nhiều yêu cầu đồng thời chỉ tải một lần; lần tải lỗi bị bỏ để lần sau thử lại. */
function memo<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = memoized.get(key);
  if (hit && hit.expires > Date.now()) return hit.promise as Promise<T>;
  const promise = load();
  memoized.set(key, { promise, expires: Date.now() + TTL });
  promise.catch(() => memoized.delete(key));
  return promise;
}

export const loadSinoVietIndex = (): Promise<SinoVietIndex> =>
  memo("sino-viet", async () => buildSinoVietIndex(await readAll<{ hanzi: string; readings: string[] }>("dict_hanzi_sino_viet", "hanzi,readings", "hanzi")));

/** Nghĩa tiếng Việt đã duyệt: glosses trong các bài HSK của khóa học, sửa tay (`HSK1_GLOSS_OVERRIDES`) thắng. Bảng chưa có/lỗi thì rỗng, không làm hỏng tìm kiếm. */
export const loadGlossIndex = (): Promise<GlossIndex> =>
  memo("glosses", async () => {
    let units: { content: { glosses?: Record<string, string> } | null }[] = [];
    try { units = await readAll("course_units", "content", "id"); } catch { /* chưa chạy migration khóa học */ }
    const entries: Record<string, string> = {};
    for (const u of units) Object.assign(entries, u.content?.glosses ?? {});
    return buildGlossIndex({ ...entries, ...HSK1_GLOSS_OVERRIDES });
  });
