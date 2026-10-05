import { describe, expect, it } from "vitest";
import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { buildRoomQuestions, type RoomSongInput } from "./build-room-questions";

const WORDS = ["远方", "月亮", "天空", "星光", "城市", "海洋", "梦想", "时间", "朋友", "微笑", "回忆", "故事", "夜晚", "风雨"];

function makeSong(overrides: { dropLines?: boolean } = {}): RoomSongInput {
  const lines: AnalyzedLine[] = WORDS.map((w, i) => ({
    index: i, text: `我看见${w}在眼前`, start: i * 5, end: i * 5 + 4, pinyin: `wǒ kànjiàn ${w}py zài yǎnqián`,
    translation: `dịch dòng ${i}`, tokens: [],
  }));
  const vocab: PreviewItem[] = WORDS.map((w, i) => ({
    id: `vocab:${i}`, type: "vocab", term: w, reading: `${w}py`, sinoViet: `hv${i}`, level: 3,
    meaningInContext: `nghĩa ${w}`, occurrences: [{ lineIndex: i, start: i * 5 }], priority: WORDS.length - i,
  }));
  return { videoId: "abcdefghijk", lines: overrides.dropLines ? lines.slice(0, 3) : lines, items: vocab };
}

describe("buildRoomQuestions", () => {
  it("dựng đủ số câu, mỗi câu 4 đáp án gồm đáp án đúng ở đúng chỉ số", () => {
    const set = buildRoomQuestions(makeSong(), 7, 10)!;
    expect(set.questions).toHaveLength(10);
    expect(set.correctIndexes).toHaveLength(10);
    set.questions.forEach((q, i) => {
      expect(q.choices).toHaveLength(4);
      expect(q.choices[set.correctIndexes[i]].term).toBe(set.correctTerms[i]);
      expect(new Set(q.choices.map((c) => c.term)).size).toBe(4);
    });
  });

  it("ô trống đúng chỗ: before + đáp án + after khớp dòng lời gốc, đáp án không còn trong phần hiển thị", () => {
    const song = makeSong();
    const set = buildRoomQuestions(song, 3, 10)!;
    set.questions.forEach((q, i) => {
      const line = song.lines.find((l) => l.index === q.lineIndex)!;
      expect(q.before + set.correctTerms[i] + q.after).toBe(line.text);
      expect(q.before.includes(set.correctTerms[i])).toBe(false);
      expect(q.after.includes(set.correctTerms[i])).toBe(false);
    });
  });

  it("không lộ đáp án trong dữ liệu công khai: pinyin trước/sau bỏ cách đọc đáp án, không có chỉ số đáp án", () => {
    const set = buildRoomQuestions(makeSong(), 11, 10)!;
    set.questions.forEach((q, i) => {
      const reading = `${set.correctTerms[i]}py`;
      expect(`${q.pinyinBefore} ${q.pinyinAfter}`).not.toContain(reading);
      expect(q.pinyinBefore).toBe("wǒ kànjiàn");
      expect(q.pinyinAfter).toBe("zài yǎnqián");
      expect(Object.keys(q)).not.toContain("correctIndex");
    });
  });

  it("cùng seed ra cùng bộ câu, khác seed ra bộ khác (thứ tự)", () => {
    const a = buildRoomQuestions(makeSong(), 42, 10)!;
    const b = buildRoomQuestions(makeSong(), 42, 10)!;
    const c = buildRoomQuestions(makeSong(), 43, 10)!;
    expect(b).toEqual(a);
    expect(c.questions.map((q) => q.lineIndex)).not.toEqual(a.questions.map((q) => q.lineIndex));
  });

  it("mỗi dòng và mỗi từ chỉ ra một lần", () => {
    const set = buildRoomQuestions(makeSong(), 5, 10)!;
    expect(new Set(set.questions.map((q) => q.lineIndex)).size).toBe(10);
    expect(new Set(set.correctTerms).size).toBe(10);
  });

  it("bài không đủ dữ liệu thì trả null", () => {
    expect(buildRoomQuestions(makeSong({ dropLines: true }), 1, 10)).toBeNull();
    expect(buildRoomQuestions({ ...makeSong(), items: [] }, 1, 10)).toBeNull();
  });

  it("bỏ dòng mà từ xuất hiện hai lần (phần còn lại làm lộ đáp án) và dòng quá ngắn", () => {
    const song = makeSong();
    song.lines[0] = { ...song.lines[0], text: "远方远方" }; // từ lặp, không đục lỗ được
    song.lines[1] = { ...song.lines[1], text: "月亮" }; // quá ngắn
    const set = buildRoomQuestions(song, 2, 10)!;
    expect(set.questions.map((q) => q.lineIndex)).not.toContain(0);
    expect(set.questions.map((q) => q.lineIndex)).not.toContain(1);
  });

  it("đoạn nghe lấy từ mốc dòng, kẹp trong 2..12 giây", () => {
    const song = makeSong();
    song.lines[2] = { ...song.lines[2], start: 10, end: 10.5 }; // ngắn hơn 2 giây
    song.lines[3] = { ...song.lines[3], start: 20, end: 60 }; // dài hơn 12 giây
    const set = buildRoomQuestions(song, 9, WORDS.length)!; // lấy hết để chắc chắn có cả hai dòng đang kiểm tra
    for (const q of set.questions) {
      const length = q.clipEnd - q.clipStart;
      expect(length).toBeGreaterThanOrEqual(2);
      expect(length).toBeLessThanOrEqual(12);
    }
    expect(set.questions.find((q) => q.lineIndex === 2)).toMatchObject({ clipStart: 10, clipEnd: 12 });
    expect(set.questions.find((q) => q.lineIndex === 3)).toMatchObject({ clipStart: 20, clipEnd: 32 });
  });

  it("ghi chú ngữ pháp chỉ hiện khi không làm lộ đáp án", () => {
    const song = makeSong();
    song.items.push(
      { id: "grammar:0", type: "grammar", term: "我看见……", level: 2, meaningInContext: "Thấy một điều gì đó", occurrences: [{ lineIndex: 4, start: 20 }], priority: 1 },
      { id: "grammar:1", type: "grammar", term: "在……前", level: 2, meaningInContext: `Dùng với ${WORDS[5]} để chỉ vị trí`, occurrences: [{ lineIndex: 5, start: 25 }], priority: 1 },
    );
    const set = buildRoomQuestions(song, 8, WORDS.length)!;
    const q4 = set.questions.find((q) => q.lineIndex === 4)!;
    const q5 = set.questions.find((q) => q.lineIndex === 5)!;
    expect(q4.grammarNote).toEqual({ pattern: "我看见……", explanation: "Thấy một điều gì đó" });
    expect(q5.grammarNote).toBeNull(); // lời giải thích chứa từ đáp án
  });
});
