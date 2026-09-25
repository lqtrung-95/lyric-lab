"use client";

import { useState } from "react";
import { SavedWordsTab } from "./saved-words-tab";
import { SongsTab } from "./songs-tab";

const TABS = [
  { id: "songs", label: "Bài hát" },
  { id: "words", label: "Từ đã lưu" },
] as const;

/** Thư viện (S9): tab Bài hát và tab Từ đã lưu, có trạng thái rỗng cho cả hai. */
export function LibraryScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("songs");
  return (
    <div>
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Thư viện</h1>
      <div role="tablist" aria-label="Thư viện" className="mt-space-md inline-flex gap-1 rounded-full bg-surface-container-low p-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full px-5 text-label-md transition-colors ${tab === t.id ? "bg-surface-container-high font-medium text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-space-lg">
        {tab === "songs" ? <SongsTab /> : <SavedWordsTab />}
      </div>
    </div>
  );
}
