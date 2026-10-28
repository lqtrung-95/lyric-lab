import { describe, expect, it } from "vitest";
import { collectExploreTtsTexts } from "@/lib/explore/collect-tts-texts";
import { splitForTts } from "@/lib/speech/split-for-tts";
import { normalizeTtsText } from "@/lib/tts/tts-text";
import { SCENES } from "@/lib/explore/scenes";
import { ALL_DIALOGUES, findDialogue } from "./dialogue-catalog";

describe("kho hội thoại", () => {
  it("id không trùng, có đủ bài tự viết và bài từ các cảnh", () => {
    const ids = ALL_DIALOGUES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ALL_DIALOGUES.filter((d) => d.topic !== "scene").length).toBeGreaterThanOrEqual(10);
    expect(ALL_DIALOGUES.filter((d) => d.sceneId).length).toBeGreaterThanOrEqual(40);
    expect(findDialogue("weekend-plans")?.title.vi).toBeTruthy();
  });

  it("mỗi cảnh Khám phá có một bài dài riêng, dùng ít nhất 4 từ của chính cảnh đó", () => {
    for (const scene of Object.values(SCENES)) {
      const d = findDialogue(`scene-${scene.id}`);
      expect(d, scene.id).toBeDefined();
      const text = d!.lines.map((l) => l.zh).join("");
      const used = scene.objects.filter((o) => text.includes(o.term)).length;
      expect(used, `${scene.id}: dùng ${used} từ của cảnh`).toBeGreaterThanOrEqual(4);
    }
  });

  it("mỗi bài: người nói hợp lệ, hai người cùng nói, có chữ Hán và nghĩa Việt, bài tự viết ≥ 8 câu", () => {
    for (const d of ALL_DIALOGUES) {
      expect(new Set(d.lines.map((l) => l.who)).size, d.id).toBe(2);
      for (const l of d.lines) {
        expect([0, 1], d.id).toContain(l.who);
        expect(l.zh, d.id).toMatch(/\p{Script=Han}/u);
        expect(l.vi.length, d.id).toBeGreaterThan(0);
      }
      expect(d.lines.length, d.id).toBeGreaterThanOrEqual(8);
    }
  });

  it("mọi câu đều nằm trong danh sách giọng cần tổng hợp sẵn", () => {
    const texts = new Set(collectExploreTtsTexts());
    for (const d of ALL_DIALOGUES) for (const l of d.lines) for (const part of splitForTts(l.zh)) expect(texts, `${d.id}: ${part}`).toContain(normalizeTtsText(part));
  });
});
