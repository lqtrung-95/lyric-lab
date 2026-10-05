import "server-only";
import { simplifyDeep } from "@/lib/analysis/simplify-analysis";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { shuffle } from "@/lib/practice/random";
import { generateRoomCode } from "./room-code";
import { canPlayRoomSong, deleteRoomQuestions, prepareRoomQuestions, saveRoomQuestions } from "./room-question-store";
import type { RoomQuestionSet } from "./room-question-types";
import { buildRoomView } from "./build-room-view";
import type { RoomQuestionPublic } from "./room-question-types";
import type { AdvanceResult, AnswerFailure, AnswerFeedback, JoinRoomResult, RoomStatus, RoomView, StartRoomResult } from "./room-types";

export type RoomErrorCode = "invalid_song" | "code_unavailable";

export class RoomError extends Error {
  constructor(public readonly code: RoomErrorCode) {
    super(code);
    this.name = "RoomError";
  }
}

interface RoomRow {
  id: string;
  code: string;
  status: RoomStatus;
  host_id: string | null;
  video_id: string | null;
  question_count: number;
  seed: number;
  expires_at: string;
  current_question: number | null;
  winner_id: string | null;
  forfeit: boolean;
}

const ROOM_COLUMNS = "id, code, status, host_id, video_id, question_count, seed, expires_at, current_question, winner_id, forfeit";
const DEFAULT_QUESTION_COUNT = 10;
const RANDOM_SONG_POOL = 100;
const RANDOM_SONG_TRIES = 10;
const CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";

/** Các bài đang hiện ở Khám phá (đã phân tích, chưa bị báo sai nhiều), thứ tự ngẫu nhiên. */
async function randomListedSongs(): Promise<string[]> {
  const { data } = await createSupabaseServiceClient().from("discover_songs").select("video_id").limit(RANDOM_SONG_POOL);
  return shuffle((data ?? []).map((r) => r.video_id as string));
}

/**
 * Chọn bài và dựng bộ câu hỏi cho phòng. Phòng đã chọn bài thì chỉ thử bài đó (không đủ dữ liệu thì null); chưa chọn thì thử lần lượt
 * vài bài ngẫu nhiên cho tới khi có bài dựng được đủ câu.
 */
async function chooseSongAndQuestions(room: RoomRow): Promise<{ videoId: string; set: RoomQuestionSet } | null> {
  const candidates = room.video_id ? [room.video_id] : (await randomListedSongs()).slice(0, RANDOM_SONG_TRIES);
  for (const videoId of candidates) {
    const set = await prepareRoomQuestions(videoId, room.seed, room.question_count);
    if (set) return { videoId, set };
  }
  return null;
}

/** Tạo phòng và đưa chủ phòng vào. Trả mã phòng. Thử lại với mã khác khi trùng một phòng còn hiệu lực. */
export async function createRoom(userId: string, displayName: string, videoId: string | null): Promise<string> {
  if (videoId && !(await canPlayRoomSong(videoId, DEFAULT_QUESTION_COUNT))) throw new RoomError("invalid_song");
  const sb = createSupabaseServiceClient();
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    const { error } = await sb.rpc("create_room", { p_host: userId, p_code: code, p_video: videoId, p_name: displayName });
    if (!error) return code;
    if (error.code !== UNIQUE_VIOLATION) throw new Error(`create_room: ${error.message}`);
  }
  throw new RoomError("code_unavailable");
}

export async function joinRoom(userId: string, code: string, displayName: string): Promise<JoinRoomResult> {
  const { data, error } = await createSupabaseServiceClient().rpc("join_room", { p_code: code, p_user: userId, p_name: displayName });
  if (error) throw new Error(`join_room: ${error.message}`);
  return data as JoinRoomResult;
}

/** Phòng mới nhất mang mã này mà người dùng từng ở trong (mã được dùng lại sau khi phòng cũ kết thúc). Null nếu không phải thành viên. */
async function findMemberRoom(userId: string, code: string): Promise<RoomRow | null> {
  const { data, error } = await createSupabaseServiceClient().from("room_players")
    .select(`joined_at, rooms!inner(${ROOM_COLUMNS})`)
    .eq("user_id", userId).eq("rooms.code", code)
    .order("joined_at", { ascending: false }).limit(1);
  if (error) throw new Error(`findMemberRoom: ${error.message}`);
  const row = (data as unknown as { rooms: RoomRow }[] | null)?.[0];
  return row?.rooms ?? null;
}

export async function leaveRoom(userId: string, code: string): Promise<void> {
  const room = await findMemberRoom(userId, code);
  if (!room) return;
  const { error } = await createSupabaseServiceClient().rpc("leave_room", { p_room: room.id, p_user: userId });
  if (error) throw new Error(`leave_room: ${error.message}`);
}

/** Đặt sẵn sàng. False nếu không ở trong phòng hoặc phòng không còn chờ. */
export async function setReady(userId: string, code: string, ready: boolean): Promise<boolean> {
  const room = await findMemberRoom(userId, code);
  if (!room) return false;
  const { data, error } = await createSupabaseServiceClient().rpc("set_room_ready", { p_room: room.id, p_user: userId, p_ready: ready });
  if (error) throw new Error(`set_room_ready: ${error.message}`);
  return data === true;
}

export async function startRoom(userId: string, code: string): Promise<StartRoomResult> {
  const room = await findMemberRoom(userId, code);
  if (!room) return "not_found";
  if (room.host_id !== userId) return "not_host";
  if (room.status !== "waiting") return "not_waiting";

  const sb = createSupabaseServiceClient();
  // Kiểm tra nhanh đủ người/sẵn sàng trước khi dựng bộ câu (tốn đọc phân tích); hàm SQL vẫn là nơi quyết định cuối cùng.
  const { data: players } = await sb.from("room_players").select("ready").eq("room_id", room.id).is("left_at", null);
  if ((players?.length ?? 0) !== 2) return "need_two";
  if (!players!.every((p) => p.ready)) return "not_ready";

  const chosen = await chooseSongAndQuestions(room);
  if (!chosen) return room.video_id ? "song_unusable" : "no_song";
  await saveRoomQuestions(room.id, chosen.set);
  const { data, error } = await sb.rpc("start_room", { p_room: room.id, p_host: userId, p_video: room.video_id ? null : chosen.videoId });
  if (error || data !== "ok") await deleteRoomQuestions(room.id); // không để bộ câu mồ côi ở phòng chưa bắt đầu
  if (error) throw new Error(`start_room: ${error.message}`);
  return data as StartRoomResult;
}

/** Nhận câu trả lời (chấm ở server). Trả phản hồi cho người trả lời hoặc mã lỗi của hàm SQL. */
export async function submitAnswer(
  userId: string, code: string, index: number, choice: number,
): Promise<{ ok: true; feedback: AnswerFeedback } | { ok: false; error: AnswerFailure }> {
  const room = await findMemberRoom(userId, code);
  if (!room) return { ok: false, error: "not_in_room" };
  const { data, error } = await createSupabaseServiceClient().rpc("submit_room_answer", { p_room: room.id, p_user: userId, p_idx: index, p_choice: choice });
  if (error) throw new Error(`submit_room_answer: ${error.message}`);
  const r = data as { result: string; correct?: boolean; points?: number; elapsed_ms?: number; correct_index?: number };
  if (r.result !== "ok") return { ok: false, error: r.result as AnswerFailure };
  return { ok: true, feedback: { correct: r.correct!, points: r.points!, elapsedMs: r.elapsed_ms!, correctIndex: r.correct_index! } };
}

/** Tiến câu (mọi thành viên gọi được, idempotent): chuyển sang câu kế hoặc kết thúc ván khi câu hiện tại đã đóng; chưa đóng thì `not_ready`. */
export async function advanceRoom(userId: string, code: string): Promise<AdvanceResult | "not_in_room"> {
  const room = await findMemberRoom(userId, code);
  if (!room) return "not_in_room";
  const { data, error } = await createSupabaseServiceClient().rpc("advance_room", { p_room: room.id });
  if (error) throw new Error(`advance_room: ${error.message}`);
  return (data as { result: AdvanceResult }).result;
}

interface AnswerDbRow {
  idx: number;
  user_id: string;
  choice: number;
  correct: boolean;
  points: number;
  elapsed_ms: number;
}

/** Tổng kết từng câu của ván đã kết thúc: câu hỏi, đáp án đúng và các câu trả lời. */
async function loadRounds(roomId: string) {
  const sb = createSupabaseServiceClient();
  const [{ data: questions }, { data: keys }, { data: answers }] = await Promise.all([
    sb.from("room_questions").select("idx, payload").eq("room_id", roomId).order("idx"),
    sb.from("room_question_keys").select("idx, correct_term").eq("room_id", roomId),
    sb.from("room_answers").select("idx, user_id, choice, correct, points, elapsed_ms").eq("room_id", roomId),
  ]);
  const termByIdx = new Map((keys ?? []).map((k) => [k.idx as number, k.correct_term as string]));
  const answersByIdx = new Map<number, AnswerDbRow[]>();
  for (const a of (answers ?? []) as AnswerDbRow[]) answersByIdx.set(a.idx, [...(answersByIdx.get(a.idx) ?? []), a]);
  return (questions ?? []).map((q) => ({
    idx: q.idx as number,
    correct_term: termByIdx.get(q.idx as number) ?? "",
    translation: (q.payload as RoomQuestionPublic).translation,
    answers: answersByIdx.get(q.idx as number) ?? [],
  }));
}

/** Trạng thái phòng cho một thành viên; null nếu phòng không tồn tại hoặc người này không ở trong phòng (không lộ phòng của người khác). */
export async function getRoomView(userId: string, code: string): Promise<RoomView | null> {
  const room = await findMemberRoom(userId, code);
  if (!room) return null;
  const sb = createSupabaseServiceClient();
  const cur = room.current_question;
  const [{ data: players }, { data: song }, { data: question }, { data: key }, { data: mine }] = await Promise.all([
    sb.from("room_players").select("user_id, display_name, ready, left_at, score, correct, answered_idx, last_answer_ms").eq("room_id", room.id).order("joined_at"),
    room.video_id
      ? sb.from("songs").select("video_id, title, channel_title").eq("video_id", room.video_id).maybeSingle()
      : Promise.resolve({ data: null }),
    cur === null ? Promise.resolve({ data: null }) : sb.from("room_questions").select("idx, payload, opens_at, deadline_at").eq("room_id", room.id).eq("idx", cur).maybeSingle(),
    cur === null ? Promise.resolve({ data: null }) : sb.from("room_question_keys").select("correct_index").eq("room_id", room.id).eq("idx", cur).maybeSingle(),
    cur === null ? Promise.resolve({ data: null }) : sb.from("room_answers").select("idx, user_id, choice, correct, points, elapsed_ms").eq("room_id", room.id).eq("idx", cur).eq("user_id", userId).maybeSingle(),
  ]);
  const rounds = room.status === "finished" ? await loadRounds(room.id) : null;
  return buildRoomView({
    room,
    players: players ?? [],
    me: userId,
    now: new Date(),
    song: song ? simplifyDeep({ videoId: song.video_id, title: song.title, channelTitle: song.channel_title }) : null,
    question: question && question.opens_at && key
      ? { idx: question.idx as number, payload: question.payload as RoomQuestionPublic, opens_at: question.opens_at, deadline_at: question.deadline_at, correct_index: key.correct_index as number }
      : null,
    myAnswer: mine ?? null,
    rounds,
  });
}
