"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { parseMessage } from "@/lib/explore/coop/coop-messages";
import { COOP_PHRASES, ROLE_LABEL } from "@/lib/explore/coop/coop-state";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { CoopComposer } from "./coop-composer";
import { CoopInbox } from "./coop-inbox";
import type { useStoryController } from "./use-story-controller";
import { useStoryHints } from "./use-story-hints";

type Coop = NonNullable<ReturnType<typeof useStoryController>["coop"]>;

/** Nổi trên mọi vật trong khung cảnh (cảnh xếp lớp theo vị trí và dùng z-index lên tới hàng nghìn). */
const ABOVE_SCENE = { zIndex: 3000 } as const;

const viOf = (zh: string): string | undefined => COOP_PHRASES.find((p) => p.zh === zh)?.vi ?? parseMessage(zh)?.vi;

/**
 * Bong bóng chat ở góc dưới bên phải: bấm mở khung có hộp thư (manh mối được báo, đề nghị buộc tội), tin nhắn và bộ soạn câu tiếng Trung.
 * Số trên bong bóng là tin chưa đọc + việc cần xử lý; đề nghị buộc tội của đồng đội tự mở khung vì cần trả lời. Trên điện thoại nằm trên thanh điều hướng dưới.
 */
export function CoopChat({ coop, payload, hasClue, onOpenCase }: { coop: Coop; payload: StoryPayload; hasClue: (id: string) => boolean; onOpenCase: () => void }) {
  const { hints } = useStoryHints();
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const proposals = coop.inbox.filter((i) => i.kind === "proposal").length;
  const lastProposals = useRef(0);

  // Đề nghị buộc tội mới từ đồng đội: mở khung ngay vì cần trả lời.
  useEffect(() => {
    if (proposals > lastProposals.current) setOpen(true);
    lastProposals.current = proposals;
  }, [proposals]);

  const unread = coop.inbox.length + (open ? 0 : coop.said.filter((m) => m.from !== coop.role && m.at > seenAt).length);
  const toggle = () => { setOpen((o) => !o); setSeenAt(Date.now()); };

  async function copyLink() {
    const url = `${window.location.origin}/explore/coop/${coop.code}/${payload.story.id}/${payload.story.startScene}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* trình duyệt chặn: tự chép từ thanh địa chỉ */ }
  }

  return (
    <>
      {open && (
        <aside aria-label="Chat với đồng đội" style={ABOVE_SCENE} className="card-ink fixed bottom-40 right-3 flex max-h-[68vh] w-[min(94vw,26rem)] flex-col gap-2 overflow-y-auto bg-surface p-space-sm sm:bottom-24 sm:right-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-label-lg font-extrabold">Chat với {coop.partnerOnline ? ROLE_LABEL[coop.role === "a" ? "b" : "a"] : "đồng đội"}</h2>
            <button type="button" onClick={toggle} aria-label="Thu nhỏ chat" className="flex size-11 items-center justify-center rounded-full hover:bg-surface-container"><Icon name="close" size={20} /></button>
          </div>
          <details className="text-label-md text-on-surface-variant">
            <summary className="min-h-9 cursor-pointer font-extrabold">Cách chơi cùng bạn</summary>
            <p className="mt-1">Manh mối bạn tìm là RIÊNG của bạn: mở <button type="button" onClick={onOpenCase} className="font-extrabold underline">Sổ vụ án</button> và bấm &ldquo;Báo cho đồng đội&rdquo; (hoặc &ldquo;Báo + đọc to&rdquo;), họ đọc bằng tiếng Trung rồi mới ghi vào sổ của họ. Buộc tội cần cả hai đồng ý.</p>
          </details>
          {!coop.partnerOnline && <button type="button" onClick={copyLink} className="min-h-11 self-start rounded-full border-2 border-ink bg-primary-container px-4 text-label-md font-extrabold text-on-primary-container">{copied ? "Đã chép liên kết ✓" : "Chép liên kết mời bạn"}</button>}
          <CoopInbox items={coop.inbox} payload={payload} hints={hints} hasClue={hasClue} onAccept={coop.acceptReport} onDismiss={coop.dismiss} onAnswer={coop.answerProposal} />
          {coop.said.length > 0 && (
            <ul aria-label="Tin nhắn" aria-live="polite" className="flex flex-col gap-0.5">
              {coop.said.slice(-5).map((m) => (
                <li key={m.at} className={`text-body-sm ${m.from === coop.role ? "text-right text-on-surface-variant" : "font-bold"}`}>
                  <span className="text-label-md">{m.from === coop.role ? "Bạn" : ROLE_LABEL[m.from]}: </span><span lang="zh-Hans">{m.zh}</span>
                  {hints.vi && <span className="ml-1 text-label-md font-normal text-on-surface-variant">({viOf(m.zh)})</span>}
                </li>
              ))}
            </ul>
          )}
          <CoopComposer places={coop.route} hints={hints} onSay={coop.say} />
        </aside>
      )}
      <button type="button" onClick={toggle} aria-expanded={open} aria-label={`Chat với đồng đội${unread > 0 ? `, ${unread} việc mới` : ""}`} style={ABOVE_SCENE}
        className={`fixed bottom-24 right-3 flex size-14 items-center justify-center rounded-full border-2 border-ink bg-primary text-on-primary shadow-[0_4px_0_var(--shadow-ink)] sm:bottom-6 sm:right-6 ${unread > 0 && !open ? "animate-bounce" : ""}`}>
        <Icon name="forum" size={26} filled />
        <span aria-hidden="true" className={`absolute -left-0.5 -top-0.5 size-3.5 rounded-full border-2 border-ink ${coop.partnerOnline ? "bg-secondary" : "bg-outline"}`} />
        {unread > 0 && <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex min-w-6 items-center justify-center rounded-full border-2 border-ink bg-error px-1 text-label-md font-extrabold text-on-error">{unread}</span>}
      </button>
    </>
  );
}
