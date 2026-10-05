"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { roomErrorMessage } from "@/lib/rooms/room-messages";
import { createRoomRequest } from "./room-requests";
import { RoomScoreboard } from "./room-scoreboard";
import type { useRoom } from "./use-room";

const seconds = (ms: number) => (ms / 1000).toFixed(1).replace(".", ",");

const BANNER = {
  me: { title: "Bạn thắng!", tone: "bg-secondary-container text-on-secondary-container" },
  opponent: { title: "Đối thủ thắng ván này", tone: "bg-surface-container-high text-on-surface" },
  draw: { title: "Hòa nhau!", tone: "bg-primary-container text-on-primary-container" },
} as const;

/** Kết quả ván: người thắng, bảng điểm cuối, từng câu (đúng/sai, điểm, tốc độ của cả hai), Chơi lại cùng bài hoặc về sảnh. */
export function RoomResult({ room }: { room: ReturnType<typeof useRoom> }) {
  const router = useRouter();
  const view = room.view!;
  const me = view.players.find((p) => p.isMe);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const banner = BANNER[view.winner ?? "draw"];

  async function again() {
    if (!me) return;
    setBusy(true);
    setError(null);
    const result = await createRoomRequest(view.song?.videoId ?? null);
    if (result.ok) return router.push(`/room/${result.data.code}`);
    setError(roomErrorMessage(result.error));
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <section aria-labelledby="result-heading" className={`rounded-3xl p-space-lg text-center ${banner.tone}`}>
        <Icon name="emoji_events" filled size={40} />
        <h1 id="result-heading" className="mt-1 font-serif text-headline-lg-mobile md:text-headline-lg">{banner.title}</h1>
        {view.forfeit && <p className="mt-1 text-body-md">Ván kết thúc vì có người rời ván.</p>}
      </section>

      <RoomScoreboard players={view.players} />

      {view.rounds && view.rounds.length > 0 && (
        <section aria-labelledby="rounds-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
          <h2 id="rounds-heading" className="font-serif text-headline-md text-on-surface">Từng câu</h2>
          <ol className="mt-space-sm divide-y divide-outline-variant">
            {view.rounds.map((r) => (
              <li key={r.index} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                <span className="w-8 text-label-md font-semibold text-on-surface-variant">{r.index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span lang="zh" className="font-serif text-body-lg font-semibold text-on-surface">{r.correctTerm}</span>
                  {r.translation && <span className="ml-2 text-label-sm text-on-surface-variant">{r.translation}</span>}
                </span>
                <span className="flex items-center gap-1 text-label-md">
                  <Icon name={r.mine?.correct ? "check_circle" : "close"} filled={!!r.mine?.correct} size={18} className={r.mine?.correct ? "text-secondary" : "text-error"} />
                  <span className="sr-only">Bạn: </span>{r.mine ? `${r.mine.correct ? `+${r.mine.points}` : "0"} · ${seconds(r.mine.elapsedMs)}s` : "bỏ trống"}
                </span>
                <span className="flex items-center gap-1 text-label-md text-on-surface-variant">
                  <Icon name={r.theirs?.correct ? "check_circle" : "close"} filled={!!r.theirs?.correct} size={18} className={r.theirs?.correct ? "text-secondary" : "text-error"} />
                  <span className="sr-only">Đối thủ: </span>{r.theirs ? `${r.theirs.correct ? `+${r.theirs.points}` : "0"} · ${seconds(r.theirs.elapsedMs)}s` : "bỏ trống"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

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
