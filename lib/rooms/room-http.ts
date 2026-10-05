import type { JoinRoomResult, StartRoomResult } from "./room-types";

/** Ánh xạ kết quả các hàm SQL của phòng sang mã HTTP và mã lỗi ổn định cho client (không lộ thông báo thô). */
const JOIN_ERRORS: Record<Exclude<JoinRoomResult, "ok">, [number, string]> = {
  not_found: [404, "room_not_found"],
  expired: [410, "room_expired"],
  full: [409, "room_full"],
  not_waiting: [409, "room_started"],
};

const START_ERRORS: Record<Exclude<StartRoomResult, "ok">, [number, string]> = {
  no_song: [409, "no_song"],
  not_found: [404, "room_not_found"],
  not_host: [403, "not_host"],
  not_waiting: [409, "room_started"],
  expired: [410, "room_expired"],
  need_two: [409, "need_two_players"],
  not_ready: [409, "not_ready"],
};

const failure = ([status, error]: [number, string]) => Response.json({ error }, { status });

export const joinFailure = (result: Exclude<JoinRoomResult, "ok">) => failure(JOIN_ERRORS[result]);
export const startFailure = (result: Exclude<StartRoomResult, "ok">) => failure(START_ERRORS[result]);
export const authRequired = () => Response.json({ error: "auth_required" }, { status: 401 });
export const rateLimited = () => Response.json({ error: "rate_limited" }, { status: 429 });
export const badRequest = (error: string) => Response.json({ error }, { status: 400 });
export const serverError = () => Response.json({ error: "server_error" }, { status: 500 });
