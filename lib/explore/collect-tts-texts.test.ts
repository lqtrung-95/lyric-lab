import { describe, expect, it } from "vitest";
import { collectExploreTtsTexts } from "./collect-tts-texts";
import { commandText } from "./quest-commands";
import { SCENES } from "./scenes";

describe("collectExploreTtsTexts", () => {
  it("gồm từ vựng, câu hay dùng và hội thoại mẫu của mọi cảnh; không trùng; đều hợp lệ để đọc", () => {
    const texts = collectExploreTtsTexts();
    expect(new Set(texts).size).toBe(texts.length);
    for (const s of Object.values(SCENES)) {
      for (const o of s.objects) expect(texts, o.term).toContain(o.term);
      for (const p of s.phrases ?? []) expect(texts, p.zh).toContain(p.zh);
    }
    // Lệnh của NPC trong nhiệm vụ nghe lệnh cũng có giọng sẵn.
    for (const s of Object.values(SCENES)) for (const o of s.objects) expect(texts, o.term).toContain(commandText(o.term, !!o.portable));
    expect(texts.length).toBeGreaterThan(500);
    expect(texts.every((t) => t.length <= 40)).toBe(true);
  });
});
