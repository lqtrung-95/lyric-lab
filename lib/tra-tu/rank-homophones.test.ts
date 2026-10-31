import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { rankSoundAlikes } from "./rank-homophones";

const row = (simplified: string, pinyin: string, hsk: number | null, freq: number | null = null): DictWordRow => ({ simplified, traditional: simplified, pinyin, meanings: [`m-${simplified}`], hsk_level: hsk, frequency: freq } as DictWordRow);

describe("rankSoundAlikes", () => {
  const rows = [row("妈", "mā", 1), row("抹", "mā", 6), row("马", "mǎ", 1), row("骂", "mà", 3), row("麻", "má", 4), row("Ma", "Mǎ", null), row("妈妈", "māma", 1), row("吗", "ma", 1)];
  it("tách cùng cách đọc và khác thanh, bỏ chính nó, tên riêng và từ khác độ dài", () => {
    const r = rankSoundAlikes(rows, "妈", "mā", 8);
    expect(r.same.map((w) => w.simplified)).toEqual(["抹"]);
    expect(r.otherTone.map((w) => w.simplified)).toEqual(["马", "吗", "骂", "麻"]);
  });
  it("giới hạn số từ mỗi nhóm", () => {
    expect(rankSoundAlikes(rows, "妈", "mā", 2).otherTone).toHaveLength(2);
  });
});
