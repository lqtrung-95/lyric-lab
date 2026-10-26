"use client";

import { useEffect, useState } from "react";
import { COOP_PHRASES, ROLE_LABEL, otherRole, sceneOwner } from "@/lib/explore/coop/coop-state";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import type { useStoryController } from "./use-story-controller";

type Coop = NonNullable<ReturnType<typeof useStoryController>["coop"]>;

/**
 * Thanh chơi chung phía trên cảnh: ai đang online, cảnh này do ai phụ trách, câu nói nhanh bằng tiếng Trung, tin nhắn của hai người
 * và thông báo manh mối đồng đội vừa tìm được. Mọi chữ hiện ra đều từ danh sách có sẵn nên không cần kiểm duyệt.
 */
export function CoopBar({ coop, payload, sceneId, onOpenCase }: { coop: Coop; payload: StoryPayload; sceneId: string; onOpenCase: () => void }) {
  const [copied, setCopied] = useState(false);
  const owner = sceneOwner(coop.route, sceneId);
  const mine = owner === coop.role;
  const titleOf = (id: string) => payload.story.clues.find((c) => c.id === id)?.title ?? id;

  // Thông báo tự tắt sau vài giây.
  useEffect(() => {
    if (!coop.news.length) return;
    const t = setTimeout(coop.clearNews, 6000);
    return () => clearTimeout(t);
  }, [coop.news, coop.clearNews]);
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
        <p className="text-label-md font-extrabold">
          {ROLE_LABEL[coop.role]} · phòng <span className="tracking-widest">{coop.code}</span>
        </p>
        <p role="status" className="flex items-center gap-1.5 text-label-md font-bold">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${coop.partnerOnline ? "bg-secondary" : "bg-outline"}`} />
          {coop.partnerOnline ? `${ROLE_LABEL[otherRole(coop.role)]} đang online` : coop.connected ? "Đang chờ đồng đội…" : "Đang kết nối…"}
        </p>
      </div>
      <p className="text-label-md text-on-surface-variant">
        {mine ? "Cảnh này do BẠN phụ trách: hỏi nhân vật và tìm manh mối ở đây." : `Cảnh này do ${ROLE_LABEL[owner]} phụ trách. Bạn đi cảnh của mình, rồi nói chuyện để ghép manh mối.`}
        {" "}Manh mối ai tìm thấy đều tự vào sổ của cả hai.
      </p>
      {!coop.partnerOnline && (
        <button type="button" onClick={copyLink} className="min-h-11 self-start rounded-full border-2 border-ink bg-primary-container px-4 text-label-md font-extrabold text-on-primary-container">
          {copied ? "Đã chép liên kết ✓" : "Chép liên kết mời bạn"}
        </button>
      )}
      {coop.news.length > 0 && (
        <p role="status" className="rounded-lg bg-secondary-container px-2 py-1 text-label-md font-extrabold text-on-secondary-container">
          Đồng đội vừa ghi vào sổ: {coop.news.map(titleOf).join(", ")}{" "}
          <button type="button" onClick={onOpenCase} className="underline">Mở sổ</button>
        </p>
      )}
      {coop.blocked && <p role="alert" className="rounded-lg bg-error-container px-2 py-1 text-label-md font-bold text-on-error-container">{coop.blocked}</p>}
      {coop.said.length > 0 && (
        <ul aria-label="Tin nhắn" className="flex flex-col gap-0.5">
          {coop.said.slice(-3).map((m) => (
            <li key={m.at} className={`text-body-sm ${m.from === coop.role ? "text-right text-on-surface-variant" : "font-bold"}`}>
              <span className="text-label-md">{m.from === coop.role ? "Bạn" : ROLE_LABEL[m.from]}: </span><span lang="zh-Hans">{m.zh}</span>
              <span className="ml-1 text-label-md font-normal text-on-surface-variant">({COOP_PHRASES.find((p) => p.zh === m.zh)?.vi})</span>
            </li>
          ))}
        </ul>
      )}
      <div role="group" aria-label="Câu nói nhanh" className="flex flex-wrap gap-1.5">
        {COOP_PHRASES.map((p) => (
          <button key={p.zh} type="button" onClick={() => coop.say(p.zh)} title={p.vi} className="min-h-9 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-bold hover:bg-surface-container-low">
            <span lang="zh-Hans">{p.zh}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
