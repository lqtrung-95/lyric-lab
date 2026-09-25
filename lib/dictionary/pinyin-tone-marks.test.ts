import { describe, expect, it } from "vitest";
import { numberedPinyinToToneMarks as f } from "./pinyin-tone-marks";

describe("numberedPinyinToToneMarks", () => {
  it.each([
    ["cheng2 shi4", "chéng shì"],
    ["xi3 huan5", "xǐ huan"],
    ["hui2 yi4", "huí yì"],
    ["lu:e4", "lüè"],
    ["nu:3", "nǚ"],
    ["gou3", "gǒu"],
    ["dui4", "duì"],
    ["liu2", "liú"],
    ["Bei3 jing1", "Běi jīng"],
    ["er2", "ér"],
    ["r5", "r"],
    ["A Q", "A Q"],
    [",", ","],
  ])("%s → %s", (input, expected) => {
    expect(f(input)).toBe(expected);
  });
});
