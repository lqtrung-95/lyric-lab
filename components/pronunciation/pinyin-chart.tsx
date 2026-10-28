"use client";

import { useState } from "react";
import { COMMON_MISTAKES, FINAL_GROUPS, INITIAL_GROUPS } from "@/lib/pronunciation/pinyin-chart-data";
import { CompareGroups } from "./compare-groups";
import { SoundGroupCard } from "./sound-group-card";

type TabId = "initials" | "finals" | "mistakes";
const TABS: { id: TabId; label: string }[] = [
  { id: "initials", label: "Phụ âm đầu" },
  { id: "finals", label: "Vần" },
  { id: "mistakes", label: "Lỗi hay gặp" },
];

/** Bảng âm tiết pinyin cho người Việt: bấm ví dụ để nghe giọng chuẩn, mỗi âm có mẹo so với tiếng Việt và (với phụ âm, nguyên âm đơn, vần mũi) hình vị trí lưỡi. */
export function PinyinChart() {
  const [tab, setTab] = useState<TabId>("initials");
  return (
    <div className="space-y-space-md">
      <div role="tablist" aria-label="Nhóm âm" className="flex gap-1 rounded-full bg-surface-container p-1">
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="pinyin-panel" onClick={() => setTab(t.id)}
            className={`min-h-11 flex-1 rounded-full px-3 text-label-md font-medium ${tab === t.id ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div id="pinyin-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-space-md">
        {tab === "initials" && <CompareGroups />}
        {tab === "initials" && INITIAL_GROUPS.map((g) => <SoundGroupCard key={g.id} group={g} />)}
        {tab === "finals" && FINAL_GROUPS.map((g) => <SoundGroupCard key={g.id} group={g} />)}
        {tab === "mistakes" && (
          <ul className="space-y-space-sm">
            {COMMON_MISTAKES.map((m) => (
              <li key={m.title} className="rounded-xl border border-outline-variant bg-surface-container-low p-space-md">
                <h3 className="text-body-lg font-medium">{m.title}</h3>
                <p className="mt-1 text-body-md text-on-surface-variant">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
