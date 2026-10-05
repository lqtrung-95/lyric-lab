import { describe, expect, it } from "vitest";
import { buildRoomView, type RoomViewInput } from "./build-room-view";
import { ADVANCE_DELAY_MS, msUntilAdvance, questionPhase, serverOffsetMs } from "./room-clock";

const OPENS = Date.parse("2026-10-05T10:00:05.000Z");
const DEADLINE = Date.parse("2026-10-05T10:00:20.000Z");
const q = { opensAt: new Date(OPENS).toISOString(), deadlineAt: new Date(DEADLINE).toISOString() };

describe("serverOffsetMs", () => {
  it("cộng độ lệch vào giờ máy ra giờ server, âm khi máy chạy nhanh hơn", () => {
    expect(serverOffsetMs("2026-10-05T10:00:00.000Z", Date.parse("2026-10-05T09:59:58.000Z"))).toBe(2000);
    expect(serverOffsetMs("2026-10-05T10:00:00.000Z", Date.parse("2026-10-05T10:00:03.000Z"))).toBe(-3000);
  });
});

describe("questionPhase", () => {
  it("đếm ngược trước khi mở, mở trong 15 giây, rồi đóng", () => {
    expect(questionPhase(q, OPENS - 2000)).toEqual({ phase: "countdown", msToOpen: 2000, msLeft: 15000 });
    expect(questionPhase(q, OPENS)).toEqual({ phase: "open", msToOpen: 0, msLeft: 15000 });
    expect(questionPhase(q, DEADLINE - 4000)).toMatchObject({ phase: "open", msLeft: 4000 });
    expect(questionPhase(q, DEADLINE)).toMatchObject({ phase: "open", msLeft: 0 });
    expect(questionPhase(q, DEADLINE + 1)).toEqual({ phase: "closed", msToOpen: 0, msLeft: 0 });
  });
});

function view(over: { status?: "playing" | "waiting" | "finished"; answered?: [boolean, boolean]; left?: [boolean, boolean]; noQuestion?: boolean } = {}) {
  const [a1, a2] = over.answered ?? [false, false];
  const [l1, l2] = over.left ?? [false, false];
  const input: RoomViewInput = {
    room: { id: "r", code: "123456", status: over.status ?? "playing", host_id: "u1", question_count: 10, expires_at: "2099-01-01T00:00:00Z", current_question: 0, winner_id: null, forfeit: false },
    players: [
      { user_id: "u1", display_name: "Linh", ready: true, left_at: l1 ? "x" : null, score: 0, correct: 0, answered_idx: a1 ? 0 : -1, last_answer_ms: null },
      { user_id: "u2", display_name: "Minh", ready: true, left_at: l2 ? "x" : null, score: 0, correct: 0, answered_idx: a2 ? 0 : -1, last_answer_ms: null },
    ],
    me: "u1", now: new Date(OPENS), song: null,
    question: over.noQuestion ? null : { idx: 0, payload: {} as never, opens_at: q.opensAt, deadline_at: q.deadlineAt, correct_index: 1 },
    myAnswer: null, rounds: null,
  };
  return buildRoomView(input);
}

describe("msUntilAdvance", () => {
  it("không cần tiến khi ván không đang chơi hoặc chưa có câu", () => {
    expect(msUntilAdvance(view({ status: "waiting" }), OPENS)).toBeNull();
    expect(msUntilAdvance(view({ status: "finished" }), OPENS)).toBeNull();
    expect(msUntilAdvance(view({ noQuestion: true }), OPENS)).toBeNull();
  });
  it("mọi người còn trong phòng đã trả lời: tiến ngay", () => {
    expect(msUntilAdvance(view({ answered: [true, true] }), OPENS + 2000)).toBe(0);
    expect(msUntilAdvance(view({ answered: [true, false], left: [false, true] }), OPENS + 2000)).toBe(0);
  });
  it("chưa trả lời hết: đợi tới hạn + ân hạn, không bao giờ âm", () => {
    expect(msUntilAdvance(view({ answered: [true, false] }), OPENS + 2000)).toBe(DEADLINE + ADVANCE_DELAY_MS - (OPENS + 2000));
    expect(msUntilAdvance(view(), DEADLINE + 5000)).toBe(0);
  });
  it("câu chưa mở thì dù ai 'đã trả lời' (dữ liệu cũ) cũng chưa tiến: đợi tới hạn chót", () => {
    expect(msUntilAdvance(view({ answered: [true, true] }), OPENS - 1000)).toBe(DEADLINE + ADVANCE_DELAY_MS - (OPENS - 1000));
  });
});
