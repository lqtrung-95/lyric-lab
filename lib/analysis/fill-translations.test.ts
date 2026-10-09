import { describe, expect, it, vi } from "vitest";
import { fillMissingTranslations } from "./fill-translations";

const line = (index: number, translation?: string) => ({ index, text: `句${index}`, translation });
const reply = (idx: number[]) => JSON.stringify({ translations: idx.map((i) => ({ lineIndex: i, vi: `dịch ${i}` })) });

describe("fillMissingTranslations", () => {
  it("chỉ hỏi và điền các dòng còn thiếu, giữ nguyên dòng đã có", async () => {
    const chat = vi.fn().mockResolvedValue(reply([1, 2]));
    const out = await fillMissingTranslations([line(0, "có sẵn"), line(1), line(2)], chat, ["m1"]);
    expect(out.map((l) => l.translation)).toEqual(["có sẵn", "dịch 1", "dịch 2"]);
    expect(chat.mock.calls[0][0].user).not.toContain("句0");
  });
  it("không gọi LLM khi đã đủ bản dịch", async () => {
    const chat = vi.fn();
    await fillMissingTranslations([line(0, "a")], chat, ["m1"]);
    expect(chat).not.toHaveBeenCalled();
  });
  it("model đầu lỗi hoặc dịch thiếu thì model sau bù đúng phần thiếu; chỉ số lạ bị bỏ qua", async () => {
    const chat = vi.fn()
      .mockResolvedValueOnce(reply([1, 99]))   // thiếu dòng 2, kèm chỉ số 99 không được hỏi
      .mockResolvedValueOnce(reply([2]));
    const out = await fillMissingTranslations([line(1), line(2)], chat, ["m1", "m2"]);
    expect(out.map((l) => l.translation)).toEqual(["dịch 1", "dịch 2"]);
    expect(chat.mock.calls[1][0].user).not.toContain("句1");
  });
  it("mọi model lỗi thì để trống, không ném lỗi", async () => {
    const chat = vi.fn().mockRejectedValue(new Error("hết hạn mức"));
    const out = await fillMissingTranslations([line(1)], chat, ["m1", "m2"]);
    expect(out[0].translation).toBeUndefined();
  });
  it("chia đoạn 30 dòng để bài dài không vượt giới hạn", async () => {
    const chat = vi.fn().mockImplementation(async ({ user }: { user: string }) => reply([...user.matchAll(/^(\d+)\t/gm)].map((m) => Number(m[1]))));
    const out = await fillMissingTranslations(Array.from({ length: 65 }, (_, i) => line(i)), chat, ["m1"]);
    expect(chat).toHaveBeenCalledTimes(3);
    expect(out.every((l) => l.translation)).toBe(true);
  });
  it("giới hạn số đoạn chạy cùng lúc nhưng vẫn dịch đủ", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const chat = vi.fn().mockImplementation(async ({ user }: { user: string }) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return reply([...user.matchAll(/^(\d+)\t/gm)].map((m) => Number(m[1])));
    });
    const out = await fillMissingTranslations(Array.from({ length: 150 }, (_, i) => line(i)), chat, ["m1"], { concurrency: 2 }); // 5 đoạn
    expect(chat).toHaveBeenCalledTimes(5);
    expect(maxInFlight).toBe(2);
    expect(out.every((l) => l.translation)).toBe(true);
  });
  it("không giới hạn thì chạy tất cả đoạn cùng lúc như trước", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const chat = vi.fn().mockImplementation(async ({ user }: { user: string }) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return reply([...user.matchAll(/^(\d+)\t/gm)].map((m) => Number(m[1])));
    });
    await fillMissingTranslations(Array.from({ length: 90 }, (_, i) => line(i)), chat, ["m1"]);
    expect(maxInFlight).toBe(3);
  });
  it("quá hạn chót thì không bắt đầu đoạn mới, các dòng chưa dịch để trống", async () => {
    const chat = vi.fn().mockImplementation(async ({ user }: { user: string }) => reply([...user.matchAll(/^(\d+)\t/gm)].map((m) => Number(m[1]))));
    const out = await fillMissingTranslations(Array.from({ length: 65 }, (_, i) => line(i)), chat, ["m1"], { concurrency: 1, deadline: Date.now() - 1 });
    expect(chat).not.toHaveBeenCalled();
    expect(out.every((l) => !l.translation)).toBe(true);
  });
});
