"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { recordTwister } from "@/lib/pronunciation/learning-progress";
import { TONGUE_TWISTERS, type TongueTwister } from "@/lib/pronunciation/tongue-twisters";
import { renderTwisterCard, shareOrDownload } from "@/lib/pronunciation/twister-card";
import { ReadAloudPractice } from "./read-aloud-practice";
import { usePronunciationProgress } from "./use-pronunciation-progress";

const LEVEL_LABEL = { 1: "Dễ", 2: "Vừa", 3: "Khó" } as const;
const SHARE_MESSAGES = { shared: "Đã mở chia sẻ.", downloaded: "Đã tải ảnh về máy.", cancelled: "" } as const;

/** Thử thách 绕口令: chọn câu theo độ khó, đọc to để Azure chấm, giữ điểm cao nhất trên thiết bị và chia sẻ thẻ điểm. */
export function TwisterChallenge() {
  const [selected, setSelected] = useState<TongueTwister>(TONGUE_TWISTERS[0]);
  const [last, setLast] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const { progress, update } = usePronunciationProgress();
  const best = progress.twisters[selected.id];

  async function share() {
    if (last === null) return;
    setNote("");
    try {
      const blob = await renderTwisterCard({ han: selected.han, score: last, title: "Thử thách 绕口令" });
      setNote(SHARE_MESSAGES[await shareOrDownload(blob, "songhanzi-rao-khau-lenh.png", `Tôi đọc 绕口令 được ${last} điểm trên SongHanzi!`)]);
    } catch { setNote("Chưa tạo được ảnh, thử lại nhé."); }
  }

  return (
    <div className="space-y-space-md">
      <ul className="grid gap-2 sm:grid-cols-2" aria-label="Chọn câu 绕口令">
        {TONGUE_TWISTERS.map((t) => (
          <li key={t.id}>
            <button type="button" aria-pressed={selected.id === t.id} onClick={() => { setSelected(t); setLast(null); setNote(""); }}
              className={`min-h-11 w-full rounded-xl border p-space-sm text-left ${selected.id === t.id ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant text-on-surface hover:bg-surface-container"}`}>
              <span lang="zh-Hans" className="block font-serif text-body-lg">{t.han.slice(0, 10)}…</span>
              <span className={`block text-body-sm ${selected.id === t.id ? "" : "text-on-surface-variant"}`}>{LEVEL_LABEL[t.level]} · {t.focus}{progress.twisters[t.id] ? ` · tốt nhất ${progress.twisters[t.id]}` : ""}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-body-md text-on-surface-variant">{selected.meaning}</p>
      <ReadAloudPractice key={selected.id} sentences={[selected]} allowCustom={false} onScored={(r) => { setLast(r.overall); update((p) => recordTwister(p, selected.id, r.overall)); }} />
      {last !== null && (
        <div className="flex flex-wrap items-center gap-space-md">
          <p role="status" className="text-body-lg">Lần này <strong>{last}</strong>{best !== undefined && best > last ? ` · tốt nhất ${best}` : last >= (best ?? 0) ? " · kỷ lục mới!" : ""}</p>
          <button type="button" onClick={() => void share()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant px-5 text-label-md font-medium hover:bg-surface-container">
            <Icon name="ios_share" size={20} /> Chia sẻ điểm
          </button>
          {note && <span role="status" className="text-body-sm text-on-surface-variant">{note}</span>}
        </div>
      )}
    </div>
  );
}
