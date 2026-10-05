import { AvatarCircle } from "@/components/leaderboard/avatar-circle";
import { Icon } from "@/components/ui/icon";
import type { RoomPlayerView } from "@/lib/rooms/room-types";

const seconds = (ms: number) => (ms / 1000).toFixed(1).replace(".", ",");

function Side({ player, align }: { player: RoomPlayerView | undefined; align: "left" | "right" }) {
  const right = align === "right";
  if (!player) return <div className="flex-1" />;
  const status = player.left ? "Đã rời ván" : player.answered ? `Đã trả lời${player.lastAnswerMs !== null ? ` sau ${seconds(player.lastAnswerMs)}s` : ""}` : "Đang suy nghĩ…";
  return (
    <div className={`flex min-w-0 flex-1 flex-col ${right ? "items-end text-right" : "items-start text-left"}`}>
      <AvatarCircle nickname={player.displayName} avatarUrl={player.avatarUrl} size={40} />
      <p className="mt-1 max-w-full truncate text-body-md font-semibold text-on-surface">{player.displayName}{player.isMe && <span className="ml-1 rounded-full bg-primary/10 px-2 text-label-sm text-primary">Bạn</span>}</p>
      <p className="font-serif text-headline-lg-mobile font-semibold text-primary md:text-headline-lg">{player.score}<span className="ml-1 text-label-md font-normal text-on-surface-variant">điểm</span></p>
      <p className="text-label-sm text-on-surface-variant">{player.correct} câu đúng</p>
      <p role="status" className={`mt-1 inline-flex items-center gap-1 text-label-sm ${player.answered && !player.left ? "text-secondary" : "text-on-surface-variant"}`}>
        {player.answered && !player.left && <Icon name="check_circle" filled size={14} />} {status}
      </p>
    </div>
  );
}

/** Bảng điểm hai bên và thanh so sánh. Điểm chỉ cập nhật khi một câu đóng (không lộ đúng/sai của đối thủ trước khi mình trả lời). */
export function RoomScoreboard({ players }: { players: RoomPlayerView[] }) {
  const me = players.find((p) => p.isMe);
  const other = players.find((p) => !p.isMe);
  const total = (me?.score ?? 0) + (other?.score ?? 0);
  const myShare = total === 0 ? 50 : Math.round(((me?.score ?? 0) / total) * 100);
  return (
    <section aria-label="Bảng điểm" className="rounded-2xl bg-surface-container-low p-space-md">
      <div className="flex items-start justify-between gap-3">
        <Side player={me} align="left" />
        <span aria-hidden="true" className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary font-serif text-body-md font-semibold text-on-primary">VS</span>
        <Side player={other} align="right" />
      </div>
      <div role="img" aria-label={`Tỉ lệ điểm: bạn ${myShare}%, đối thủ ${100 - myShare}%`} className="mt-space-sm flex h-2 overflow-hidden rounded-full bg-surface-container-highest">
        <div className="h-full bg-primary transition-all" style={{ width: `${myShare}%` }} />
        <div className="h-full flex-1 bg-secondary" />
      </div>
    </section>
  );
}
