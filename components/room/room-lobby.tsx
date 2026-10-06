"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvatarCircle } from "@/components/leaderboard/avatar-circle";
import { Icon } from "@/components/ui/icon";
import { Toast } from "@/components/ui/toast";
import { buildRoomLink } from "@/lib/rooms/room-code-format";
import { roomErrorMessage } from "@/lib/rooms/room-messages";
import type { RoomPlayerView } from "@/lib/rooms/room-types";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";
import { copyText } from "./copy-text";
import type { useRoom } from "./use-room";
import { formatCountdown, useNow } from "./use-now";

function PlayerSlot({ player }: { player: RoomPlayerView | undefined }) {
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant p-space-md text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant"><Icon name="person_add" size={24} /></span>
        <p className="mt-2 text-body-md font-medium text-on-surface">Chờ bạn bè…</p>
        <p className="text-label-sm text-on-surface-variant">Gửi mã hoặc link ở trên</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface-container-low p-space-md text-center">
      <AvatarCircle nickname={player.displayName} avatarUrl={player.avatarUrl} size={48} />
      <p className="mt-2 max-w-full truncate text-body-md font-semibold text-on-surface">{player.displayName}{player.isMe && " (Bạn)"}</p>
      {player.isHost && <span className="mt-1 rounded-full bg-primary px-2 py-0.5 text-label-sm font-semibold text-on-primary">Chủ phòng</span>}
      <p className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-sm font-medium ${player.ready ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
        {player.ready && <Icon name="check_circle" filled size={16} />}
        {player.ready ? "Sẵn sàng" : "Chưa sẵn sàng"}
      </p>
    </div>
  );
}

/** Phòng chờ: mã và link mời, bài hát, hai chỗ người chơi, nút Sẵn sàng (khách) hoặc Bắt đầu (chủ phòng), đếm ngược hết hạn phòng. */
export function RoomLobby({ room }: { room: ReturnType<typeof useRoom> }) {
  const router = useRouter();
  const now = useNow(1000);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const view = room.view!;
  const me = view.players.find((p) => p.isMe);
  const other = view.players.find((p) => !p.isMe && !p.left);
  const bothIn = view.players.filter((p) => !p.left).length === 2;
  const allReady = bothIn && view.players.filter((p) => !p.left).every((p) => p.ready);
  const remainingMs = now === 0 ? 0 : Date.parse(view.expiresAt) - (now + room.offsetMs);

  async function copy(text: string, message: string) {
    setToast((await copyText(text)) ? message : "Không chép được, hãy chép thủ công.");
  }
  async function share() {
    const url = buildRoomLink(window.location.origin, view.code);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Thi đấu SongHanzi", text: `Vào phòng thi đấu của mình nhé! Mã phòng ${view.code}`, url });
        return;
      } catch {
        // Người dùng đóng hộp chia sẻ hoặc không hỗ trợ: rơi xuống chép link.
      }
    }
    await copy(url, "Đã chép link mời");
  }
  async function run(action: () => Promise<{ ok: boolean; data: Record<string, unknown> }>) {
    setBusy(true);
    setError(null);
    const result = await action();
    if (!result.ok) setError(roomErrorMessage(result.data.error));
    setBusy(false);
  }
  async function leave() {
    await room.leave();
    router.push("/room");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-space-md">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-headline-md md:text-headline-lg">Phòng chờ <span className="font-mono text-primary">#{view.code}</span></h1>
        <span role="timer" aria-label="Thời gian còn lại của phòng" className="inline-flex min-h-8 items-center gap-1 rounded-full bg-surface-container-high px-3 text-label-md font-medium text-on-surface">
          <Icon name="timer" size={18} /> {formatCountdown(remainingMs)}
        </span>
      </div>

      <section aria-labelledby="code-heading" className="rounded-2xl bg-surface-container-low p-space-md text-center">
        <h2 id="code-heading" className="text-label-md font-semibold tracking-wide text-on-surface-variant">MÃ PHÒNG GẶP MẶT</h2>
        <p aria-label={`Mã phòng ${view.code.split("").join(" ")}`} className="mt-1 font-serif text-[2.5rem] font-semibold leading-tight tracking-[0.35em] text-primary">{view.code}</p>
        <div className="mt-space-sm flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => copy(view.code, "Đã chép mã phòng")} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-high px-5 text-label-md font-medium text-on-surface hover:bg-surface-container-highest">
            <Icon name="content_copy" size={18} /> Sao chép mã
          </button>
          <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 text-label-md font-medium text-on-secondary hover:opacity-90">
            <Icon name="share" size={18} /> Gửi Zalo / Link
          </button>
        </div>
      </section>

      <section aria-label="Bài hát và chế độ chơi" className="rounded-2xl bg-surface-container-low p-space-md">
        <div className="flex items-center gap-3">
          {view.song ? (
            <Image src={videoThumbnailUrl(view.song.videoId, "mqdefault")} alt="" width={96} height={54} className="h-14 w-24 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant"><Icon name="shuffle" size={26} /></span>
          )}
          <div className="min-w-0">
            <p lang="zh" className="truncate text-body-md font-semibold text-on-surface">{view.song?.title ?? "Bài ngẫu nhiên"}</p>
            <p className="truncate text-label-md text-on-surface-variant">{view.song?.channelTitle ?? "Hệ thống chọn một bài khi bắt đầu ván"}</p>
            <p className="truncate text-label-sm text-on-surface-variant">{view.showTranslation ? "Hiện nghĩa câu hát khi đang chơi" : "Nghĩa câu hát chỉ hiện sau khi trả lời"}</p>
          </div>
        </div>
        <p className="mt-space-sm inline-flex items-center gap-2 rounded-xl bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface">
          <Icon name="quiz" size={18} className="text-primary" /> Điền từ vào chỗ trống · <span className="font-semibold text-secondary">{view.questionCount} câu</span>
        </p>
      </section>

      <section aria-labelledby="players-heading">
        <div className="flex items-baseline justify-between">
          <h2 id="players-heading" className="text-label-md font-semibold tracking-wide text-on-surface-variant">NGƯỜI CHƠI ({view.players.filter((p) => !p.left).length}/2)</h2>
          <span className="text-label-md text-secondary">{bothIn ? (allReady ? "Sẵn sàng bắt đầu" : "Chờ sẵn sàng") : "Đang đợi đối thủ"}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-space-sm">
          <PlayerSlot player={me} />
          <PlayerSlot player={other} />
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      <div className="flex flex-col gap-space-sm">
        {me?.isHost ? (
          <button type="button" disabled={busy || !allReady} onClick={() => run(room.start)} className="min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">
            {busy ? "Đang bắt đầu…" : allReady ? "Bắt đầu thi đấu" : "Bắt đầu thi đấu (chờ đối thủ)"}
          </button>
        ) : (
          <button type="button" aria-pressed={me?.ready} disabled={busy} onClick={() => run(() => room.setReady(!me?.ready))} className="min-h-12 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">
            {me?.ready ? "Bỏ sẵn sàng" : "Sẵn sàng"}
          </button>
        )}
        <button type="button" onClick={leave} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">
          <Icon name="logout" size={18} /> Rời phòng
        </button>
      </div>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
