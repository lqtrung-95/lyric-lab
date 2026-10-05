import { describe, expect, it } from "vitest";
import { answerFailure, joinFailure, nicknameRequired, startFailure } from "./room-http";

const read = async (r: Response) => [r.status, (await r.json()).error];

describe("room-http", () => {
  it("ánh xạ từng kết quả vào phòng sang mã HTTP và mã lỗi riêng", async () => {
    expect(await read(joinFailure("not_found"))).toEqual([404, "room_not_found"]);
    expect(await read(joinFailure("expired"))).toEqual([410, "room_expired"]);
    expect(await read(joinFailure("full"))).toEqual([409, "room_full"]);
    expect(await read(joinFailure("not_waiting"))).toEqual([409, "room_started"]);
  });
  it("ánh xạ từng kết quả bắt đầu ván", async () => {
    expect(await read(startFailure("not_host"))).toEqual([403, "not_host"]);
    expect(await read(startFailure("need_two"))).toEqual([409, "need_two_players"]);
    expect(await read(startFailure("not_ready"))).toEqual([409, "not_ready"]);
    expect(await read(startFailure("no_song"))).toEqual([409, "no_song"]);
  });
  it("ánh xạ từng kết quả trả lời câu hỏi", async () => {
    expect(await read(answerFailure("not_open"))).toEqual([409, "question_not_open"]);
    expect(await read(answerFailure("closed"))).toEqual([409, "question_closed"]);
    expect(await read(answerFailure("already_answered"))).toEqual([409, "already_answered"]);
    expect(await read(answerFailure("not_in_room"))).toEqual([403, "not_in_room"]);
    expect(await read(startFailure("song_unusable"))).toEqual([409, "song_unusable"]);
  });
  it("chưa có biệt danh: 409 nickname_required", async () => {
    expect(await read(nicknameRequired())).toEqual([409, "nickname_required"]);
  });
});
