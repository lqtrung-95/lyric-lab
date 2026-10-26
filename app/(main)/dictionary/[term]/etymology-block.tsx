import { EtymologySection } from "@/components/tra-tu/etymology-section";
import { readEtymologyNote } from "@/lib/tra-tu/etymology-note-store";
import { loadHanziInfo } from "@/lib/tra-tu/load-hanzi-info";
import type { StoredEtymologyNote } from "@/lib/tra-tu/hanzi-info-types";

/** Khối Chiết tự của trang chi tiết: tự ẩn khi bảng `dict_hanzi_info` chưa có (migration + script nạp do người dùng chạy) hoặc không có chữ nào. */
export async function EtymologyBlock({ term }: { term: string }) {
  const { ready, items } = await loadHanziInfo([...term].filter((c) => /\p{Script=Han}/u.test(c)));
  if (!ready) return null;
  const results = await Promise.all(items.map((i) => readEtymologyNote(i.hanzi).catch(() => ({ stored: null, tableReady: false }))));
  const notes: Record<string, StoredEtymologyNote | null> = Object.fromEntries(items.map((it, i) => [it.hanzi, results[i].stored]));
  return <EtymologySection items={items} notes={notes} canAskAi={results.every((r) => r.tableReady)} />;
}
