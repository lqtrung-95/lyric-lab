import { describe, expect, it } from "vitest";
import { toAnalysisErrorCode } from "./analysis-error-codes";
import { AnalysisFailedError } from "./analyze-lyrics";
import { NoLyricsError } from "@/lib/lyrics/lyrics-types";

describe("toAnalysisErrorCode", () => {
  it("ánh xạ lỗi pipeline sang mã", () => {
    expect(toAnalysisErrorCode(new NoLyricsError([]))).toBe("no_lyrics");
    expect(toAnalysisErrorCode(new AnalysisFailedError([]))).toBe("analysis_failed");
    expect(toAnalysisErrorCode(new Error("x"))).toBe("server_error");
    expect(toAnalysisErrorCode("chuỗi")).toBe("server_error");
  });
});
