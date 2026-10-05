import type { AnswerFailure, JoinRoomResult, StartRoomResult } from "./room-types";

/** Ánh xạ kết quả các hàm SQL của phòng sang mã HTTP và mã lỗi ổn định cho client (không lộ thông báo thô). */
const JOIN_ERRORS: Record<Exclude<JoinRoomResult, "ok">, [number, string]> = {
  not_found: [404, "room_not_found"],
  expired: [410, "room_expired"],
  full: [409, "room_full"],
  not_waiting: [409, "room_started"],
};

const START_ERRORS: Record<Exclude<StartRoomResult, "ok">, [number, string]> = {
  no_song: [409, "no_song"],
  song_unusable: [409, "song_unusable"],
  no_questions: [500, "no_questions"],
  not_found: [404, "room_not_found"],
  not_host: [403, "not_host"],
  not_waiting: [409, "room_started"],
  expired: [410, "room_expired"],
  need_two: [409, "need_two_players"],
  not_ready: [409, "not_ready"],
};

const ANSWER_ERRORS: Record<AnswerFailure, [number, string]> = {
  not_playing: [409, "room_not_playing"],
  not_in_room: [403, "not_in_room"],
  no_question: [404, "no_question"],
  not_open: [409, "question_not_open"],
  closed: [409, "question_closed"],
  already_answered: [409, "already_answered"],
};

const failure = ([status, error]: [number, string]) => Response.json({ error }, { status });

export const joinFailure = (result: Exclude<JoinRoomResult, "ok">) => failure(JOIN_ERRORS[result]);
export const startFailure = (result: Exclude<StartRoomResult, "ok">) => failure(START_ERRORS[result]);
export const answerFailure = (result: AnswerFailure) => failure(ANSWER_ERRORS[result]);
export const nicknameRequired = () => Response.json({ error: "nickname_required" }, { status: 409 });
export const authRequired = () => Response.json({ error: "auth_required" }, { status: 401 });
export const rateLimited = () => Response.json({ error: "rate_limited" }, { status: 429 });
export const badRequest = (error: string) => Response.json({ error }, { status: 400 });
export const serverError = () => Response.json({ error: "server_error" }, { status: 500 });
