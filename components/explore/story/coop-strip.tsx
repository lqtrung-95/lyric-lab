"use client";

import { useEffect } from "react";
import { ROLE_LABEL, otherRole, sceneOwner } from "@/lib/explore/coop/coop-state";
import type { useStoryController } from "./use-story-controller";

type Coop = NonNullable<ReturnType<typeof useStoryController>["coop"]>;

/** Thanh nhỏ một dòng trên cảnh: vai, mã phòng, đồng đội có online không và cảnh này do ai phụ trách; kèm thông báo ngắn khi bị chặn hoặc đang chờ đồng đội trả lời. */
export function CoopStrip({ coop, sceneId, onOpenCase }: { coop: Coop; sceneId: string; onOpenCase: () => void }) {
  const owner = sceneOwner(coop.route, sceneId);
  useEffect(() => {
    if (!coop.blocked) return;
    const t = setTimeout(coop.clearBlocked, 5000);
    return () => clearTimeout(t);
  }, [coop.blocked, coop.clearBlocked]);
  return (
    <section aria-label="Chơi chung" className="card-ink flex flex-col gap-1.5 px-space-sm py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label-md">
        <span className="font-extrabold">{ROLE_LABEL[coop.role]} · phòng <span className="tracking-widest">{coop.code}</span></span>
        <span role="status" className="flex items-center gap-1.5 font-bold">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${coop.partnerOnline ? "bg-secondary" : "bg-outline"}`} />
          {coop.partnerOnline ? `${ROLE_LABEL[otherRole(coop.role)]} đang online` : coop.connected ? "Đang chờ đồng đội…" : "Đang kết nối…"}
        </span>
        <span className="text-on-surface-variant">{owner === coop.role ? "Cảnh này do BẠN phụ trách" : `Cảnh này do ${ROLE_LABEL[owner]} phụ trách`}</span>
        <button type="button" onClick={onOpenCase} className="ml-auto min-h-9 font-extrabold text-primary underline">Sổ vụ án</button>
      </div>
      {coop.pending && <p role="status" className="rounded-lg bg-secondary-container px-2 py-1 text-label-md font-extrabold text-on-secondary-container">Đã gửi đề nghị buộc tội, đang chờ đồng đội trả lời… <button type="button" onClick={coop.cancelPending} className="underline">Hủy</button></p>}
      {coop.blocked && <p role="alert" className="rounded-lg bg-error-container px-2 py-1 text-label-md font-bold text-on-error-container">{coop.blocked}</p>}
    </section>
  );
}
