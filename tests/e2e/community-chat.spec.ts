import { expect, test, type Page } from "@playwright/test";

// Chat cộng đồng: API được giả lập (không ghi dữ liệu thật). Kiểm tra hiển thị (huy hiệu Admin, thông báo nổi bật), gửi tin, lỗi dễ hiểu, quyền quản trị, chấm tin mới và banner.
const msg = (id: number, nickname: string, body: string, extra: Record<string, unknown> = {}) => ({ id, nickname, avatarUrl: null, isAdmin: false, kind: "chat", body, createdAt: new Date().toISOString(), ...extra });
const MESSAGES = [
  msg(1, "Mai", "Chào mọi người! Bài nào dễ cho người mới vậy?"),
  msg(2, "Quản trị", "Mình vừa sửa lại lời bài 选择失忆 nhé.", { isAdmin: true, kind: "announcement" }),
  msg(3, "Admin", "Tên mình có chữ Admin nhưng KHÔNG có huy hiệu."),
];

async function setup(page: Page, opts: { admin?: boolean; nickname?: string | null; messages?: ReturnType<typeof msg>[] } = {}) {
  const list = opts.messages ?? MESSAGES;
  await page.route("**/api/admin/whoami", (r) => r.fulfill({ json: { isAdmin: !!opts.admin } }));
  await page.route("**/api/leaderboard/profile", (r) => r.fulfill({ json: { profile: opts.nickname === null ? null : { nickname: opts.nickname ?? "Lan", optedIn: false, avatarUrl: null } } }));
  await page.route("**/api/chat/status", (r) => r.fulfill({ json: { latestId: list.at(-1)?.id ?? 0, announcement: null } }));
  const sent: Record<string, unknown>[] = [];
  const deleted: string[] = [];
  await page.route(/\/api\/chat(\?.*)?$/, (r) => {
    const req = r.request();
    if (req.method() === "POST") {
      const body = req.postDataJSON() as { body: string; announcement?: boolean };
      sent.push(body);
      if (body.body.includes("http")) return r.fulfill({ status: 400, json: { error: "has_link" } });
      return r.fulfill({ json: { message: msg(100 + sent.length, opts.nickname ?? "Lan", body.body, { isAdmin: !!opts.admin, kind: body.announcement ? "announcement" : "chat" }) } });
    }
    const after = new URL(req.url()).searchParams.get("after");
    return r.fulfill({ json: { messages: after ? [] : list, hasMore: false, deletedIds: [] } });
  });
  await page.route(/\/api\/chat\/\d+(\?.*)?$/, (r) => { deleted.push(`${r.request().method()} ${new URL(r.request().url()).pathname}${new URL(r.request().url()).search}`); return r.fulfill({ json: { done: "deleted" } }); });
  await page.setViewportSize({ width: 1280, height: 900 });
  return { sent, deleted };
}

test("hiện tin nhắn: huy hiệu Admin chỉ ở tin của quản trị, thông báo nổi bật, tên 'Admin' tự đặt không có huy hiệu", async ({ page }) => {
  await setup(page);
  await page.goto("/chat");
  const items = page.getByTestId("chat-message");
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).not.toContainText("Admin");
  await expect(items.nth(1)).toContainText("Thông báo");
  await expect(items.nth(1)).toContainText("Admin"); // huy hiệu
  await expect(items.nth(1)).toHaveAttribute("data-kind", "announcement");
  // Tin thứ 3 có biệt danh "Admin" (người thường): chỉ chữ trong tên, không có huy hiệu (huy hiệu có biểu tượng xác thực).
  await expect(items.nth(2).locator("span", { hasText: /^Admin$/ })).toHaveCount(1);
  await expect(items.nth(2).locator("span.bg-primary")).toHaveCount(0);
  await expect(items.nth(1).locator("span.bg-primary")).toHaveCount(1);
});

test("gửi tin: Enter gửi, tin hiện ngay, ô soạn được xóa; link bị chặn với thông báo rõ", async ({ page }) => {
  const { sent } = await setup(page);
  await page.goto("/chat");
  const box = page.getByRole("textbox", { name: "Tin nhắn" });
  await box.fill("Mình mới học HSK 2");
  await box.press("Enter");
  await expect(page.getByText("Mình mới học HSK 2")).toBeVisible();
  await expect(box).toHaveValue("");
  expect(sent[0]).toEqual({ body: "Mình mới học HSK 2", announcement: false });
  await box.fill("xem http://spam.com");
  await page.getByRole("button", { name: "Gửi tin nhắn" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "link hay địa chỉ web" })).toBeVisible();
});

test("chưa có biệt danh: hiện form đặt biệt danh, chưa có ô soạn tin", async ({ page }) => {
  await setup(page, { nickname: null });
  await page.goto("/chat");
  await expect(page.getByText(/Đặt biệt danh để nhắn tin/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Tin nhắn" })).toHaveCount(0);
});

test("người thường không thấy nút xóa, nút chặn hay ô gửi thông báo", async ({ page }) => {
  await setup(page);
  await page.goto("/chat");
  await expect(page.getByTestId("chat-message")).toHaveCount(3);
  await expect(page.getByRole("button", { name: /Xóa tin/ })).toHaveCount(0);
  await expect(page.getByLabel(/Gửi dưới dạng thông báo/)).toHaveCount(0);
});

test("admin xóa tin, xóa và chặn (có xác nhận, tin của admin không có nút chặn) và gửi thông báo", async ({ page }) => {
  const admin = await setup(page, { admin: true });
  await page.goto("/chat");
  await expect(page.getByLabel(/Gửi dưới dạng thông báo/)).toBeVisible();
  await page.getByTestId("chat-message").first().hover();
  await page.getByRole("button", { name: "Xóa tin của Mai" }).click();
  await expect(page.getByTestId("chat-message")).toHaveCount(2);
  expect(admin.deleted).toEqual(["DELETE /api/chat/1"]);

  await expect(page.getByRole("button", { name: /Xóa tin và chặn Quản trị/ })).toHaveCount(0); // tin của admin không chặn được
  await page.getByRole("button", { name: "Xóa tin và chặn Admin" }).click();
  await page.getByRole("dialog", { name: "Chặn Admin?" }).getByRole("button", { name: "Xóa và chặn" }).click();
  await expect(page.getByTestId("chat-message")).toHaveCount(1);
  expect(admin.deleted.at(-1)).toBe("DELETE /api/chat/3?block=1");

  await page.getByLabel(/Gửi dưới dạng thông báo/).check();
  await page.getByRole("textbox", { name: "Tin nhắn" }).fill("Vừa thêm công cụ mới!");
  await page.getByRole("button", { name: "Gửi tin nhắn" }).click();
  await expect(page.getByRole("textbox", { name: "Tin nhắn" })).toHaveValue(""); // đã gửi xong (getByText khớp cả nội dung ô đang gõ)
  await expect(page.getByTestId("chat-message").filter({ hasText: "Vừa thêm công cụ mới!" })).toBeVisible();
  expect(admin.sent.at(-1)).toEqual({ body: "Vừa thêm công cụ mới!", announcement: true });
});

test("chấm tin mới ở thanh trên và banner thông báo ở trang chủ; vào chat thì hết chấm, đóng banner thì ẩn", async ({ page }) => {
  await page.route("**/api/chat/status", (r) => r.fulfill({ json: { latestId: 9, announcement: { id: 8, nickname: "Quản trị", body: "Đã thêm công cụ Từ vựng HSK!", createdAt: new Date().toISOString() } } }));
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: [] } }));
  await page.route("**/api/library/songs", (r) => r.fulfill({ json: { songs: [] } }));
  await page.route("**/api/discover**", (r) => r.fulfill({ json: { songs: [], hasMore: false } }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/app");
  await expect(page.getByTestId("chat-unread-dot")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cộng đồng, có tin mới" })).toBeVisible();
  const banner = page.getByRole("region", { name: "Thông báo từ SongHanzi" });
  await expect(banner).toContainText("Đã thêm công cụ Từ vựng HSK!");
  await banner.getByRole("button", { name: "Đóng thông báo" }).click();
  await expect(banner).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "Thông báo từ SongHanzi" })).toHaveCount(0); // nhớ đã đóng
  await expect(page.getByTestId("chat-unread-dot")).toBeVisible(); // chưa xem chat nên vẫn có chấm
  await page.route(/\/api\/chat(\?.*)?$/, (r) => r.fulfill({ json: { messages: [msg(9, "Mai", "xin chào")], hasMore: false, deletedIds: [] } }));
  await page.route("**/api/leaderboard/profile", (r) => r.fulfill({ json: { profile: { nickname: "Lan", optedIn: false, avatarUrl: null } } }));
  await page.getByRole("link", { name: "Cộng đồng, có tin mới" }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByText("xin chào")).toBeVisible();
  await page.goto("/app");
  await expect(page.getByTestId("chat-unread-dot")).toHaveCount(0); // đã xem tới tin 9
});

test("tin mới của người khác tự hiện sau vài giây (hỏi định kỳ) và tin bị admin xóa tự biến mất", async ({ page }) => {
  let round = 0;
  await page.route("**/api/admin/whoami", (r) => r.fulfill({ json: { isAdmin: false } }));
  await page.route("**/api/leaderboard/profile", (r) => r.fulfill({ json: { profile: { nickname: "Lan", optedIn: false, avatarUrl: null } } }));
  await page.route("**/api/chat/status", (r) => r.fulfill({ json: { latestId: 2, announcement: null } }));
  await page.route(/\/api\/chat(\?.*)?$/, (r) => {
    const after = new URL(r.request().url()).searchParams.get("after");
    if (!after) return r.fulfill({ json: { messages: [msg(1, "Mai", "tin cũ sẽ bị xóa")], hasMore: false, deletedIds: [] } });
    round++;
    return r.fulfill({ json: { messages: [msg(2, "Hùng", "tin mới đến sau")], hasMore: false, deletedIds: [1] } });
  });
  await page.goto("/chat");
  await expect(page.getByText("tin cũ sẽ bị xóa")).toBeVisible();
  await expect(page.getByText("tin mới đến sau")).toBeVisible({ timeout: 12_000 });
  await expect(page.getByText("tin cũ sẽ bị xóa")).toHaveCount(0);
  expect(round).toBeGreaterThan(0);
});
