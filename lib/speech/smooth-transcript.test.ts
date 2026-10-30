import { describe, expect, it } from "vitest";
import { smoothTranscript } from "./smooth-transcript";

describe("smoothTranscript", () => {
  it("nối các mẩu bị chấm ở chỗ ngập ngừng bằng dấu phẩy, giữ dấu kết thúc", () => {
    expect(smoothTranscript("没有啊。 我这几年。 他已经长期连续。 我害怕。")).toBe("没有啊，我这几年，他已经长期连续，我害怕。");
  });
  it("bỏ mẩu chỉ có tiếng đệm", () => {
    expect(smoothTranscript("嗯。 我想去。 呃。 公园。")).toBe("我想去，公园。");
    expect(smoothTranscript("啊。你好。")).toBe("你好。");
  });
  it("giữ ？ và ！ ở giữa vì là ý người nói", () => {
    expect(smoothTranscript("你好吗？我很好。")).toBe("你好吗？我很好。");
  });
  it("một câu nguyên vẹn không đổi; không có dấu thì giữ nguyên", () => {
    expect(smoothTranscript("你好。")).toBe("你好。");
    expect(smoothTranscript("我想喝水")).toBe("我想喝水");
  });
  it("rỗng hoặc chỉ tiếng đệm", () => {
    expect(smoothTranscript("")).toBe("");
    expect(smoothTranscript("嗯。")).toBe("嗯");
  });
});
