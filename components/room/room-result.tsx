"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { roomErrorMessage } from "@/lib/rooms/room-messages";
import { createRoomRequest } from "./room-requests";
import { RoomRoundsList } from "./room-rounds-list";
import { RoomScoreboard } from "./room-scoreboard";
import type { RoomView } from "@/lib/rooms/room-types";
import type { useRoom } from "./use-room";

const BANNER = {
  me: { title: "Bạn thắng!", tone: "bg-secondary-container text-on-secondary-container" },
  opponent: { title: "Đối thủ thắng ván này", tone: "bg-surface-container-high text-on-surface" },
  draw: { title: "Hòa nhau!", tone: "bg-primary-container text-on-primary-container" },
} as const;

/** Phần kết quả của một ván đã kết thúc (dùng cho màn kết quả và xem lại lịch sử): người thắng, bảng điểm cuối, từng câu. */
export function RoomResultSummary({ view }: { view: RoomView }) {
  const banner = BANNER[view.winner ?? "draw"];
  return (
    <>
      <section aria-labelledby="result-heading" className={`rounded-3xl p-space-lg text-center ${banner.tone}`}>
        <Icon name="emoji_events" filled size={40} />
        <h1 id="result-heading" className="mt-1 font-serif text-headline-lg-mobile md:text-headline-lg">{banner.title}</h1>
        {view.forfeit && <p className="mt-1 text-body-md">Ván kết thúc vì có người rời ván.</p>}
      </section>

      <RoomScoreboard players={view.players} />

      {view.rounds && view.rounds.length > 0 && <RoomRoundsList rounds={view.rounds} />}
    </>
  );
}

/** Kết quả ván: người thắng, bảng điểm cuối, từng câu (đúng/sai, điểm, tốc độ của cả hai), Chơi lại cùng bài hoặc về sảnh. */
export function RoomResult({ room }: { room: ReturnType<typeof useRoom> }) {
  const router = useRouter();
  const view = room.view!;
  const me = view.players.find((p) => p.isMe);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function again() {
    if (!me) return;
    setBusy(true);
    setError(null);
    const result = await createRoomRequest(view.song?.videoId ?? null, view.showTranslation);
    if (result.ok) return router.push(`/room/${result.data.code}`);
    setError(roomErrorMessage(result.error));
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <RoomResultSummary view={view} />

      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      <div className="flex flex-col gap-space-sm sm:flex-row sm:justify-center">
        <button type="button" onClick={again} disabled={busy} className="min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
          {busy ? "Đang tạo phòng…" : "Chơi lại cùng bài"}
        </button>
        <button type="button" onClick={() => router.push("/room")} className="min-h-12 rounded-full bg-surface-container-high px-8 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest">
          Về sảnh Thi đấu
        </button>
      </div>
    </div>
  );
}
