import { describe, expect, it } from "vitest";
import { renderReminderEmail, renderWeeklyEmail, renderWelcomeEmail } from "./email-templates";

const base = { siteUrl: "https://example.test", unsubscribeUrl: "https://example.test/unsubscribe/abc" };

describe("mẫu email", () => {
  it("chào mừng có link bắt đầu và link hủy nhận", () => {
    const m = renderWelcomeEmail(base);
    expect(m.subject).toContain("SongHanzi");
    expect(m.html).toContain("https://example.test/app");
    expect(m.html).toContain(base.unsubscribeUrl);
    expect(m.text).toContain(base.unsubscribeUrl);
  });
  it("tổng kết tuần: có số liệu, trỏ tới ôn tập khi còn thẻ đến hạn", () => {
    const m = renderWeeklyEmail(base, { activeDays: 4, reviewed: 37, songs: 3, streak: 4, dueCards: 12 });
    expect(m.subject).toBe("Tuần qua: bạn học 4 ngày");
    expect(m.html).toContain("4/7");
    expect(m.html).toContain("37");
    expect(m.html).toContain("https://example.test/review");
  });
  it("tổng kết tuần: hết thẻ đến hạn thì trỏ về trang chủ", () => {
    expect(renderWeeklyEmail(base, { activeDays: 1, reviewed: 0, songs: 1, streak: 1, dueCards: 0 }).html).toContain("https://example.test/app");
  });
  it("nhắc quay lại nêu số ngày và thẻ đang chờ", () => {
    const m = renderReminderEmail(base, { inactiveDays: 5, dueCards: 8, streakLost: true });
    expect(m.subject).toContain("5 ngày");
    expect(m.html).toContain("Chuỗi ngày học đã đứt");
  });
  it("không chèn HTML thô từ dữ liệu", () => {
    const m = renderWelcomeEmail({ siteUrl: "https://x.test", unsubscribeUrl: 'https://x.test/u?"><script>' });
    expect(m.html).not.toContain("<script>");
  });
});
