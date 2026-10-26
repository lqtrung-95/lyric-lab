import { describe, expect, it } from "vitest";
import { wordMeaningNoteSchema } from "./word-note-schema";

describe("wordMeaningNoteSchema", () => {
  it("nhận bản thuần tiếng Việt, từ chối chữ Hán và danh sách nghĩa rỗng", () => {
    expect(wordMeaningNoteSchema.safeParse({ gloss: "yêu", senses: [{ meaning: "yêu thương" }] }).success).toBe(true);
    expect(wordMeaningNoteSchema.safeParse({ gloss: "yêu", senses: [{ meaning: "爱情" }] }).success).toBe(false);
    expect(wordMeaningNoteSchema.safeParse({ gloss: "yêu", senses: [] }).success).toBe(false);
  });
});
