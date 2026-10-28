"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button3d } from "@/components/ui/button-3d";
import { COOP_CODE, newCoopCode } from "@/lib/explore/coop/coop-state";

/** Lấy mã phòng từ liên kết mời hoặc chính mã 6 ký tự; không đúng dạng thì null. */
export function parseRoomCode(text: string): string | null {
  const t = text.trim();
  const m = t.match(/\/(?:room|play)\/([A-Za-z0-9]{6})(?:\/|\?|$)/) ?? t.match(/^([A-Za-z0-9]{6})$/);
  const code = m?.[1].toUpperCase();
  return code && COOP_CODE.test(code) ? code : null;
}

/** Cổng vào chế độ chơi cùng bạn của Hai thật một giả: tạo phòng mới (rồi gửi liên kết mời) hoặc vào phòng bằng liên kết/mã bạn bè gửi. */
export function TruthOrLieLobby() {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [error, setError] = useState(false);
  function join() {
    const code = parseRoomCode(link);
    if (!code) { setError(true); return; }
    router.push(`/review/truth-or-lie/room/${code}`);
  }
  return (
    <details className="card-ink bg-secondary-container p-space-sm text-on-secondary-container">
      <summary className="min-h-11 cursor-pointer text-label-lg font-extrabold leading-[2.75rem]">Chơi cùng bạn: ai tìm đúng nhiều hơn thắng</summary>
      <div className="mt-2 flex flex-col gap-space-sm">
        <Button3d variant="secondary" onClick={() => router.push(`/review/truth-or-lie/play/${newCoopCode()}/a`)}>Tạo phòng và lấy liên kết mời</Button3d>
        <label className="flex flex-col gap-1 text-label-md font-bold">Hoặc dán liên kết (hay mã 6 ký tự) bạn bè gửi
          <input value={link} onChange={(e) => { setLink(e.target.value); setError(false); }} placeholder="https://…/review/truth-or-lie/room/ABC234" className="min-h-11 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-md font-normal text-on-surface" />
        </label>
        {error && <p role="alert" className="text-label-md font-bold text-error">Liên kết hoặc mã chưa đúng.</p>}
        <Button3d variant="primary" onClick={join} disabled={!link.trim()}>Vào phòng</Button3d>
      </div>
    </details>
  );
}
