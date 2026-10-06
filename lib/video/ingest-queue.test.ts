import { describe, expect, it } from "vitest";
import { MAX_BLOCKED_IN_ROW, RETRY_WAITS_MS, SKIP_LABEL, summarizeQueue, type QueueStatus } from "./ingest-queue";

const s = (status: QueueStatus) => ({ status });

describe("summarizeQueue", () => {
  it("đếm theo trạng thái, đang chạy tính là còn chờ", () => {
    expect(summarizeQueue([s({ state: "done", lineCount: 10, translatedLineCount: 10 }), s({ state: "skipped", reason: "exists" }), s({ state: "failed", blocked: true }), s({ state: "waiting" }), s({ state: "running" })]))
      .toEqual({ total: 5, done: 1, skipped: 1, failed: 1, waiting: 2 });
  });
  it("hàng đợi rỗng", () => {
    expect(summarizeQueue([])).toEqual({ total: 0, done: 0, skipped: 0, failed: 0, waiting: 0 });
  });
});

describe("hằng số", () => {
  it("có nhãn cho mọi lý do bỏ qua và ngưỡng thử lại hợp lý", () => {
    expect(Object.keys(SKIP_LABEL).sort()).toEqual(["exists", "no_human_zh_captions", "no_lines", "not_embeddable"]);
    expect(MAX_BLOCKED_IN_ROW).toBeGreaterThanOrEqual(1);
    expect(RETRY_WAITS_MS.length).toBeGreaterThanOrEqual(1);
  });
});
