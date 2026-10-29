import { describe, expect, it } from "vitest";
import { EMPTY_TOWER_RECORD, mergeTowerRecord, parseTowerRecord } from "./tower-record";

describe("kỷ lục thủ thành", () => {
  it("đọc dữ liệu hỏng thì về rỗng", () => {
    expect(parseTowerRecord(null)).toEqual(EMPTY_TOWER_RECORD);
    expect(parseTowerRecord({ bestScore: -5, bestWave: "x" })).toEqual(EMPTY_TOWER_RECORD);
    expect(parseTowerRecord({ bestScore: 120.7, bestWave: 3 })).toEqual({ bestScore: 120, bestWave: 3 });
  });
  it("chỉ tăng", () => {
    expect(mergeTowerRecord({ bestScore: 500, bestWave: 4 }, 300, 5).record).toEqual({ bestScore: 500, bestWave: 5 });
    expect(mergeTowerRecord({ bestScore: 500, bestWave: 4 }, 900, 2).record).toEqual({ bestScore: 900, bestWave: 4 });
  });
});
