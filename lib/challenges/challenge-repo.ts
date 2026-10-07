import "server-only";
import { readSongRow } from "@/lib/analysis/server-deps";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { buildRoomQuestions } from "@/lib/rooms/build-room-questions";
import { prepareRoomQuestions } from "@/lib/rooms/room-question-store";
import { randomListedSongs } from "@/lib/rooms/room-repo";
import type { RoomQuestionPublic } from "@/lib/rooms/room-question-types";
import { readCachedAnalysis } from "@/lib/analysis/server-deps";
import { generateChallengeCode } from "./challenge-code";
import { judgeAnswer } from "./judge-answer";
import {
  CHALLENGE_QUESTION_COUNT, type AnsweredQuestion, type ChallengeInfo, type ChallengeStart, type ChallengeStanding, type SubmitFailure, type SubmitResult,
} from "./challenge-types";

const RANDOM_SONG_TRIES = 10;
const CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";
const STANDINGS_SHOWN = 10;

export class ChallengeError extends Error {
  constructor(readonly code: "invalid_song" | "code_unavailable") { super(code); }
}

const sb = () => createSupabaseServiceClient();
const randomSeed = () => Math.floor(Math.random() * 2_000_000_000);

/** Bỏ nghĩa cả dòng khỏi câu hỏi: chơi thử thách mặc định ẩn nghĩa (giống phòng thi đấu) để câu không bị lộ qua bản dịch. */
const hideTranslation = (q: RoomQuestionPublic): RoomQuestionPublic => ({ ...q, translation: null });

/** Tạo thử thách: chọn bài (ngẫu nhiên hoặc theo `videoId`), dựng bộ câu cố định, lưu câu hỏi cùng đáp án. Trả mã. */
export async function createChallenge(userId: string, creatorName: string, videoId: string | null): Promise<string> {
  const seed = randomSeed();
  const candidates = videoId ? [videoId] : (await randomListedSongs()).slice(0, RANDOM_SONG_TRIES);
  let chosen: { videoId: string; set: NonNullable<Awaited<ReturnType<typeof prepareRoomQuestions>>> } | null = null;
  for (const id of candidates) {
    const set = await prepareRoomQuestions(id, seed, CHALLENGE_QUESTION_COUNT);
    if (set) { chosen = { videoId: id, set }; break; }
  }
  if (!chosen) throw new ChallengeError("invalid_song");

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
    const code = generateChallengeCode();
    const { error } = await sb().from("challenges").insert({ code, creator_id: userId, creator_name: creatorName, video_id: chosen.videoId, question_count: CHALLENGE_QUESTION_COUNT });
    if (error) {
      if (error.code === UNIQUE_VIOLATION) continue;
      throw new Error(`challenges: ${error.message}`);
    }
    const { error: qError } = await sb().from("challenge_questions").insert(
      chosen.set.questions.map((q, idx) => ({ code, idx, payload: hideTranslation(q), correct_index: chosen!.set.correctIndexes[idx], correct_term: chosen!.set.correctTerms[idx] })),
    );
    if (qError) {
      await sb().from("challenges").delete().eq("code", code);
      throw new Error(`challenge_questions: ${qError.message}`);
    }
    return code;
  }
  throw new ChallengeError("code_unavailable");
}

/** Bài có chọn được cho thử thách không (đã phân tích và đủ dữ liệu cho bộ câu). */
export async function canPlayChallengeSong(videoId: string): Promise<boolean> {
  const analysis = await readCachedAnalysis(videoId);
  return analysis !== null && buildRoomQuestions(analysis, 1, CHALLENGE_QUESTION_COUNT) !== null;
}

interface ChallengeRow { code: string; creator_id: string | null; creator_name: string; video_id: string; question_count: number; expires_at: string }

async function readChallenge(code: string): Promise<ChallengeRow | null> {
  const { data } = await sb().from("challenges").select("code, creator_id, creator_name, video_id, question_count, expires_at").eq("code", code).maybeSingle();
  return (data as ChallengeRow | null) ?? null;
}

/** Thông tin hiển thị của một thử thách cho người xem hiện tại; null nếu không có mã đó. Không chứa câu hỏi hay đáp án. */
export async function getChallengeInfo(code: string, viewerId: string | null): Promise<ChallengeInfo | null> {
  const c = await readChallenge(code);
  if (!c) return null;
  const [{ data: rows }, song] = await Promise.all([
    sb().from("challenge_attempts").select("id, user_id, player_name, total_points, correct_count, answered_count, finished_at").eq("code", code),
    readSongRow(c.video_id),
  ]);
  const attempts = rows ?? [];
  const standings: ChallengeStanding[] = attempts
    .filter((a) => a.finished_at)
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, STANDINGS_SHOWN)
    .map((a) => ({ name: a.player_name, points: a.total_points, correct: a.correct_count, isMe: viewerId !== null && a.user_id === viewerId, isCreator: c.creator_id !== null && a.user_id === c.creator_id }));
  const mine = viewerId ? attempts.find((a) => a.user_id === viewerId) : undefined;
  return {
    code, creatorName: c.creator_name, videoId: c.video_id, songTitle: song?.title ?? null, questionCount: c.question_count, standings,
    mine: mine ? { attemptId: mine.id, answered: mine.answered_count, finished: Boolean(mine.finished_at), points: mine.total_points } : null,
    expired: new Date(c.expires_at).getTime() < Date.now(),
  };
}

async function answeredFor(attemptId: string, code: string): Promise<AnsweredQuestion[]> {
  const [{ data: answers }, { data: keys }] = await Promise.all([
    sb().from("challenge_answers").select("idx, choice, correct, points, elapsed_ms").eq("attempt_id", attemptId).order("idx"),
    sb().from("challenge_questions").select("idx, correct_index, correct_term").eq("code", code),
  ]);
  const keyByIdx = new Map((keys ?? []).map((k) => [k.idx as number, k]));
  return (answers ?? []).map((a) => ({
    idx: a.idx, choice: a.choice, correct: a.correct, points: a.points, elapsedMs: a.elapsed_ms,
    correctIndex: keyByIdx.get(a.idx)?.correct_index ?? 0, correctTerm: keyByIdx.get(a.idx)?.correct_term ?? "",
  }));
}

/** Bắt đầu (hoặc tiếp tục) lượt chơi của người dùng: mỗi người một lượt cho mỗi thử thách. Trả câu hỏi công khai và các câu đã trả lời. */
export async function startAttempt(code: string, userId: string, playerName: string): Promise<ChallengeStart | "not_found" | "expired" | "already_finished"> {
  const c = await readChallenge(code);
  if (!c) return "not_found";
  const existing = (await sb().from("challenge_attempts").select("id, finished_at").eq("code", code).eq("user_id", userId).maybeSingle()).data;
  if (existing?.finished_at) return "already_finished";
  if (!existing && new Date(c.expires_at).getTime() < Date.now()) return "expired";

  let attemptId = existing?.id as string | undefined;
  if (!attemptId) {
    const { data, error } = await sb().from("challenge_attempts").insert({ code, user_id: userId, player_name: playerName }).select("id").single();
    if (error) {
      if (error.code !== UNIQUE_VIOLATION) throw new Error(`challenge_attempts: ${error.message}`);
      attemptId = (await sb().from("challenge_attempts").select("id").eq("code", code).eq("user_id", userId).single()).data!.id as string;
    } else attemptId = data.id as string;
  }
  const { data: qs } = await sb().from("challenge_questions").select("idx, payload").eq("code", code).order("idx");
  return { attemptId, questions: (qs ?? []).map((q) => q.payload as RoomQuestionPublic), answered: await answeredFor(attemptId, code) };
}

/** Ghi và chấm một câu trả lời. Phải trả lời theo thứ tự; trả lại đáp án đúng của chính câu đó. */
export async function submitAnswer(
  attemptId: string, userId: string, idx: number, choice: number, clientElapsedMs: number,
): Promise<SubmitResult | SubmitFailure> {
  const { data: attempt } = await sb().from("challenge_attempts")
    .select("id, code, user_id, started_at, last_answer_at, finished_at, answered_count, total_points, correct_count").eq("id", attemptId).maybeSingle();
  if (!attempt) return "not_found";
  if (attempt.user_id !== userId) return "forbidden";
  if (attempt.finished_at) return "already_finished";
  if (idx !== attempt.answered_count) return "out_of_order";

  const { data: key } = await sb().from("challenge_questions").select("correct_index, correct_term").eq("code", attempt.code).eq("idx", idx).maybeSingle();
  const { data: ch } = await sb().from("challenges").select("question_count").eq("code", attempt.code).single();
  if (!key || !ch) return "not_found";

  const since = new Date(attempt.last_answer_at ?? attempt.started_at).getTime();
  const j = judgeAnswer({ choice, correctIndex: key.correct_index, clientElapsedMs, serverGapMs: Date.now() - since });
  const { error } = await sb().from("challenge_answers").insert({ attempt_id: attemptId, idx, choice: j.choice, correct: j.correct, points: j.points, elapsed_ms: j.elapsedMs });
  if (error) return error.code === UNIQUE_VIOLATION ? "out_of_order" : (() => { throw new Error(`challenge_answers: ${error.message}`); })();

  const answeredCount = attempt.answered_count + 1;
  const totals = { points: attempt.total_points + j.points, correct: attempt.correct_count + (j.correct ? 1 : 0) };
  const finished = answeredCount >= ch.question_count;
  const now = new Date().toISOString();
  await sb().from("challenge_attempts").update({
    answered_count: answeredCount, total_points: totals.points, correct_count: totals.correct, last_answer_at: now, finished_at: finished ? now : null,
  }).eq("id", attemptId);
  return { answered: { idx, choice: j.choice, correct: j.correct, points: j.points, elapsedMs: j.elapsedMs, correctIndex: key.correct_index, correctTerm: key.correct_term }, finished, totals };
}
