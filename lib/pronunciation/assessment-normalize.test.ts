import { describe, expect, it } from "vitest";
import { AssessmentError, normalizeAssessment } from "./assessment-normalize";
import { numericToToneMark, splitSyllable } from "./pinyin-tone-marks";
import { tipForSyllable } from "./syllable-tips";

// Rút gọn từ phản hồi thật của Azure cho câu mẫu "我喜欢听中文歌" (zh-CN): điểm từng âm tiết nằm trong Phonemes.
const word = (Word: string, AccuracyScore: number, ErrorType: string, ph: [string, number][] = []) =>
  ({ Word, AccuracyScore, ErrorType, Phonemes: ph.map(([Phoneme, s]) => ({ Phoneme, AccuracyScore: s })) });
const response = (Words: unknown[], extra = {}) => ({ RecognitionStatus: "Success", NBest: [{ FluencyScore: 100, CompletenessScore: 80, Words, ...extra }] });

describe("normalizeAssessment", () => {
  it("tách điểm từng chữ trong từ nhiều chữ và đổi nhãn sang pinyin có dấu", () => {
    const r = normalizeAssessment(response([word("我", 91, "None", [["wo 3", 76]]), word("喜欢", 94, "None", [["xi 3", 100], ["huan 5", 50]])]));
    expect(r.syllables.map((s) => [s.han, s.pinyin, s.score])).toEqual([["我", "wǒ", 76], ["喜", "xǐ", 100], ["欢", "huan", 50]]);
    expect(r.overall).toBe(75);
    expect(r.completeness).toBe(80);
  });
  it("chữ bị bỏ sót tính 0 điểm và kéo điểm chung xuống", () => {
    const r = normalizeAssessment(response([word("听", 76, "None", [["ting 1", 76]]), word("中文", 0, "Omission")]));
    expect(r.syllables.map((s) => [s.han, s.score, s.error])).toEqual([["听", 76, "none"], ["中", 0, "omission"], ["文", 0, "omission"]]);
    expect(r.overall).toBe(25);
  });
  it("điểm dưới 50 đánh dấu đọc sai; số âm tiết lệch số chữ thì chấm cả cụm", () => {
    const r = normalizeAssessment(response([word("歌", 30, "Mispronunciation", [["ge 1", 30]]), word("花儿", 70, "None", [["huar 1", 70]])]));
    expect(r.syllables[0].error).toBe("mispronunciation");
    expect(r.syllables[1]).toMatchObject({ han: "花儿", score: 70, pinyin: "" });
  });
  it("không nghe thấy giọng hoặc phản hồi lạ thì ném lỗi có mã", () => {
    expect(() => normalizeAssessment({ RecognitionStatus: "NoMatch" })).toThrow(AssessmentError);
    expect(() => normalizeAssessment({ RecognitionStatus: "Success", NBest: [] })).toThrow(AssessmentError);
    try { normalizeAssessment({ RecognitionStatus: "InitialSilenceTimeout" }); } catch (e) { expect((e as AssessmentError).code).toBe("no_speech"); }
  });
});

describe("pinyin-tone-marks", () => {
  it("đặt dấu đúng quy tắc", () => {
    expect(numericToToneMark("hao 3")).toBe("hǎo");
    expect(numericToToneMark("zhong 1")).toBe("zhōng");
    expect(numericToToneMark("liu 2")).toBe("liú");
    expect(numericToToneMark("lou 4")).toBe("lòu");
    expect(numericToToneMark("lv 4")).toBe("lǜ");
    expect(numericToToneMark("ma 5")).toBe("ma");
  });
  it("tách phụ âm đầu và vần", () => {
    expect(splitSyllable("zhong")).toEqual({ initial: "zh", final: "ong" });
    expect(splitSyllable("an")).toEqual({ initial: "", final: "an" });
    expect(splitSyllable("shi")).toEqual({ initial: "sh", final: "i" });
  });
});

describe("tipForSyllable", () => {
  it("ưu tiên mẹo phụ âm đầu, rơi về vần, không có thì null", () => {
    expect(tipForSyllable("pa")?.symbol).toBe("p");
    expect(tipForSyllable("an")?.symbol).toBe("an");
    expect(tipForSyllable("")).toBeNull();
  });
});
