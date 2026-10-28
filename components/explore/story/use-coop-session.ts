"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Verdict } from "@/lib/explore/story/deduction";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import type { StoryProgress } from "@/lib/explore/story/story-types";
import { applyEffects } from "@/lib/explore/story/story-state";
import { mergeShared, unseenShared, type CoopRole } from "@/lib/explore/coop/coop-state";
import { playSfx } from "@/lib/feedback/sfx";
import type { VoiceClip } from "@/lib/speech/voice-clip";
import { useCoopChannel } from "./use-coop-channel";

/** Mục trong hộp thư của đồng đội: manh mối được báo, đề nghị buộc tội cần trả lời, hoặc thông báo ngắn. */
export type InboxItem =
  | { id: number; kind: "report"; from: CoopRole; clueId: string; clip?: VoiceClip }
  | { id: number; kind: "proposal"; from: CoopRole; suspectIds: string[]; clueIds: string[] }
  | { id: number; kind: "note"; text: string };
type NewItem = InboxItem extends infer T ? (T extends { id: number } ? Omit<T, "id"> : never) : never;

interface Pending { suspectIds: string[]; clueIds: string[] }

interface Args {
  enabled: boolean;
  code: string;
  role: CoopRole;
  payload: StoryPayload;
  progress: StoryProgress;
  update: (fn: (p: StoryProgress) => StoryProgress) => void;
  /** Chấm lời buộc tội ở máy này (đặt cờ, mở đoạn kết...) và trả kết quả. */
  runAccuse: (suspectIds: string[], clueIds: string[]) => Verdict;
  /** Đồng đội phá án xong: mừng cùng. */
  onPartnerSolved: () => void;
}

const VERDICT_TEXT = {
  solved: "Đồng đội đã kết luận đúng, vụ án được giải!",
  wrong_suspect: "Kết luận chung của hai người chưa đúng. Hãy đọc lại lời khai và bàn lại.",
  weak_evidence: "Đúng người rồi, nhưng bằng chứng chưa đủ thuyết phục. Hãy tìm và báo thêm manh mối.",
} as const;

/**
 * Phiên chơi chung của một người: manh mối là RIÊNG của người tìm ra (chỉ sang sổ người kia khi họ báo bằng tiếng Trung và người kia bấm ghi vào),
 * và buộc tội cần cả hai đồng ý (người này đề nghị, người kia đọc bằng chứng rồi đồng ý hoặc không; đồng ý thì máy người đề nghị chấm).
 * Cờ tiến độ (đã gặp ai, đã mở gì) vẫn ghép tự động nhưng bỏ cờ `clue:`.
 */
export function useCoopSession({ enabled, code, role, payload, progress, update, runAccuse, onPartnerSolved }: Args) {
  const { story } = payload;
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [reported, setReported] = useState<string[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const progressRef = useRef(progress);
  const nextId = useRef(1);
  const verdictSender = useRef<(k: Verdict["type"]) => void>(() => undefined);
  const accuseRef = useRef(runAccuse);
  useEffect(() => { progressRef.current = progress; pendingRef.current = pending; accuseRef.current = runAccuse; });

  const push = useCallback((item: NewItem) => setInbox((cur) => [...cur.filter((i) => !(item.kind === "proposal" && i.kind === "proposal")).slice(-5), { ...item, id: nextId.current++ } as InboxItem]), []);

  const channel = useCoopChannel({
    code, caseId: story.id, role, enabled,
    state: { flags: progress.flags },
    ids: { clues: story.clues.map((c) => c.id), suspects: story.suspects.map((s) => s.id) },
    handlers: {
      onPartnerState: (incoming) => {
        const add = unseenShared(progressRef.current, { flags: incoming.flags, clues: [] });
        if (!add.flags.length) return;
        if (add.flags.includes(story.solvedFlag)) onPartnerSolved();
        update((p) => mergeShared(p, { flags: incoming.flags, clues: [] }));
      },
      onReport: (e) => push({ kind: "report", from: e.from, clueId: e.clueId, ...(e.clip ? { clip: e.clip } : {}) }),
      onProposal: (e) => { push({ kind: "proposal", from: e.from, suspectIds: e.suspectIds, clueIds: e.clueIds }); playSfx("correct"); },
      onReply: (e) => {
        const mine = pendingRef.current;
        if (!mine) return;
        setPending(null);
        if (!e.ok) { push({ kind: "note", text: "Đồng đội chưa đồng ý. Hãy bàn lại bằng câu nói rồi đề nghị lại." }); return; }
        verdictSender.current(accuseRef.current(mine.suspectIds, mine.clueIds).type);
      },
      onVerdict: (e) => push({ kind: "note", text: VERDICT_TEXT[e.kind] }),
    },
  });
  useEffect(() => { verdictSender.current = channel.sendVerdict; }, [channel.sendVerdict]);

  const report = useCallback((clueId: string, clip?: VoiceClip) => { channel.sendReport(clueId, clip); setReported((cur) => (cur.includes(clueId) ? cur : [...cur, clueId])); }, [channel]);
  const remove = useCallback((id: number) => setInbox((cur) => cur.filter((i) => i.id !== id)), []);
  const acceptReport = useCallback((item: InboxItem) => {
    if (item.kind === "report") { update((p) => applyEffects(p, [{ clue: item.clueId }])); playSfx("correct"); }
    remove(item.id);
  }, [update, remove]);
  const answerProposal = useCallback((item: InboxItem, ok: boolean) => { channel.sendReply(ok); remove(item.id); }, [channel, remove]);
  /** Đề nghị buộc tội gửi cho đồng đội; cần họ đang online. */
  const propose = useCallback((suspectIds: string[], clueIds: string[]): "sent" | "offline" => {
    if (!channel.partnerOnline) return "offline";
    setPending({ suspectIds, clueIds });
    channel.sendProposal(suspectIds, clueIds);
    return "sent";
  }, [channel]);

  return {
    connected: channel.connected, partnerOnline: channel.partnerOnline, said: channel.said, say: channel.say,
    inbox, reported, pending, report, acceptReport, dismiss: remove, answerProposal, propose, cancelPending: () => setPending(null),
  };
}
