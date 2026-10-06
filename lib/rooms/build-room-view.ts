import type { RoomQuestionPublic } from "./room-question-types";
import type { MyAnswerView, RoomSongView, RoomStatus, RoomView, RoundCard, RoundSummary } from "./room-types";

/** Hạn ân hạn sau `deadline_at` (khớp hàm SQL), quá mốc này câu coi như đã đóng. */
const GRACE_MS = 1000;

interface AnswerRow {
  user_id: string;
  choice: number;
  correct: boolean;
  points: number;
  elapsed_ms: number;
}

export interface RoomViewInput {
  room: {
    id: string; code: string; status: RoomStatus; host_id: string | null; question_count: number; expires_at: string;
    current_question: number | null; winner_id: string | null; forfeit: boolean;
  };
  players: {
    user_id: string; display_name: string; ready: boolean; left_at: string | null;
    score: number; correct: number; answered_idx: number; last_answer_ms: number | null;
  }[];
  /** Ảnh đại diện theo id tài khoản (thiếu = chưa đặt). */
  avatars?: Record<string, string | null>;
  me: string;
  now: Date;
  song: RoomSongView | null;
  /** Câu hiện tại cùng đáp án đúng (server đọc luôn, hàm này quyết định có lộ cho người xem không). */
  question: { idx: number; payload: RoomQuestionPublic; opens_at: string; deadline_at: string; correct_index: number } | null;
  /** Câu trả lời của chính người xem cho câu hiện tại. */
  myAnswer: AnswerRow | null;
  /** Tổng kết từng câu, chỉ truyền khi ván đã kết thúc. */
  rounds: { idx: number; correct_term: string; payload: RoomQuestionPublic; answers: AnswerRow[] }[] | null;
}

/** Thẻ ôn của câu: đáp án đúng nằm trong 4 lựa chọn của câu (cùng chữ với từ đúng). Null nếu không tìm thấy. */
function toCard(correctTerm: string, payload: RoomQuestionPublic): RoundCard | null {
  const choice = payload.choices.find((c) => c.term === correctTerm);
  if (!choice) return null;
  return {
    term: choice.term, reading: choice.reading, sinoViet: choice.sinoViet, meaning: choice.meaning,
    videoId: payload.videoId, lineIndex: payload.lineIndex, start: payload.clipStart,
  };
}

const toMine = (a: AnswerRow | null | undefined): MyAnswerView | null =>
  a ? { choice: a.choice, correct: a.correct, points: a.points, elapsedMs: a.elapsed_ms } : null;

/**
 * Dựng trạng thái phòng cho một thành viên từ các dòng dữ liệu (hàm thuần để test). Quy tắc không lộ thông tin:
 * điểm/số câu đúng của mọi người lấy từ giá trị đã công bố (cập nhật khi câu đóng); đáp án đúng của câu hiện tại chỉ lộ khi người xem
 * đã trả lời hoặc câu đã đóng (hết hạn, mọi người đã trả lời, hoặc ván kết thúc); lựa chọn của đối thủ không bao giờ đi qua đây
 * trước khi ván kết thúc, và khi đó chỉ gồm đúng/sai, điểm, thời gian.
 */
export function buildRoomView(input: RoomViewInput): RoomView {
  const { room, players, avatars, me, now, song, question, myAnswer, rounds } = input;
  // Phòng chờ quá hạn nhưng chưa ai chạm vào để đánh dấu: báo hết hạn cho người xem.
  const status: RoomStatus = room.status === "waiting" && Date.parse(room.expires_at) < now.getTime() ? "expired" : room.status;

  const active = players.filter((p) => p.left_at === null);
  const currentIdx = question?.idx ?? -1;
  const allAnswered = question !== null && active.length > 0 && active.every((p) => p.answered_idx === currentIdx);
  const closed = status === "finished" || allAnswered || (question !== null && now.getTime() > Date.parse(question.deadline_at) + GRACE_MS);

  const winner: RoomView["winner"] =
    status !== "finished" ? null : room.winner_id === null ? "draw" : room.winner_id === me ? "me" : "opponent";

  const summaries: RoundSummary[] | null = rounds
    ? rounds.map((r) => {
        const theirs = r.answers.find((a) => a.user_id !== me);
        return {
          index: r.idx, correctTerm: r.correct_term, translation: r.payload.translation, card: toCard(r.correct_term, r.payload),
          mine: toMine(r.answers.find((a) => a.user_id === me)),
          theirs: theirs ? { correct: theirs.correct, points: theirs.points, elapsedMs: theirs.elapsed_ms } : null,
        };
      })
    : null;

  return {
    id: room.id,
    code: room.code,
    status,
    song,
    questionCount: room.question_count,
    expiresAt: room.expires_at,
    serverNow: now.toISOString(),
    players: players.map((p) => ({
      displayName: p.display_name,
      avatarUrl: avatars?.[p.user_id] ?? null,
      ready: p.ready,
      isHost: p.user_id === room.host_id,
      isMe: p.user_id === me,
      left: p.left_at !== null,
      score: p.score,
      correct: p.correct,
      answered: question !== null && p.answered_idx === currentIdx,
      lastAnswerMs: p.last_answer_ms,
    })),
    currentQuestion: question
      ? {
          index: question.idx,
          payload: question.payload,
          opensAt: question.opens_at,
          deadlineAt: question.deadline_at,
          myAnswer: toMine(myAnswer),
          correctIndex: myAnswer || closed ? question.correct_index : null,
        }
      : null,
    winner,
    forfeit: room.forfeit,
    rounds: summaries,
  };
}
