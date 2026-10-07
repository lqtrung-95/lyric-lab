"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { RoomChoiceList } from "@/components/room/room-choice-list";
import { RoomClipPlayer } from "@/components/room/room-clip-player";
import { RoomGrammarNote, RoomQuestionLine } from "@/components/room/room-question-card";
import { useNow } from "@/components/room/use-now";
import type { AnsweredQuestion } from "@/lib/challenges/challenge-types";
import type { RoomQuestionPublic } from "@/lib/rooms/room-question-types";
import { ROOM_QUESTION_MS } from "@/lib/rooms/room-scoring";

/** Hiện kết quả câu vừa trả lời trước khi sang câu kế (khớp `RESULT_PAUSE_MS` ở server trừ phần dư an toàn). */
const FEEDBACK_MS = 3_000;

interface Props {
  code: string;
  attemptId: string;
  questions: RoomQuestionPublic[];
  initialAnswered: AnsweredQuestion[];
  songTitle: string | null;
  onFinished: () => void;
}

/** Màn chơi thử thách: từng câu điền lời 15 giây, chấm ở server, hiện đáp án đúng 3 giây rồi sang câu sau. Không có đối thủ cùng lúc. */
export function ChallengePlay({ code, attemptId, questions, initialAnswered, songTitle, onFinished }: Props) {
  const [answers, setAnswers] = useState<AnsweredQuestion[]>(initialAnswered);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = useNow(200);
  const idx = answers.length;
  const q = questions[idx];
  // Câu vừa trả lời (đang hiện kết quả): nằm ở `pending`, chỉ chuyển sang câu mới khi hết thời gian xem kết quả.
  const [pending, setPending] = useState<AnsweredQuestion | null>(null);
  const answeredRef = useRef(false);

  const current = pending ? questions[pending.idx] : q;
  const shown = pending ?? null;
  const left = Math.max(0, ROOM_QUESTION_MS - (now - startedAt));

  async function submit(choice: number) {
    if (!q || busy || answeredRef.current) return;
    answeredRef.current = true;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/challenges/${code}/answer`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, idx, choice, elapsedMs: Math.min(ROOM_QUESTION_MS, Date.now() - startedAt) }),
    }).catch(() => null);
    if (!res?.ok) {
      answeredRef.current = false;
      setBusy(false);
      setError("Chưa gửi được đáp án. Kiểm tra mạng rồi bấm lại.");
      return;
    }
    const data = (await res.json()) as { answered: AnsweredQuestion; finished: boolean };
    setPending(data.answered);
    setBusy(false);
    window.setTimeout(() => {
      setAnswers((a) => [...a, data.answered]);
      setPending(null);
      setStartedAt(Date.now());
      answeredRef.current = false;
      if (data.finished) onFinished();
    }, FEEDBACK_MS);
  }

  // Hết 15 giây mà chưa chọn thì gửi "hết giờ" (-1) để câu được tính 0 điểm và sang câu kế.
  useEffect(() => {
    if (!q || pending || busy) return;
    const remaining = ROOM_QUESTION_MS - (Date.now() - startedAt);
    const t = window.setTimeout(() => { void submit(-1); }, Math.max(0, remaining));
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `submit` đọc state mới nhất qua các biến này
  }, [q, pending, busy, startedAt]);

  // Phím 1–4 chọn đáp án.
  useEffect(() => {
    if (!q || pending || busy) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (e.ctrlKey || e.metaKey || e.altKey || !(n >= 1 && n <= 4)) return;
      void submit(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pending, busy, startedAt]);

  if (!current) return <p role="status" className="py-space-xl text-center text-body-md text-on-surface-variant">Đang tính điểm…</p>;
  const number = (shown?.idx ?? idx) + 1;
  const total = answers.reduce((s, a) => s + a.points, 0) + (pending?.points ?? 0);
  const seconds = Math.ceil(left / 1000);

  return (
    <div className="mx-auto max-w-4xl space-y-space-md">
      <h1 className="sr-only">Thử thách: {songTitle ?? "bài hát"}</h1>
      <div className="flex items-center justify-between gap-3">
        <p className="text-label-md font-semibold text-on-surface">Câu {number} / {questions.length}</p>
        <p className="font-serif text-headline-md text-primary" aria-label={`Điểm hiện tại ${total}`}>{total} điểm</p>
        <span role="timer" aria-label="Thời gian còn lại" className={`inline-flex min-h-11 min-w-16 items-center justify-center gap-1 rounded-full px-3 font-mono text-body-lg font-semibold ${!pending && seconds <= 5 ? "bg-error-container text-on-error-container" : "bg-surface-container-high text-on-surface"}`}>
          <Icon name="timer" size={18} /> {pending ? 0 : seconds}
        </span>
      </div>

      <section aria-label={`Câu ${number}`} className="space-y-space-md">
        <RoomClipPlayer videoId={current.videoId} questionIndex={shown?.idx ?? idx} start={current.clipStart} end={current.clipEnd} />
        <RoomQuestionLine q={current} fill={shown ? current.choices[shown.correctIndex]?.term : undefined} />
        <RoomChoiceList
          choices={current.choices} enabled={!pending && !busy} chosen={shown ? shown.choice : null}
          correctIndex={shown ? shown.correctIndex : null} onChoose={(i) => void submit(i)}
        />
        {shown && (
          <p role="status" className={`rounded-xl p-3 text-center text-label-md font-medium ${shown.correct ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface"}`}>
            {shown.correct ? `Chính xác! +${shown.points} điểm` : shown.choice < 0 ? "Hết giờ." : "Chưa đúng ở câu này."}
          </p>
        )}
        {shown && current.grammarNote && <RoomGrammarNote note={current.grammarNote} />}
      </section>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
    </div>
  );
}
