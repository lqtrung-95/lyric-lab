"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { filterSavedItems, type SavedFilter } from "@/lib/library/filter-saved-items";
import { levelLabel } from "@/lib/preview/preview-format";
import { useLearnerState } from "@/lib/user-state/use-learner-state";


/** Tab "Từ đã lưu" (S9): tìm kiếm, lọc theo cấp HSK và loại; mỗi từ dẫn về bài chứa nó và có thể bỏ lưu. */
export function SavedWordsTab() {
  const { state, toggleSaved } = useLearnerState();
  const [filter, setFilter] = useState<SavedFilter>({ query: "", level: "all", kind: "all" });
  const items = useMemo(() => filterSavedItems(state.saved, filter), [state.saved, filter]);

  if (state.saved.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">
        Chưa lưu từ nào. Ở bước xem trước một bài, bấm “Lưu” ở từ hoặc ngữ pháp bạn muốn nhớ.
      </p>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-space-sm">
        <label className="flex-1 basis-56">
          <span className="sr-only">Tìm từ đã lưu</span>
          <input type="search" value={filter.query} onChange={(e) => setFilter({ ...filter, query: e.target.value })} placeholder="Tìm chữ Hán, pinyin, nghĩa…"
            className="min-h-11 w-full rounded-full bg-surface-container-high px-4 text-label-md text-on-surface" />
        </label>
        <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <span>Cấp</span>
          <SelectField value={filter.level} onChange={(e) => setFilter({ ...filter, level: e.target.value === "all" ? "all" : Number(e.target.value) })}>
            <option value="all">Tất cả</option>
            {[1, 2, 3, 4, 5, 6, 7].map((l) => <option key={l} value={l}>{levelLabel(l)}</option>)}
          </SelectField>
        </label>
        <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <span>Loại</span>
          <SelectField value={filter.kind} onChange={(e) => setFilter({ ...filter, kind: e.target.value as SavedFilter["kind"] })}>
            <option value="all">Tất cả</option>
            <option value="vocab">Từ vựng</option>
            <option value="grammar">Ngữ pháp</option>
          </SelectField>
        </label>
      </div>
      <p role="status" className="mt-space-sm text-label-md text-on-surface-variant">{items.length} / {state.saved.length} mục</p>
      {items.length === 0 ? (
        <p className="mt-space-md text-body-md text-on-surface-variant">Không có mục nào khớp bộ lọc.</p>
      ) : (
        <ul className="mt-space-sm divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest shadow-sm">
          {items.map((item) => (
            <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 p-space-md">
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span lang="zh" className="font-serif text-headline-md text-on-surface">{item.term}</span>
                  {item.reading && <span className="text-pinyin-reading text-primary">{item.reading}</span>}
                  {item.sinoViet && <span className="text-hanviet-reading uppercase tracking-wider text-secondary">{item.sinoViet}</span>}
                </p>
                <p className="text-body-md text-on-surface-variant">{item.meaning}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">{levelLabel(item.level ?? null)}</span>
                {item.videoId && <Link href={`/learn/${item.videoId}`} className="inline-flex min-h-11 items-center rounded-full px-3 text-label-md font-medium text-primary hover:bg-surface-container">Xem bài</Link>}
                <button type="button" onClick={() => toggleSaved(item)} aria-label={`Bỏ lưu ${item.term}`} className="min-h-11 rounded-full px-3 text-label-md text-on-surface-variant hover:bg-surface-container">Bỏ lưu</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
