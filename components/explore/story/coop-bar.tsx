"use client";

import { useEffect, useState } from "react";
import { parseMessage } from "@/lib/explore/coop/coop-messages";
import { COOP_PHRASES, ROLE_LABEL, otherRole, sceneOwner } from "@/lib/explore/coop/coop-state";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { CoopComposer } from "./coop-composer";
import { CoopInbox } from "./coop-inbox";
import type { useStoryController } from "./use-story-controller";
import { useStoryHints } from "./use-story-hints";

type Coop = NonNullable<ReturnType<typeof useStoryController>["coop"]>;

const viOf = (zh: string): string | undefined => COOP_PHRASES.find((p) => p.zh === zh)?.vi ?? parseMessage(zh)?.vi;

/**
 * Thanh chơi chung phía trên cảnh: ai đang online, cảnh này do ai phụ trách, hộp thư (manh mối đồng đội báo, đề nghị buộc tội), tin nhắn và bộ soạn câu tiếng Trung.
 * Manh mối bạn tìm được là riêng của bạn: phải báo cho đồng đội trong Sổ vụ án thì họ mới có.
 */
export function CoopBar({ coop, payload, sceneId, hasClue, onOpenCase }: { coop: Coop; payload: StoryPayload; sceneId: string; hasClue: (id: string) => boolean; onOpenCase: () => void }) {
  const [copied, setCopied] = useState(false);
  const { hints } = useStoryHints();
  const owner = sceneOwner(coop.route, sceneId);
  const mine = owner === coop.role;

  useEffect(() => {
    if (!coop.blocked) return;
    const t = setTimeout(coop.clearBlocked, 5000);
    return () => clearTimeout(t);
  }, [coop.blocked, coop.clearBlocked]);

  async function copyLink() {
    const url = `${window.location.origin}/explore/coop/${coop.code}/${payload.story.id}/${payload.story.startScene}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* trình duyệt chặn: người dùng tự chép từ thanh địa chỉ */ }
  }

  return (
    <section aria-label="Chơi chung" className="card-ink flex flex-col gap-2 p-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-label-md font-extrabold">{ROLE_LABEL[coop.role]} · phòng <span className="tracking-widest">{coop.code}</span></p>
        <p role="status" className="flex items-center gap-1.5 text-label-md font-bold">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${coop.partnerOnline ? "bg-secondary" : "bg-outline"}`} />
          {coop.partnerOnline ? `${ROLE_LABEL[otherRole(coop.role)]} đang online` : coop.connected ? "Đang chờ đồng đội…" : "Đang kết nối…"}
        </p>
      </div>
      <p className="text-label-md text-on-surface-variant">
        {mine ? "Cảnh này do BẠN phụ trách: hỏi nhân vật và tìm manh mối ở đây." : `Cảnh này do ${ROLE_LABEL[owner]} phụ trách, bạn chưa hỏi được ai ở đây.`}
        {" "}Manh mối bạn tìm được là RIÊNG của bạn: mở{" "}<button type="button" onClick={onOpenCase} className="font-extrabold underline">Sổ vụ án</button>{" "}và bấm “Báo cho đồng đội”, họ đọc bằng tiếng Trung rồi mới ghi vào sổ của họ. Buộc tội cần cả hai đồng ý.
      </p>
      {!coop.partnerOnline && (
        <button type="button" onClick={copyLink} className="min-h-11 self-start rounded-full border-2 border-ink bg-primary-container px-4 text-label-md font-extrabold text-on-primary-container">{copied ? "Đã chép liên kết ✓" : "Chép liên kết mời bạn"}</button>
      )}
      <CoopInbox items={coop.inbox} payload={payload} hints={hints} hasClue={hasClue} onAccept={coop.acceptReport} onDismiss={coop.dismiss} onAnswer={coop.answerProposal} />
      {coop.pending && <p role="status" className="rounded-lg bg-secondary-container px-2 py-1 text-label-md font-extrabold text-on-secondary-container">Đã gửi đề nghị buộc tội, đang chờ đồng đội trả lời… <button type="button" onClick={coop.cancelPending} className="underline">Hủy</button></p>}
      {coop.blocked && <p role="alert" className="rounded-lg bg-error-container px-2 py-1 text-label-md font-bold text-on-error-container">{coop.blocked}</p>}
      {coop.said.length > 0 && (
        <ul aria-label="Tin nhắn" className="flex flex-col gap-0.5">
          {coop.said.slice(-3).map((m) => (
            <li key={m.at} className={`text-body-sm ${m.from === coop.role ? "text-right text-on-surface-variant" : "font-bold"}`}>
              <span className="text-label-md">{m.from === coop.role ? "Bạn" : ROLE_LABEL[m.from]}: </span><span lang="zh-Hans">{m.zh}</span>
              {hints.vi && <span className="ml-1 text-label-md font-normal text-on-surface-variant">({viOf(m.zh)})</span>}
            </li>
          ))}
        </ul>
      )}
      <CoopComposer places={coop.route} hints={hints} onSay={coop.say} />
    </section>
  );
}
