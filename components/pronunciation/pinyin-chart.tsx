"use client";

import { useState } from "react";
import { COMMON_MISTAKES, FINAL_GROUPS, INITIAL_GROUPS, type SoundGroup } from "@/lib/pronunciation/pinyin-chart-data";
import { playChinese } from "@/lib/speech/play-chinese";
import { Icon } from "@/components/ui/icon";
import { COMPARE_GROUPS, GROUP_ARTICULATION, SOUND_ARTICULATION } from "@/lib/pronunciation/articulation-data";
import { ArticulationPanel } from "./articulation-panel";
import { TongueDiagram } from "./tongue-diagram";

type TabId = "initials" | "finals" | "mistakes";
const TABS: { id: TabId; label: string }[] = [
  { id: "initials", label: "Phụ âm đầu" },
  { id: "finals", label: "Vần" },
  { id: "mistakes", label: "Lỗi hay gặp" },
];

function GroupSection({ group }: { group: SoundGroup }) {
  return (
    <section aria-labelledby={`g-${group.id}`} className="space-y-space-sm">
      <div>
        <h3 id={`g-${group.id}`} className="font-serif text-headline-md">{group.title}</h3>
        {group.note && <p className="text-body-md text-on-surface-variant">{group.note}</p>}
      </div>
      {GROUP_ARTICULATION[group.id] && <ArticulationPanel articulation={GROUP_ARTICULATION[group.id]} label={group.sounds.map((x) => x.symbol).join(", ")} />}
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {group.sounds.map((s) => (
          <li key={s.symbol} className="rounded-xl border border-outline-variant bg-surface-container-low p-space-md">
            <div className="flex items-start justify-between gap-2">
              <span className="font-serif text-headline-md text-primary">{s.symbol}</span>
              <span className="flex flex-wrap justify-end gap-1">
                {s.examples.map((e) => (
                  <button key={e.han} type="button" onClick={() => void playChinese(e.han)} aria-label={`Nghe ${e.pinyin} (${e.han})`}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-outline-variant px-3 text-label-md hover:bg-surface-container">
                    <Icon name="volume_up" size={18} />
                    <span>{e.pinyin}</span>
                    <span lang="zh-Hans" className="text-on-surface-variant">{e.han}</span>
                  </button>
                ))}
              </span>
            </div>
            <p className="mt-2 text-body-md text-on-surface-variant">{s.tip}</p>
            {SOUND_ARTICULATION[s.symbol] && <div className="mt-2"><ArticulationPanel articulation={SOUND_ARTICULATION[s.symbol]} label={s.symbol} /></div>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Ba nhóm phụ âm hay bị lẫn đặt cạnh nhau: chỉ khác ở chỗ đặt lưỡi. */
function CompareGroups() {
  return (
    <section aria-labelledby="compare-h" className="space-y-space-sm">
      <div>
        <h3 id="compare-h" className="font-serif text-headline-md">So sánh ba nhóm hay bị lẫn</h3>
        <p className="text-body-md text-on-surface-variant">j q x, zh ch sh r và z c s nghe gần nhau với người Việt. Điểm khác chính là chỗ đặt đầu lưỡi (chấm đỏ là chỗ lưỡi chạm hoặc gần nhất).</p>
      </div>
      <ul className="grid gap-space-sm sm:grid-cols-3">
        {COMPARE_GROUPS.map((c) => (
          <li key={c.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-space-sm">
            <TongueDiagram kind={c.diagram} alt={`Hình cắt dọc miệng khi phát âm ${c.label}: ${c.point}`} className="w-full" />
            <p className="mt-1 font-serif text-headline-md text-primary">{c.label}</p>
            <p className="text-body-md text-on-surface-variant">{c.point}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Bảng âm tiết pinyin cho người Việt: bấm ví dụ để nghe giọng chuẩn, mỗi âm có mẹo so với tiếng Việt. */
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
      <div id="pinyin-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-space-lg">
        {tab === "initials" && <CompareGroups />}
        {tab === "initials" && INITIAL_GROUPS.map((g) => <GroupSection key={g.id} group={g} />)}
        {tab === "finals" && FINAL_GROUPS.map((g) => <GroupSection key={g.id} group={g} />)}
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
