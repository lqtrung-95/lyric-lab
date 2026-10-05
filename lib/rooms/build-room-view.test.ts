import { describe, expect, it } from "vitest";
import { buildRoomView, type RoomViewInput } from "./build-room-view";

const NOW = new Date("2026-10-05T10:00:10.000Z");
const payload = { videoId: "abcdefghijk", lineIndex: 0, before: "a", after: "b", pinyinBefore: null, pinyinAfter: null, translation: null, sinoVietHint: null, choices: [], clipStart: 0, clipEnd: 3, grammarNote: null };

function input(over: Partial<RoomViewInput> = {}): RoomViewInput {
  return {
    room: { id: "r1", code: "123456", status: "playing", host_id: "u1", question_count: 10, expires_at: "2026-10-05T12:00:00Z", current_question: 0, winner_id: null, forfeit: false },
    players: [
      { user_id: "u1", display_name: "Linh", ready: true, left_at: null, score: 0, correct: 0, answered_idx: -1, last_answer_ms: null },
      { user_id: "u2", display_name: "Minh", ready: true, left_at: null, score: 0, correct: 0, answered_idx: -1, last_answer_ms: null },
    ],
    me: "u1",
    now: NOW,
    song: null,
    question: { idx: 0, payload, opens_at: "2026-10-05T10:00:05.000Z", deadline_at: "2026-10-05T10:00:20.000Z", correct_index: 2 },
    myAnswer: null,
    rounds: null,
    ...over,
  };
}

describe("buildRoomView: không lộ đáp án", () => {
  it("câu đang mở và chưa ai trả lời: không lộ đáp án đúng", () => {
    expect(buildRoomView(input()).currentQuestion).toMatchObject({ index: 0, myAnswer: null, correctIndex: null });
  });
  it("người xem đã trả lời thì thấy đáp án đúng của câu đó và kết quả của mình", () => {
    const v = buildRoomView(input({ myAnswer: { user_id: "u1", choice: 1, correct: false, points: 0, elapsed_ms: 2400 } }));
    expect(v.currentQuestion).toMatchObject({ correctIndex: 2, myAnswer: { choice: 1, correct: false, points: 0, elapsedMs: 2400 } });
  });
  it("câu đã đóng (quá hạn + ân hạn) thì lộ đáp án cho cả người chưa trả lời", () => {
    const late = new Date("2026-10-05T10:00:21.500Z");
    expect(buildRoomView(input({ now: late })).currentQuestion?.correctIndex).toBe(2);
    const inGrace = new Date("2026-10-05T10:00:20.500Z");
    expect(buildRoomView(input({ now: inGrace })).currentQuestion?.correctIndex).toBeNull();
  });
  it("mọi người còn trong phòng đã trả lời thì câu đóng và lộ đáp án", () => {
    const players = input().players.map((p) => ({ ...p, answered_idx: 0 }));
    expect(buildRoomView(input({ players })).currentQuestion?.correctIndex).toBe(2);
  });
  it("chỉ báo đối thủ đã trả lời hay chưa, kèm thời gian; không có trường lựa chọn hay đúng/sai", () => {
    const players = input().players.map((p) => (p.user_id === "u2" ? { ...p, answered_idx: 0, last_answer_ms: 2400 } : p));
    const v = buildRoomView(input({ players }));
    const opponent = v.players.find((p) => !p.isMe)!;
    expect(opponent).toMatchObject({ answered: true, lastAnswerMs: 2400, score: 0, correct: 0 });
    expect(Object.keys(opponent).sort()).toEqual(["answered", "correct", "displayName", "isHost", "isMe", "lastAnswerMs", "left", "ready", "score"].sort());
  });
  it("người đã rời không tính vào việc 'mọi người đã trả lời'", () => {
    const players = input().players.map((p) => (p.user_id === "u2" ? { ...p, left_at: "2026-10-05T10:00:08Z" } : { ...p, answered_idx: 0 }));
    expect(buildRoomView(input({ players })).currentQuestion?.correctIndex).toBe(2);
  });
});

describe("buildRoomView: kết thúc và hết hạn", () => {
  it("người thắng tính theo góc nhìn của người xem; hòa khi không có winner", () => {
    const finished = { ...input().room, status: "finished" as const };
    expect(buildRoomView(input({ room: { ...finished, winner_id: "u1" } })).winner).toBe("me");
    expect(buildRoomView(input({ room: { ...finished, winner_id: "u2" } })).winner).toBe("opponent");
    expect(buildRoomView(input({ room: { ...finished, winner_id: null } })).winner).toBe("draw");
    expect(buildRoomView(input()).winner).toBeNull();
  });
  it("ván kết thúc: lộ đáp án câu cuối và dựng tổng kết từng câu (đối thủ chỉ có đúng/sai, điểm, thời gian)", () => {
    const v = buildRoomView(input({
      room: { ...input().room, status: "finished", winner_id: "u1" },
      rounds: [{ idx: 0, correct_term: "远", translation: "xa", answers: [
        { user_id: "u1", choice: 2, correct: true, points: 126, elapsed_ms: 1800 },
        { user_id: "u2", choice: 0, correct: false, points: 0, elapsed_ms: 2400 },
      ] }],
    }));
    expect(v.currentQuestion?.correctIndex).toBe(2);
    expect(v.rounds).toEqual([{
      index: 0, correctTerm: "远", translation: "xa",
      mine: { choice: 2, correct: true, points: 126, elapsedMs: 1800 },
      theirs: { correct: false, points: 0, elapsedMs: 2400 },
    }]);
    expect(Object.keys(v.rounds![0].theirs!)).not.toContain("choice");
  });
  it("phòng chờ quá hạn được báo là hết hạn", () => {
    const room = { ...input().room, status: "waiting" as const, expires_at: "2026-10-05T09:00:00Z" };
    expect(buildRoomView(input({ room, question: null })).status).toBe("expired");
  });
  it("chưa có câu hỏi thì currentQuestion là null và không ai 'đã trả lời'", () => {
    const v = buildRoomView(input({ question: null }));
    expect(v.currentQuestion).toBeNull();
    expect(v.players.every((p) => !p.answered)).toBe(true);
  });
});
