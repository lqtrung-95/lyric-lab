"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DiscoverTab } from "./discover-tab";
import { SavedWordsTab } from "./saved-words-tab";
import { SongsTab } from "./songs-tab";

const TABS = [
  { id: "songs", label: "Bài hát của tôi" },
  { id: "discover", label: "Khám phá" },
  { id: "words", label: "Từ đã lưu" },
] as const;

/** Thư viện (S9): tab Bài hát của tôi, Khám phá (bài người khác đã phân tích) và Từ đã lưu, có trạng thái rỗng. */
export type LibraryTab = (typeof TABS)[number]["id"];

export function LibraryScreen({ initialTab = "songs" }: { initialTab?: LibraryTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Đọc tab thẳng từ URL (không giữ state riêng): bấm lùi/tới của trình duyệt đổi URL thì tab đổi theo ngay,
  // không cần đồng bộ state thủ công. "songs" không ghi ?tab lên URL (giữ URL /library gốc sạch cho tab mặc định).
  const tabParam = searchParams.get("tab");
  const tab: LibraryTab = TABS.find((t) => t.id === tabParam)?.id ?? initialTab;

  function selectTab(id: LibraryTab) {
    const qs = id === "songs" ? "" : `?tab=${id}`;
    router.push(`${pathname}${qs}`);
  }

  return (
    <div>
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Thư viện</h1>
      <div role="tablist" aria-label="Thư viện" className="mt-space-md inline-flex gap-1 rounded-full bg-surface-container-low p-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => selectTab(t.id)}
            className={`min-h-11 rounded-full px-5 text-label-md transition-colors ${tab === t.id ? "bg-surface-container-high font-medium text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-space-lg">
        {tab === "songs" ? <SongsTab /> : tab === "discover" ? <DiscoverTab /> : <SavedWordsTab />}
      </div>
    </div>
  );
}
