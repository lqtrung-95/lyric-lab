import { describe, expect, it } from "vitest";
import { shouldAutoHide, type OpenReport } from "./video-report-policy";
import { VIDEO_REPORT_HIDE_THRESHOLD } from "./video-report-reasons";

const reports = (n: number, reason: OpenReport["reason"] = "inappropriate"): OpenReport[] => Array.from({ length: n }, (_, i) => ({ userId: `u${i}`, reason }));
const base = { status: "listed" as const, addedByUser: true };

describe("shouldAutoHide", () => {
  it("đủ số người khác nhau báo video do người dùng thêm thì tự ẩn", () => {
    expect(shouldAutoHide({ ...base, openReports: reports(VIDEO_REPORT_HIDE_THRESHOLD) })).toBe(true);
    expect(shouldAutoHide({ ...base, openReports: reports(VIDEO_REPORT_HIDE_THRESHOLD - 1) })).toBe(false);
  });
  it("một người báo nhiều lý do vẫn chỉ tính một người", () => {
    const one: OpenReport[] = [{ userId: "u", reason: "inappropriate" }, { userId: "u", reason: "not_chinese" }, { userId: "u", reason: "wrong_subtitles" }];
    expect(shouldAutoHide({ ...base, openReports: one })).toBe(false);
  });
  it("báo bản dịch sai không đủ để ẩn cả video", () => {
    expect(shouldAutoHide({ ...base, openReports: reports(10, "wrong_translation") })).toBe(false);
  });
  it("các lý do khác nhau của những người khác nhau cộng lại", () => {
    const mixed: OpenReport[] = [{ userId: "a", reason: "not_chinese" }, { userId: "b", reason: "wrong_subtitles" }, { userId: "c", reason: "inappropriate" }];
    expect(shouldAutoHide({ ...base, openReports: mixed })).toBe(true);
  });
  it("không tự ẩn video admin tuyển chọn, video đã ẩn hoặc đang nháp", () => {
    const enough = reports(5);
    expect(shouldAutoHide({ openReports: enough, status: "listed", addedByUser: false })).toBe(false);
    expect(shouldAutoHide({ openReports: enough, status: "hidden", addedByUser: true })).toBe(false);
    expect(shouldAutoHide({ openReports: enough, status: "draft", addedByUser: true })).toBe(false);
  });
  it("báo cáo không rõ người báo (tài khoản đã xóa) không tính", () => {
    const anonymous: OpenReport[] = Array.from({ length: 5 }, () => ({ userId: null, reason: "inappropriate" as const }));
    expect(shouldAutoHide({ ...base, openReports: anonymous })).toBe(false);
  });
});
