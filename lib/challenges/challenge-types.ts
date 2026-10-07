import type { RoomQuestionPublic } from "@/lib/rooms/room-question-types";

export const CHALLENGE_QUESTION_COUNT = 10;

export interface ChallengeStanding {
  name: string;
  points: number;
  correct: number;
  isMe: boolean;
  isCreator: boolean;
}

export interface ChallengeInfo {
  code: string;
  creatorName: string;
  videoId: string;
  songTitle: string | null;
  questionCount: number;
  /** Bảng điểm những người đã chơi xong, cao nhất trước (tối đa 10). */
  standings: ChallengeStanding[];
  /** Lượt chơi của chính mình (nếu có). */
  mine: { attemptId: string; answered: number; finished: boolean; points: number } | null;
  expired: boolean;
}

export interface AnsweredQuestion {
  idx: number;
  choice: number;
  correct: boolean;
  points: number;
  elapsedMs: number;
  correctIndex: number;
  correctTerm: string;
}

export interface ChallengeStart {
  attemptId: string;
  questions: RoomQuestionPublic[];
  /** Các câu đã trả lời (khi quay lại giữa chừng). */
  answered: AnsweredQuestion[];
}

export type SubmitFailure = "not_found" | "forbidden" | "out_of_order" | "already_finished";

export interface SubmitResult {
  answered: AnsweredQuestion;
  finished: boolean;
  totals: { points: number; correct: number };
}
