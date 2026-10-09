import { describe, expect, it } from "vitest";
import { buildRetranslationPrompt, retranslateLine } from "./retranslate-line";

const lines = [
  { text: "大家好", translation: "Chào mọi người" },
  { text: "今天聊聊学习", translation: "Hôm nay nói chuyện học" },
  { text: "这很难", translation: "Cái này rất xấu" }, // dịch sai
  { text: "但是值得", translation: "Nhưng đáng giá" },
];

describe("buildRetranslationPrompt", () => {
  it("có ngữ cảnh trước/sau, dòng cần dịch lại và bản dịch cũ bị báo sai", () => {
    const p = buildRetranslationPrompt(lines, 2);
    expect(p).toContain("0\t大家好\tChào mọi người");
    expect(p).toContain("3\t但是值得\tNhưng đáng giá");
    expect(p).toContain("chỉ số 2: 这很难");
    expect(p).toContain("Cái này rất xấu");
  });
});

describe("retranslateLine", () => {
  it("trả bản dịch mới của đúng dòng", async () => {
    const chat = async () => JSON.stringify({ vi: " Cái này rất khó " });
    expect(await retranslateLine(chat, ["m"], lines, 2)).toBe("Cái này rất khó");
  });

  it("model đầu lỗi hoặc cho lại bản cũ thì thử model sau", async () => {
    const answers = [() => { throw new Error("429"); }, () => JSON.stringify({ vi: "Cái này rất xấu" }), () => JSON.stringify({ vi: "Việc này khó" })];
    let i = 0;
    const chat = async () => answers[i++]();
    expect(await retranslateLine(chat, ["a", "b", "c"], lines, 2)).toBe("Việc này khó");
  });

  it("mọi model không cải thiện được thì trả null; chỉ số sai thì null", async () => {
    const same = async () => JSON.stringify({ vi: "Cái này rất xấu" });
    expect(await retranslateLine(same, ["a"], lines, 2)).toBeNull();
    expect(await retranslateLine(same, ["a"], lines, 99)).toBeNull();
    const bad = async () => "không phải JSON";
    expect(await retranslateLine(bad, ["a"], lines, 2)).toBeNull();
  });
});
