import { describe, expect, it } from "vitest";
import { yeCheAnalysis } from "@/lib/preview/fixtures/ye-che-analysis";
import { simplifyDeep } from "./simplify-analysis";

describe("simplifyDeep", () => {
  it("chuyển phồn thể sang giản thể ở mọi tầng, giữ nguyên chuỗi không có chữ Hán và số", () => {
    const out = simplifyDeep({ text: "玻璃上的霧氣 我臨摹一個你", nested: [{ term: "臨摹" }], vi: "Sương mù trên kính", n: 3, ok: true, none: null });
    expect(out).toEqual({ text: "玻璃上的雾气 我临摹一个你", nested: [{ term: "临摹" }], vi: "Sương mù trên kính", n: 3, ok: true, none: null });
  });

  it("giản thể vào giản thể ra (idempotent): dữ liệu mẫu không đổi", () => {
    expect(simplifyDeep(yeCheAnalysis)).toEqual(yeCheAnalysis);
  });
});
