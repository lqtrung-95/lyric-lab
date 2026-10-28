"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseRoomCode } from "@/components/practice/truth-or-lie-lobby";
import { Button3d } from "@/components/ui/button-3d";
import { newCoopCode } from "@/lib/explore/coop/coop-state";

/** Cổng vào Đấu 1–1: tạo phòng mới (rồi gửi liên kết thách bạn) hoặc vào phòng bằng liên kết/mã bạn bè gửi. */
export function DuelLobby() {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [error, setError] = useState(false);
  function join() {
    const code = parseRoomCode(link);
    if (!code) { setError(true); return; }
    router.push(`/review/duel/room/${code}`);
  }
  return (
    <div className="card-ink flex flex-col gap-space-sm bg-secondary-container p-space-md text-on-secondary-container">
      <Button3d variant="secondary" onClick={() => router.push(`/review/duel/play/${newCoopCode()}/a`)}>Tạo phòng và lấy liên kết thách bạn</Button3d>
      <label className="flex flex-col gap-1 text-label-md font-bold">Hoặc dán liên kết (hay mã 6 ký tự) bạn bè gửi
        <input value={link} onChange={(e) => { setLink(e.target.value); setError(false); }} placeholder="https://…/review/duel/room/ABC234" className="min-h-11 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-md font-normal text-on-surface" />
      </label>
      {error && <p role="alert" className="text-label-md font-bold text-error">Liên kết hoặc mã chưa đúng.</p>}
      <Button3d variant="primary" onClick={join} disabled={!link.trim()}>Vào phòng</Button3d>
    </div>
  );
}
