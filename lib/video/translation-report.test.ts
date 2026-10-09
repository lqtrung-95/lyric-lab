import { describe, expect, it } from "vitest";
import { MAX_AI_RETRANSLATIONS_PER_DAY, MAX_TRANSLATION_REPORTS_PER_USER_PER_DAY, decideReportAction } from "./translation-report";

const base = { alreadyReportedByUser: false, userReportsToday: 0, aiRetranslationsToday: 0, lineAlreadyAi: false };

describe("decideReportAction", () => {
  it("dòng dùng bản dịch có sẵn: nhờ AI dịch lại ngay", () => expect(decideReportAction(base)).toBe("retranslate"));
  it("dòng đã là bản AI: chỉ ghi nhận cho quản trị, không cho AI dịch lại chính nó", () => expect(decideReportAction({ ...base, lineAlreadyAi: true })).toBe("escalate"));
  it("hết trần AI dịch lại trong ngày: chỉ ghi nhận", () => expect(decideReportAction({ ...base, aiRetranslationsToday: MAX_AI_RETRANSLATIONS_PER_DAY })).toBe("escalate"));
  it("cùng người báo lại đúng dòng đó: bỏ qua, ưu tiên hơn mọi giới hạn", () => expect(decideReportAction({ ...base, alreadyReportedByUser: true, userReportsToday: 99 })).toBe("duplicate"));
  it("người này báo quá nhiều trong ngày: từ chối", () => expect(decideReportAction({ ...base, userReportsToday: MAX_TRANSLATION_REPORTS_PER_USER_PER_DAY })).toBe("user_limit"));
});
