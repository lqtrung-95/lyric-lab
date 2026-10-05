import { describe, expect, it } from "vitest";
import { ROOM_QUESTION_MS, decideWinner, roomAnswerPoints } from "./room-scoring";

describe("roomAnswerPoints", () => {
  it("sai hoặc hết giờ: 0 điểm bất kể tốc độ", () => {
    expect(roomAnswerPoints(false, 0)).toBe(0);
    expect(roomAnswerPoints(false, 5000)).toBe(0);
  });
  it("đúng: 100 + thưởng tốc độ 30 giảm tuyến tính tới 0 ở giây thứ 15", () => {
    expect(roomAnswerPoints(true, 0)).toBe(130);
    expect(roomAnswerPoints(true, 1800)).toBe(126); // thiết kế minh họa khoảng +25 ở 1,8 giây
    expect(roomAnswerPoints(true, 7500)).toBe(115);
    expect(roomAnswerPoints(true, ROOM_QUESTION_MS)).toBe(100);
  });
  it("làm tròn nửa lên ở các mốc đúng .5 (250 ms, 750 ms…) giống hàm SQL", () => {
    expect(roomAnswerPoints(true, 250)).toBe(130); // 29,5 → 30
    expect(roomAnswerPoints(true, 750)).toBe(129); // 28,5 → 29
    expect(roomAnswerPoints(true, 14_750)).toBe(101); // thưởng 0,5 làm tròn lên thành 1
  });
  it("kẹp thời gian ngoài khoảng 0..15 giây", () => {
    expect(roomAnswerPoints(true, -500)).toBe(130);
    expect(roomAnswerPoints(true, 60_000)).toBe(100);
  });
});

describe("decideWinner", () => {
  it("điểm cao hơn thắng, kể cả khi ít câu đúng hơn (thưởng tốc độ tính vào điểm)", () => {
    expect(decideWinner({ correct: 9, points: 1170 }, { correct: 10, points: 1000 })).toBe("a");
    expect(decideWinner({ correct: 10, points: 1000 }, { correct: 9, points: 1170 })).toBe("b");
  });
  it("bằng điểm thì hòa, bất kể số câu đúng", () => {
    expect(decideWinner({ correct: 8, points: 980 }, { correct: 8, points: 980 })).toBe("draw");
    expect(decideWinner({ correct: 8, points: 900 }, { correct: 9, points: 900 })).toBe("draw");
  });
});
