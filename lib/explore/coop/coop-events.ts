import { parseClip, type VoiceClip } from "@/lib/speech/voice-clip";

/**
 * Kiểm tra dạng của các tin đặc biệt gửi qua kênh chơi chung (báo manh mối, đề nghị buộc tội, trả lời, kết quả). Tin lạ hoặc có id không thuộc vụ án bị bỏ,
 * nên người ngoài (hoặc bản cũ) gửi gì lên kênh cũng không làm hỏng trạng thái của người chơi.
 */
export interface CaseIds { clues: readonly string[]; suspects: readonly string[] }
const MAX_EVIDENCE = 8;

const isRole = (v: unknown): v is "a" | "b" => v === "a" || v === "b";
const strings = (v: unknown, allowed: readonly string[], max: number): string[] | null =>
  Array.isArray(v) && v.length > 0 && v.length <= max && v.every((x) => typeof x === "string" && allowed.includes(x)) ? [...new Set(v as string[])] : null;

/** `clip`: người báo có thể đọc to manh mối bằng giọng của mình kèm theo (đoạn thoại ngắn, xem `voice-clip.ts`); đoạn hỏng thì bỏ riêng đoạn đó, tin báo vẫn nhận. */
export interface ReportEvent { from: "a" | "b"; clueId: string; clip?: VoiceClip }
export function parseReport(p: unknown, ids: CaseIds): ReportEvent | null {
  const d = p as { from?: unknown; clueId?: unknown; clip?: unknown } | null;
  if (!d || !isRole(d.from) || typeof d.clueId !== "string" || !ids.clues.includes(d.clueId)) return null;
  const clip = d.clip === undefined ? null : parseClip(d.clip);
  return { from: d.from, clueId: d.clueId, ...(clip ? { clip } : {}) };
}

export interface ProposalEvent { from: "a" | "b"; suspectIds: string[]; clueIds: string[] }
export function parseProposal(p: unknown, ids: CaseIds): ProposalEvent | null {
  const d = p as { from?: unknown; suspectIds?: unknown; clueIds?: unknown } | null;
  if (!d || !isRole(d.from)) return null;
  const suspectIds = strings(d.suspectIds, ids.suspects, 2);
  const clueIds = strings(d.clueIds, ids.clues, MAX_EVIDENCE);
  return suspectIds && clueIds ? { from: d.from, suspectIds, clueIds } : null;
}

export interface ReplyEvent { from: "a" | "b"; ok: boolean }
export function parseReply(p: unknown): ReplyEvent | null {
  const d = p as { from?: unknown; ok?: unknown } | null;
  return d && isRole(d.from) && typeof d.ok === "boolean" ? { from: d.from, ok: d.ok } : null;
}

export type VerdictKind = "solved" | "wrong_suspect" | "weak_evidence";
export interface VerdictEvent { from: "a" | "b"; kind: VerdictKind }
export function parseVerdict(p: unknown): VerdictEvent | null {
  const d = p as { from?: unknown; kind?: unknown } | null;
  return d && isRole(d.from) && (d.kind === "solved" || d.kind === "wrong_suspect" || d.kind === "weak_evidence") ? { from: d.from, kind: d.kind } : null;
}

/** Cờ được chia sẻ cho đồng đội: bỏ cờ `clue:<id>` vì manh mối là riêng của người tìm ra (chỉ vào sổ người kia khi được báo và ghi vào). */
export const sharedFlags = (flags: readonly string[]): string[] => flags.filter((f) => !f.startsWith("clue:"));
