"use client";

import { useSyncExternalStore } from "react";
import { readEntries, summarize, type FluencySummary } from "@/lib/speaking/fluency-stats";

const noSubscribe = () => () => {};
// Snapshot là chuỗi JSON (so sánh theo giá trị nên ổn định); phía server trả "" để không lệch khi hydrate.
const snapshot = () => JSON.stringify(summarize(readEntries(), Date.now()));

/** Chỉ số lưu loát 7 ngày gần nhất (lưu trên thiết bị này). Ẩn khi chưa có lượt nói nào, để người mới không thấy bảng toàn số 0. */
export function FluencyPanel() {
  const raw = useSyncExternalStore(noSubscribe, snapshot, () => "");
  const sum = raw ? (JSON.parse(raw) as FluencySummary) : null;
  if (!sum || sum.turns === 0) return null;
  const items = [
    { label: "Lượt đã nói", value: String(sum.turns) },
    { label: "Chữ Hán đã nói", value: String(sum.hanChars) },
    { label: "Từ đã dùng", value: String(sum.distinctWords) },
    { label: "Bắt đầu nói sau", value: sum.avgReactionMs === null ? "–" : `${(sum.avgReactionMs / 1000).toFixed(1)}s` },
  ];
  return (
    <section aria-labelledby="fluency-h" className="rounded-2xl bg-surface-container-low p-space-md">
      <h2 id="fluency-h" className="text-label-lg font-extrabold">Lưu loát 7 ngày qua</h2>
      <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((i) => <div key={i.label}><dt className="text-body-sm text-on-surface-variant">{i.label}</dt><dd className="font-serif text-headline-md">{i.value}</dd></div>)}
      </dl>
    </section>
  );
}
