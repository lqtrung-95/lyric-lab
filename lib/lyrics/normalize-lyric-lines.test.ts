import { describe, expect, it } from "vitest";
import { normalizeLyricLines } from "./normalize-lyric-lines";

const L = (text: string, start: number) => ({ text, start, end: start + 5 });

describe("normalizeLyricLines", () => {
  it("bỏ dòng credit, solfege, chú âm phù hiệu; đánh lại index", () => {
    const out = normalizeLyricLines([
      L("作词：歌手甲", 0),
      L("Composer: Singer A", 1),
      L("Re So So Si Do Si La", 2),
      L("ㄖㄨㄟ ㄙㄡ ㄙㄡ ㄒ一", 3),
      L("窗外的城市慢慢睡了", 4),
      L("我從來沒想過會離開", 9),
    ]);
    expect(out.map((l) => l.index)).toEqual([0, 1]);
    expect(out.map((l) => l.text)).toEqual(["窗外的城市慢慢睡了", "我從來沒想過會離開"]);
  });

  it("giữ bản gốc và thêm bản giản thể", () => {
    const [line] = normalizeLyricLines([L("我從來沒想過會離開", 0)]);
    expect(line.text).toBe("我從來沒想過會離開");
    expect(line.simplified).toBe("我从来没想过会离开");
    expect(line.hasHan).toBe(true);
  });

  it("giữ dòng không có chữ Hán với hasHan=false", () => {
    const [line] = normalizeLyricLines([L("yeah-eh-eh", 0)]);
    expect(line.hasHan).toBe(false);
  });

  it("không nhầm lời tiếng Trung chứa chữ 曲/词 với credit", () => {
    const out = normalizeLyricLines([L("这首曲子送给你", 0), L("词穷的夜晚", 5)]);
    expect(out).toHaveLength(2);
  });
});
