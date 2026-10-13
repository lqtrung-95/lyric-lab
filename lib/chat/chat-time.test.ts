import { describe, expect, it } from "vitest";
import { formatChatTime } from "./chat-time";

const now = new Date(2026, 9, 14, 15, 30).getTime(); // 14/10/2026 15:30 (giờ máy)
const at = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).toISOString();

describe("formatChatTime", () => {
  it("dưới 1 phút và dưới 1 giờ", () => {
    expect(formatChatTime(new Date(now - 20_000).toISOString(), now)).toBe("vừa xong");
    expect(formatChatTime(new Date(now - 5 * 60_000).toISOString(), now)).toBe("5 phút trước");
  });
  it("trong hôm nay, hôm qua và ngày khác", () => {
    expect(formatChatTime(at(14, 9, 5), now)).toBe("09:05");
    expect(formatChatTime(at(13, 23, 40), now)).toBe("Hôm qua 23:40");
    expect(formatChatTime(at(2, 8, 0), now)).toBe("02/10 08:00");
  });
});
