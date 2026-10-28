"use client";

import { useState } from "react";
import { PanelFrame } from "./panel-frame";
import { Button3d } from "@/components/ui/button-3d";
import type { LinkResult } from "@/lib/explore/story/deduction";
import type { StoryDef, StoryProgress } from "@/lib/explore/story/story-types";
import type { VoiceClip } from "@/lib/speech/voice-clip";
import { ArtSprite } from "../art/art-sprite";
import { FLAT_SPRITES } from "../art/flat/flat-sprites";
import { ClueBody } from "./clue-card";
import { VoiceReportButton } from "./voice-report-button";
import { HintToggles } from "./hint-toggles";
import type { Hints } from "./use-story-hints";

interface Props {
  story: Omit<StoryDef, "scenes">;
  progress: StoryProgress;
  pinyin: Record<string, string>;
  hints: Hints;
  onToggleHint: (k: keyof Hints) => void;
  canAccuse: boolean;
  solved: boolean;
  onAccuse: () => void;
  onLink: (a: string, b: string) => LinkResult;
  onClose: () => void;
  /** Chơi chung: manh mối là riêng của người tìm ra, nút "Báo cho đồng đội" gửi nó (bằng tiếng Trung) sang sổ của người kia. */
  coop?: { reported: string[]; partnerOnline: boolean; onReport: (clueId: string, clip?: VoiceClip) => void };
}

/** Sổ vụ án: các manh mối đã tìm (đọc lại, nghe lại), các nghi phạm và lời khai của họ, nút buộc tội khi đủ điều kiện. */
export function CaseFilePanel({ story, progress, pinyin, hints, onToggleHint, canAccuse, solved, onAccuse, onLink, onClose, coop }: Props) {
  const found = story.clues.filter((c) => progress.clues.includes(c.id));
  const hasDeductions = story.clues.some((c) => c.kind === "deduction");
  return (
    <PanelFrame label="Sổ vụ án" title="Sổ vụ án" extra={<div className="max-sm:[&_button]:!min-h-9 max-sm:[&_button]:!px-2.5 max-sm:[&_button]:!text-[13px]"><HintToggles hints={hints} onToggle={onToggleHint} /></div>} onClose={onClose}>
      <p className="text-body-md text-on-surface-variant">{story.title}</p>

      <h3 className="mt-space-sm text-label-md font-extrabold">Nghi phạm</h3>
      <ul className="mt-1 grid gap-2 sm:grid-cols-2">
        {story.suspects.filter((s) => !s.virtual).map((s) => {
          const met = progress.flags.includes(s.metFlag);
          const sprite = FLAT_SPRITES[s.sprite];
          return (
            <li key={s.id} className="flex items-start gap-2 rounded-xl bg-surface-container-low p-2">
              {sprite && <div className="w-10 shrink-0"><ArtSprite sprite={sprite} /></div>}
              <div className="min-w-0"><p className="text-label-md font-extrabold">{s.name}</p><p className="text-body-sm text-on-surface-variant">{met ? s.note : "Chưa gặp. Hãy đến hỏi."}</p></div>
            </li>
          );
        })}
      </ul>

      {story.questions && story.questions.length > 0 && (
        <>
          <h3 className="mt-space-sm text-label-md font-extrabold">Câu hỏi cần làm rõ</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-body-md">{story.questions.map((q) => <li key={q}>{q}</li>)}</ul>
        </>
      )}

      <h3 className="mt-space-sm text-label-md font-extrabold">Manh mối ({found.filter((c) => c.kind !== "deduction").length})</h3>
      {found.length === 0 ? <p className="text-body-md text-on-surface-variant">Chưa có manh mối nào. Hãy xem xét căn phòng và hỏi mọi người.</p> : (
        <ul className="mt-1 space-y-2">{found.map((c) => (
          <li key={c.id} className="rounded-xl bg-surface-container-low p-space-sm">
            <ClueBody clue={c} pinyin={pinyin} hints={hints} />
            {coop && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" disabled={!coop.partnerOnline} onClick={() => coop.onReport(c.id)} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-extrabold disabled:opacity-40">
                  {coop.reported.includes(c.id) ? "Đã báo ✓ (báo lại)" : coop.partnerOnline ? "Báo cho đồng đội" : "Báo cho đồng đội (chờ họ online)"}
                </button>
                <VoiceReportButton clueId={c.id} disabled={!coop.partnerOnline} onSend={(clip) => coop.onReport(c.id, clip)} />
              </div>
            )}
          </li>
        ))}</ul>
      )}

      {hasDeductions && <LinkClues found={found} onLink={onLink} />}

      <div className="mt-space-sm flex flex-wrap items-center gap-3">
        {!solved && <Button3d variant="secondary" disabled={!canAccuse} onClick={onAccuse}>{coop ? "Đề nghị buộc tội" : "Buộc tội"}</Button3d>}
        {!solved && !canAccuse && <p className="text-label-md text-on-surface-variant">Cần hỏi hết mọi người và nghe nhân chứng trước.</p>}
        {solved && <p role="status" className="text-label-md font-extrabold text-secondary">Vụ án đã được giải!</p>}
      </div>
    </PanelFrame>
  );
}

/** Nối hai manh mối đã tìm: cặp đúng cho ra một suy luận mới, cặp sai thì không có gì xảy ra. */
function LinkClues({ found, onLink }: { found: StoryDef["clues"]; onLink: (a: string, b: string) => LinkResult }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const submit = () => {
    const r = onLink(a, b);
    setMsg(r.status === "linked" ? `Suy luận mới: ${r.clue.vi}` : r.status === "known" ? "Hai manh mối này bạn đã nối rồi." : r.near ? "Chưa đủ: một trong hai manh mối này có ích, hãy thử ghép nó với một manh mối khác." : "Hai manh mối này chưa dẫn tới điều gì. Thử cặp khác.");
  };
  const select = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-label-md font-extrabold">{label}
      <select value={value} onChange={(e) => { set(e.target.value); setMsg(null); }} className="min-h-11 w-full rounded-xl border-2 border-ink bg-surface-container-lowest px-2 text-body-md font-normal">
        <option value="">Chọn manh mối…</option>
        {found.map((c) => <option key={c.id} value={c.id}>{c.kind === "deduction" ? `Suy luận: ${c.title}` : c.title}</option>)}
      </select>
    </label>
  );
  return (
    <section aria-label="Nối manh mối" className="mt-space-sm rounded-xl border-2 border-ink p-space-sm">
      <h3 className="text-label-md font-extrabold">Nối manh mối</h3>
      <p className="text-body-sm text-on-surface-variant">Chọn hai manh mối có liên quan để rút ra suy luận (suy luận cũng nối tiếp được với manh mối khác). Các suy luận là bằng chứng mạnh nhất khi buộc tội.</p>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row">{select("Manh mối thứ nhất", a, setA)}{select("Manh mối thứ hai", b, setB)}</div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button3d variant="secondary" disabled={!a || !b || a === b} onClick={submit}>Nối lại</Button3d>
        {msg && <p role="status" className="text-label-md font-bold">{msg}</p>}
      </div>
    </section>
  );
}
