import { describe, expect, it } from "vitest";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";
import { DEPLOY_DEFAULT_MODEL } from "@/lib/analysis/deploy-chat";
import { nameSummaryModels } from "./name-summary-models";

describe("nameSummaryModels", () => {
  it("có khóa Deploy thì Deploy đứng đầu, rồi chuỗi giải nghĩa chung", () => {
    expect(nameSummaryModels({ DEPLOY_API_KEY: "k" })).toEqual([`deploy:${DEPLOY_DEFAULT_MODEL}`, ...EXPLAIN_MODELS]);
    expect(nameSummaryModels({ DEPLOY_API_KEY: "k", DEPLOY_MODEL: "x/y" })[0]).toBe("deploy:x/y");
  });
  it("thiếu khóa thì dùng chuỗi chung", () => {
    expect(nameSummaryModels({})).toEqual(EXPLAIN_MODELS);
  });
});
