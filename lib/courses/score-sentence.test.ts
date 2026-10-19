import { describe, expect, it } from "vitest";
import { pickDiverse, scoreSentence } from "./score-sentence";

const levels: Record<string, number> = { 我: 1, 喜欢: 1, 苹果: 1, 吃: 1, 很: 1, 好: 1, 经济: 5, 全球化: 6, 学习: 1 };
const ctx = (term: string, termLevel = 1) => ({ term, termLevel, levelOf: (w: string) => levels[w] });
const cand = (text: string, tokens: string[], translation: string | null = "Nghĩa tiếng Việt.") => ({ text, translation, tokens: tokens.map((t) => ({ text: t })) });

describe("scoreSentence", () => {
  it("câu ngắn vừa phải, từ dễ, có dịch thì điểm cao", () => {
    expect(scoreSentence(cand("我喜欢吃苹果。", ["我", "喜欢", "吃", "苹果", "。"]), ctx("苹果"))).toBeGreaterThanOrEqual(90);
  });
  it("loại: không có dịch, quá ngắn, quá dài, từ đích không là một token, có từ chặn", () => {
    expect(scoreSentence(cand("我喜欢苹果", ["我", "喜欢", "苹果"], null), ctx("苹果"))).toBeNull();
    expect(scoreSentence(cand("好吃", ["好", "吃"]), ctx("吃"))).toBeNull();
    expect(scoreSentence(cand("我喜欢吃苹果我喜欢吃苹果我喜欢吃苹果", ["我", "喜欢", "吃", "苹果"]), ctx("苹果"))).toBeNull();
    expect(scoreSentence(cand("我喜欢苹果。", ["我", "喜", "欢", "苹", "果"]), ctx("苹果"))).toBeNull();
    expect(scoreSentence(cand("他妈的我很好", ["他妈的", "我", "很", "好"]), ctx("好"))).toBeNull();
  });
  it("loại câu lẫn chữ Latin và câu chỉ là một cụm lặp lại", () => {
    expect(scoreSentence(cand("textbooks早上我还会吃鸡蛋", ["textbooks", "早上", "我", "还会", "吃", "鸡蛋"]), ctx("吃"))).toBeNull();
    expect(scoreSentence(cand("我是老师我是老师", ["我", "是", "老师", "我", "是", "老师"]), ctx("老师"))).toBeNull();
    expect(scoreSentence(cand("我是老师，你呢？", ["我", "是", "老师", "，", "你", "呢", "？"]), ctx("老师"))).not.toBeNull();
  });
  it("từ khó hơn cấp đích làm giảm điểm; từ ngoài danh sách bị phạt nhẹ hơn", () => {
    const easy = scoreSentence(cand("我很喜欢学习。", ["我", "很", "喜欢", "学习", "。"]), ctx("学习"))!;
    const hard = scoreSentence(cand("全球化经济学习好", ["全球化", "经济", "学习", "好"]), ctx("学习"))!;
    const unknown = scoreSentence(cand("小明很喜欢学习。", ["小明", "很", "喜欢", "学习", "。"]), ctx("学习"))!;
    expect(hard).toBeLessThan(unknown);
    expect(unknown).toBeLessThan(easy);
  });
  it("độ dài lý tưởng cho điểm cao hơn câu rất ngắn hoặc rất dài", () => {
    const ideal = scoreSentence(cand("我很喜欢吃苹果。", ["我", "很", "喜欢", "吃", "苹果", "。"]), ctx("苹果"))!;
    const short = scoreSentence(cand("我吃苹果。", ["我", "吃", "苹果", "。"]), ctx("苹果"))!;
    expect(ideal).toBeGreaterThan(short);
  });
});

describe("pickDiverse", () => {
  const l = (videoId: string, lineIdx: number, quality: number) => ({ videoId, lineIdx, quality });
  it("lấy mỗi video một câu tốt nhất trước, rồi mới lấy thêm câu thứ hai của cùng video", () => {
    const out = pickDiverse([l("a", 1, 95), l("a", 2, 94), l("b", 1, 80), l("c", 1, 70)], 3);
    expect(out.map((x) => `${x.videoId}${x.lineIdx}`)).toEqual(["a1", "b1", "c1"]);
    expect(pickDiverse([l("a", 1, 95), l("a", 2, 94)], 3).map((x) => x.lineIdx)).toEqual([1, 2]);
  });
  it("không vượt quá số câu yêu cầu và ổn định khi điểm bằng nhau", () => {
    const lines = [l("b", 1, 90), l("a", 1, 90), l("c", 1, 90)];
    expect(pickDiverse(lines, 2).map((x) => x.videoId)).toEqual(["a", "b"]);
  });
});
