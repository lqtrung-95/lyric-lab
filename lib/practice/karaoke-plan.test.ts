import { describe, expect, it } from "vitest";
import { karaokeSongs, planKaraoke, type KaraokeCandidate } from "./karaoke-plan";

const cand = (card: string, lineIndex: number, start: number, videoId = "v1"): KaraokeCandidate<string> => ({
  card, videoId, lineIndex, line: { text: `câu ${lineIndex}`, start, end: start + 5 },
});

describe("planKaraoke", () => {
  it("mỗi dòng một câu hỏi, sắp theo thời gian, mốc tua/hiện/hết đúng", () => {
    const steps = planKaraoke([cand("b", 4, 20), cand("a", 1, 5), cand("a2", 1, 5), cand("c", 2, 10)], "v1", 0);
    expect(steps.map((s) => s.card)).toEqual(["a", "c", "b"]); // a2 cùng dòng với a: bị bỏ
    expect(steps[0]).toMatchObject({ seekTo: 2, showAt: 4.8, endAt: 10 });
  });

  it("chỉ lấy đúng bài; tua không âm khi câu ở đầu bài", () => {
    const steps = planKaraoke([cand("a", 0, 1), cand("x", 1, 9, "v2")], "v1", 0);
    expect(steps).toHaveLength(1);
    expect(steps[0].seekTo).toBe(0);
    expect(steps[0].showAt).toBe(0.8);
  });

  it("cộng độ lệch lời của người dùng vào mọi mốc", () => {
    const [s] = planKaraoke([cand("a", 1, 5)], "v1", 2);
    expect(s).toMatchObject({ seekTo: 4, showAt: 6.8, endAt: 12 });
    expect(s.line.start).toBe(7);
  });
});

describe("karaokeSongs", () => {
  it("chỉ bài có từ 2 dòng trở lên, nhiều câu hỏi nhất trước, thẻ cùng dòng đếm một lần", () => {
    const list = karaokeSongs(
      [cand("a", 1, 5), cand("b", 1, 5), cand("c", 2, 10), cand("d", 3, 15), cand("x", 1, 5, "v2")],
      { v1: "Bài một", v2: "Bài hai" },
    );
    expect(list).toEqual([{ videoId: "v1", title: "Bài một", questions: 3 }]);
  });

  it("thiếu tên bài thì dùng tên mặc định", () => {
    expect(karaokeSongs([cand("a", 1, 5), cand("b", 2, 10)], {})[0].title).toBe("Bài hát");
  });
});
