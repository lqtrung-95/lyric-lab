"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { SelectField } from "@/components/ui/select-field";
import { Spinner } from "@/components/ui/spinner";
import { filterSavedItems, type SavedFilter } from "@/lib/library/filter-saved-items";
import { levelLabel } from "@/lib/preview/preview-format";
import { useSongSnippet } from "./use-song-snippet";
import { useVideoLessonIds } from "./use-video-lesson-ids";
import { useLearnerState } from "@/lib/user-state/use-learner-state";


/** Tab "Từ đã lưu" (S9): tìm kiếm, lọc theo cấp HSK và loại; mỗi từ dẫn về bài chứa nó và có thể bỏ lưu. */
export function SavedWordsTab() {
  const { state, toggleSaved } = useLearnerState();
  const [filter, setFilter] = useState<SavedFilter>({ query: "", level: "all", kind: "all" });
  const { play, player, loadingKey, error } = useSongSnippet();
  const items = useMemo(() => filterSavedItems(state.saved, filter), [state.saved, filter]);
  const videoIds = useVideoLessonIds(useMemo(() => state.saved.map((s) => s.videoId).filter(Boolean), [state.saved]));

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
            <li key={item.key} className="p-space-md">
              {/* Nội dung chiếm phần còn lại và tự cắt nghĩa quá dài (2 dòng); cụm nút giữ nguyên kích thước nên không bị đẩy xuống. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span lang="zh" className="font-serif text-headline-md text-on-surface">{item.term}</span>
                    {item.reading && <span className="text-pinyin-reading text-primary">{item.reading}</span>}
                    {item.sinoViet && <span className="text-hanviet-reading uppercase tracking-wider text-secondary">{item.sinoViet}</span>}
                  </p>
                  <p title={item.meaning} className="mt-0.5 line-clamp-2 text-body-md text-on-surface-variant">{item.meaning}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1 sm:flex-nowrap">
                  {item.type === "vocab" && <PronounceButton text={item.term} />}
                  {item.videoId && (
                    <button type="button" onClick={() => play(item)} aria-busy={loadingKey === item.key} aria-label={`Nghe đoạn chứa ${item.term}`} title="Nghe đoạn chứa từ này"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary hover:bg-surface-container-high">
                      {loadingKey === item.key ? <Spinner size={18} /> : <Icon name="play_circle" size={24} />}
                    </button>
                  )}
                  <span className="mx-1 shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">{levelLabel(item.level ?? null)}</span>
                  {item.videoId && <Link href={`${videoIds.has(item.videoId) ? "/video" : "/learn"}/${item.videoId}`} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-label-md font-medium text-primary hover:bg-surface-container">Xem bài</Link>}
                  <button type="button" onClick={() => toggleSaved(item)} aria-label={`Bỏ lưu ${item.term}`} className="min-h-11 shrink-0 rounded-full px-3 text-label-md text-on-surface-variant hover:bg-surface-container">Bỏ lưu</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-space-sm text-label-md text-error">{error}</p>}
      {player}
    </div>
  );
}
