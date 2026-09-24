import { describe, expect, it } from "vitest";
import { assessLyricQuality } from "./assess-lyric-quality";

const L = (text: string, start: number, end: number) => ({ text, start, end });

describe("assessLyricQuality", () => {
  it("lời tiếng Trung giản thể → ok", () => {
    const q = assessLyricQuality([
      L("窗外的城市慢慢睡了", 0, 5),
      L("我从来没想过会离开", 5, 10),
      L("你的笑比星光还亮", 10, 15),
    ]);
    expect(q.verdict).toBe("ok");
    expect(q.hanLineRatio).toBe(1);
    expect(q.script).toBe("simplified");
    expect(q.coverageSec).toBe(15);
    expect(q.medianLineSec).toBe(5);
  });

  it("nhận diện phồn thể", () => {
    const q = assessLyricQuality([L("我從來沒想過會離開", 0, 5), L("你的笑比星光還亮", 5, 9)]);
    expect(q.script).toBe("traditional");
  });

  it("dưới 60% dòng là chữ Hán → unsupported", () => {
    const q = assessLyricQuality([
      L("The city outside slowly falls asleep", 0, 5),
      L("I never thought I would leave", 5, 10),
      L("你的笑比星光还亮", 10, 15),
    ]);
    expect(q.verdict).toBe("unsupported");
  });

  it("đếm dòng song ngữ", () => {
    const q = assessLyricQuality([L("你的笑比星光还亮 Your smile is brighter", 0, 5)]);
    expect(q.bilingualLineCount).toBe(1);
  });

  it("không có dòng nào → unsupported, không chia cho 0", () => {
    const q = assessLyricQuality([]);
    expect(q.verdict).toBe("unsupported");
    expect(q.hanCharRatio).toBe(0);
    expect(q.medianLineSec).toBe(0);
  });
});
