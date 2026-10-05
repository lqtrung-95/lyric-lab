"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { questionPhase } from "@/lib/rooms/room-clock";
import { roomErrorMessage } from "@/lib/rooms/room-messages";
import type { CurrentQuestionView } from "@/lib/rooms/room-types";
import { RoomChoiceList } from "./room-choice-list";
import { RoomClipPlayer } from "./room-clip-player";
import { RoomGrammarNote, RoomQuestionLine } from "./room-question-card";
import { RoomScoreboard } from "./room-scoreboard";
import type { useRoom } from "./use-room";
import { useNow } from "./use-now";

const seconds = (ms: number) => (ms / 1000).toFixed(1).replace(".", ",");

/** Kết quả câu vừa rồi, hiện trong 3 giây đếm ngược trước câu kế (câu mới thay `currentQuestion` ngay khi tiến câu). */
function PreviousRound({ q }: { q: CurrentQuestionView }) {
  const answer = q.correctIndex !== null ? q.payload.choices[q.correctIndex]?.term : undefined;
  const mine = q.myAnswer;
  return (
    <div className="space-y-space-sm">
      <RoomQuestionLine q={q.payload} fill={answer} />
      <p role="status" className={`rounded-xl p-3 text-center text-label-md font-medium ${mine?.correct ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface"}`}>
        {mine ? (mine.correct ? `Chính xác! +${mine.points} điểm (trả lời sau ${seconds(mine.elapsedMs)}s)` : "Chưa đúng ở câu này.") : "Bạn chưa trả lời câu này."}
      </p>
    </div>
  );
}

/** Màn chơi: bảng điểm, đồng hồ, câu hỏi điền từ có nghe đoạn, bốn đáp án. Đáp án chỉ hiện sau khi mình trả lời hoặc câu đã đóng. */
export function RoomPlay({ room }: { room: ReturnType<typeof useRoom> }) {
  const router = useRouter();
  const view = room.view!;
  const q = view.currentQuestion;
  const me = view.players.find((p) => p.isMe);
  const now = useNow(200);
  const timing = q && now ? questionPhase(q, now + room.offsetMs) : null;
  const [asking, setAsking] = useState(false);
  const [picked, setPicked] = useState<{ index: number; choice: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Giữ ảnh chụp câu trước để hiện kết quả của nó trong lúc đếm ngược sang câu mới (điều chỉnh state ngay lúc render, không dùng effect).
  const [track, setTrack] = useState<{ current: CurrentQuestionView; previous: CurrentQuestionView | null } | null>(null);
  if (q && track?.current !== q && (!track || track.current.index === q.index || track.current.index < q.index)) {
    setTrack({ current: q, previous: track && track.current.index < q.index ? track.current : track?.previous ?? null });
  }
  const previous = track?.previous && q && track.previous.index < q.index ? track.previous : null;

  const chosen = q?.myAnswer?.choice ?? (picked && q && picked.index === q.index ? picked.choice : null);
  const open = timing?.phase === "open" && chosen === null && !!me && !me.left;

  async function choose(choice: number) {
    if (!q || !open) return;
    setPicked({ index: q.index, choice });
    setError(null);
    const { error: err } = await room.answer(q.index, choice);
    if (err) {
      setPicked(null);
      setError(roomErrorMessage(err));
    }
  }

  // Phím 1–4 chọn đáp án như các game Điền lời khác.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (e.ctrlKey || e.metaKey || e.altKey || !(n >= 1 && n <= 4)) return;
      void choose(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const secondsLeft = timing ? Math.ceil((timing.phase === "countdown" ? timing.msToOpen : timing.msLeft) / 1000) : 0;
  const liveMessage = useMemo(() => {
    if (!q) return "";
    if (q.myAnswer) return q.myAnswer.correct ? `Chính xác, cộng ${q.myAnswer.points} điểm.` : "Chưa đúng.";
    return timing?.phase === "closed" ? "Hết giờ." : "";
  }, [q, timing?.phase]);

  if (!q) return <p role="status" className="py-space-xl text-center text-body-md text-on-surface-variant">Đang chuẩn bị ván chơi…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-space-md">
      <h1 className="sr-only">Ván thi đấu 1v1: {view.song?.title}</h1>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => setAsking(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">
          <Icon name="logout" size={18} /> Bỏ cuộc
        </button>
        <div className="min-w-0 text-center">
          <p lang="zh" className="truncate text-label-md font-semibold text-on-surface">{view.song?.title}</p>
          <p className="text-label-md text-on-surface-variant">Câu {q.index + 1} / {view.questionCount}</p>
        </div>
        <span role="timer" aria-label="Thời gian còn lại" className={`inline-flex min-h-11 min-w-16 items-center justify-center gap-1 rounded-full px-3 font-mono text-body-lg font-semibold ${timing?.phase === "open" && secondsLeft <= 5 ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface"}`}>
          <Icon name="timer" size={18} /> {timing?.phase === "closed" ? 0 : secondsLeft}
        </span>
      </div>

      <RoomScoreboard players={view.players} />

      {timing?.phase === "countdown" ? (
        <section aria-label="Chuẩn bị câu mới" className="space-y-space-md">
          {previous ? <PreviousRound q={previous} /> : <p className="rounded-2xl bg-surface-container-low p-space-lg text-center font-serif text-headline-md text-on-surface">Sẵn sàng nào!</p>}
          <p role="status" className="text-center text-body-lg font-semibold text-primary">Câu {q.index + 1} bắt đầu sau {secondsLeft}…</p>
        </section>
      ) : (
        <section aria-label={`Câu ${q.index + 1}`} className="space-y-space-md">
          <RoomClipPlayer videoId={q.payload.videoId} questionIndex={q.index} start={q.payload.clipStart} end={q.payload.clipEnd} />
          <RoomQuestionLine q={q.payload} />
          <RoomChoiceList choices={q.payload.choices} enabled={open} chosen={chosen} correctIndex={q.correctIndex} onChoose={(i) => void choose(i)} />
          {q.myAnswer && (
            <p className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-surface-container-low p-3 text-label-md text-on-surface">
              <Icon name="check_circle" filled size={18} className="text-secondary" /> Đã khóa đáp án và gửi máy chủ
              <span className="rounded-full bg-primary/10 px-2 font-semibold text-primary">{q.myAnswer.correct ? `+${q.myAnswer.points} điểm` : "0 điểm"}</span>
              {q.myAnswer.correct && q.myAnswer.points > 100 && <span className="rounded-full bg-secondary-container px-2 text-on-secondary-container">+{q.myAnswer.points - 100} tốc độ ({seconds(q.myAnswer.elapsedMs)}s)</span>}
            </p>
          )}
          {!q.myAnswer && timing?.phase === "closed" && q.correctIndex !== null && (
            <p role="status" className="rounded-xl bg-surface-container-high p-3 text-center text-label-md text-on-surface">Hết giờ. Đáp án đúng là <span lang="zh" className="font-semibold">{q.payload.choices[q.correctIndex]?.term}</span>.</p>
          )}
          {q.payload.grammarNote && q.correctIndex !== null && <RoomGrammarNote note={q.payload.grammarNote} />}
        </section>
      )}

      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      <p aria-live="polite" className="sr-only">{liveMessage}</p>

      <ConfirmDialog
        open={asking} title="Bỏ cuộc?" body="Bạn sẽ thua ván này và đối thủ thắng."
        confirmLabel="Bỏ cuộc" cancelLabel="Tiếp tục chơi"
        onCancel={() => setAsking(false)}
        onConfirm={async () => { setAsking(false); await room.leave(); router.push("/room"); }}
      />
    </div>
  );
}
