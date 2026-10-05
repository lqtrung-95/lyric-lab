import { describe, expect, it } from "vitest";
import { isCreditLine } from "./credit-line";

describe("isCreditLine", () => {
  it("nhận ra các dòng ghi công thật của bài Z4QudKOfIRU", () => {
    for (const line of [
      "中文填词 : Yizy尹姿/李孟言/代诗琪", "配唱编写 : 郑羽淇", "音频编辑 : 徐天鸿@Studio21A", "混音母带 : 周天澈@Studio21A",
      "企划 : 李孟言/钱娇", "企划营销 : 银河方舟StarNation", "OP : LIT Entertainment",
    ]) expect(isCreditLine(line), line).toBe(true);
  });
  it("nhận ra các kiểu ghi công khác trong thư viện (có tiếng Anh, dấu hai chấm toàn góc, gạch chéo)", () => {
    for (const line of [
      "编曲 Arrangement：陈某", "吉他 Guitar : 张某", "和声 Backing Vocal：李某", "监制 Supervisor：王某", "OP/SP : Some Music Publishing",
      "混音/母带：周某", "封面设计：赵某", "版权代理(OP)：某公司", "词曲\\唱：某人", "-江辰 -江辰 演唱：江辰", "敬告：未经许可不得转载", "Lyrics: Someone", "作词 周杰伦",
    ]) expect(isCreditLine(line), line).toBe(true);
  });
  it("nhãn người hát là lời hát, không phải ghi công", () => {
    for (const line of ["汪：我想你", "合：我们一起走", "Yumi: 我爱你", "BY2：别走", "Miko：回来吧"]) expect(isCreditLine(line), line).toBe(false);
  });
  it("lời hát thường (kể cả có dấu hai chấm giữa câu hay chữ trùng từ khóa) không bị coi là ghi công", () => {
    for (const line of [
      "Baby you are my light", "你点亮我的爱", "他说：我爱你", "我愿意为你设计一个未来", "命中注定的安排", "第一次见面你的开场白",
      "制作一场梦", "我编织着你的名字", "", "   ",
    ]) expect(isCreditLine(line), line).toBe(false);
  });
});
