"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { DIALOGUE_TOPICS, LEVEL_BANDS, type DialogueSummary, type DialogueTopic, type LevelBand } from "@/lib/dialogues/dialogue-types";

const chip = (on: boolean) => `min-h-11 rounded-full border-2 border-ink px-space-sm text-label-lg font-extrabold ${on ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`;

/** Danh sách hội thoại: tìm theo chủ đề, từ hoặc chữ Hán; lọc theo cấp HSK và chủ đề. */
export function DialogueBrowser({ dialogues }: { dialogues: DialogueSummary[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelBand | null>(null);
  const [topic, setTopic] = useState<DialogueTopic | null>(null);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dialogues.filter((d) => (!q || d.haystack.includes(q)) && (level === null || d.level === level) && (topic === null || d.topic === topic));
  }, [dialogues, query, level, topic]);
  const emoji = (t: DialogueTopic) => DIALOGUE_TOPICS.find((x) => x.id === t)?.emoji ?? "💬";

  return (
    <div className="flex flex-col gap-space-md">
      <label className="card-ink flex items-center gap-2 bg-surface-container-lowest px-space-sm">
        <Icon name="search" size={22} />
        <span className="sr-only">Tìm hội thoại</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo chủ đề, từ hoặc chữ Hán" className="min-h-12 w-full bg-transparent text-body-lg outline-none" />
      </label>
      <div role="group" aria-label="Lọc theo cấp HSK" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={level === null} onClick={() => setLevel(null)} className={chip(level === null)}>Mọi cấp</button>
        {LEVEL_BANDS.map((b) => <button key={b.id} type="button" aria-pressed={level === b.id} onClick={() => setLevel(b.id)} className={chip(level === b.id)}>{b.label}</button>)}
      </div>
      <div role="group" aria-label="Lọc theo chủ đề" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={topic === null} onClick={() => setTopic(null)} className={chip(topic === null)}>Mọi chủ đề</button>
        {DIALOGUE_TOPICS.map((t) => <button key={t.id} type="button" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)} className={chip(topic === t.id)}>{t.emoji} {t.label}</button>)}
      </div>
      <p role="status" className="text-label-lg text-on-surface-variant">{shown.length} hội thoại</p>
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {shown.map((d) => (
          <li key={d.id}>
            <Link href={`/dialogues/${d.id}`} className="card-ink flex h-full items-start gap-space-sm bg-surface-container-lowest p-space-sm transition-transform hover:-translate-y-0.5">
              <span aria-hidden className="text-3xl">{emoji(d.topic)}</span>
              <span className="min-w-0">
                <span className="block text-body-lg font-extrabold">{d.title.vi}</span>
                {d.title.zh && <span lang="zh-Hans" className="block text-body-md font-bold text-on-surface-variant">{d.title.zh}</span>}
                <span className="mt-1 block text-label-md text-on-surface-variant">{d.level ? `HSK ${d.level === 4 ? "4+" : d.level} · ` : ""}{d.lineCount} câu · {d.speakers.join(" và ")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="text-body-md text-on-surface-variant">Không có hội thoại nào khớp. Thử bỏ bớt bộ lọc.</p>}
    </div>
  );
}
