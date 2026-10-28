import { describe, expect, it } from "vitest";
import { melodyLength, melodyNote, noteFrequency } from "./melody";

describe("melody", () => {
  it("lặp vòng và chịu chỉ số âm", () => {
    expect(melodyNote(melodyLength)).toBe(melodyNote(0));
    expect(melodyNote(-1)).toBe(melodyNote(melodyLength - 1));
  });
  it("tần số: C4 = 261,63 Hz, lên một quãng tám thì gấp đôi", () => {
    expect(noteFrequency(0)).toBeCloseTo(261.63, 1);
    expect(noteFrequency(12)).toBeCloseTo(523.26, 1);
  });
});
