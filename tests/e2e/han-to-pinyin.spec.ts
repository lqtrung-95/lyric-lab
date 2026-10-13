import { expect, test } from "@playwright/test";

// Công cụ công khai chuyển chữ Hán sang pinyin và Hán Việt. API giả lập để không cần dữ liệu từ điển.
const LINES = [{ tokens: [{ text: "你好", pinyin: "nǐ hǎo", sinoViet: "nhĩ hảo" }, { text: "，", pinyin: null, sinoViet: null }, { text: "学生", pinyin: "xué sheng", sinoViet: "học sinh" }] }];

test("nhập chữ Hán, chuyển đổi, ẩn/hiện pinyin và Hán Việt, sao chép", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  let body = "";
  await page.route("**/api/tools/han-to-pinyin", (r) => { body = r.request().postData() ?? ""; return r.fulfill({ json: { lines: LINES } }); });
  await page.goto("/chu-han-sang-pinyin");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pinyin");
  await expect(page.getByRole("button", { name: "Chuyển đổi" })).toBeDisabled();
  await page.getByLabel("Nhập chữ Hán").fill("你好，学生");
  await page.getByRole("button", { name: "Chuyển đổi" }).click();
  const result = page.getByRole("region", { name: "Kết quả" });
  await expect(result).toContainText("nǐ hǎo");
  await expect(result).toContainText("học sinh");
  expect(JSON.parse(body).text).toBe("你好，学生");
  await page.getByLabel("Hiện âm Hán Việt").uncheck();
  await expect(result).not.toContainText("học sinh");
  await page.getByRole("button", { name: "Sao chép pinyin" }).click();
  await expect(page.getByRole("button", { name: "Đã sao chép pinyin" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("nǐ hǎo ， xué sheng");
});

test("văn bản không có chữ Hán hoặc hết lượt thì báo lỗi dễ hiểu", async ({ page }) => {
  await page.route("**/api/tools/han-to-pinyin", (r) => r.fulfill({ status: 400, json: { error: "no_han" } }));
  await page.goto("/chu-han-sang-pinyin");
  await page.getByLabel("Nhập chữ Hán").fill("hello");
  await page.getByRole("button", { name: "Chuyển đổi" }).click();
  await expect(page.getByText("Hãy nhập ít nhất một chữ Hán")).toBeVisible();
});

test("trang công cụ nằm trong sitemap và có dữ liệu có cấu trúc", async ({ page, request }) => {
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/chu-han-sang-pinyin");
  await page.goto("/chu-han-sang-pinyin");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join("")).toContain("FAQPage");
});

test("trang Công cụ liệt kê công cụ, bấm vào mở đúng trang, có link quay lại và nằm trong sitemap", async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/cong-cu");
  await expect(page.getByRole("heading", { level: 1, name: "Công cụ" })).toBeVisible();
  await page.getByRole("link", { name: /Chữ Hán sang pinyin và Hán Việt/ }).click();
  await expect(page).toHaveURL(/\/chu-han-sang-pinyin$/);
  await page.getByRole("link", { name: "← Tất cả công cụ" }).click();
  await expect(page).toHaveURL(/\/cong-cu$/);
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/cong-cu");
});

test("lối vào Công cụ: thanh trên trang giới thiệu, biểu tượng ở thanh trên của app và dòng gợi ý ở trang chủ", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Các phần của trang" }).getByRole("link", { name: "Công cụ" }).click();
  await expect(page).toHaveURL(/\/cong-cu$/);
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: [] } }));
  await page.route("**/api/library/songs", (r) => r.fulfill({ json: { songs: [] } }));
  await page.route("**/api/discover**", (r) => r.fulfill({ json: { songs: [], hasMore: false } }));
  await page.goto("/app");
  await page.getByRole("link", { name: "Công cụ", exact: true }).click(); // biểu tượng trên thanh trên
  await expect(page).toHaveURL(/\/cong-cu$/);
  await page.goto("/app");
  await page.getByRole("link", { name: "Mở Công cụ" }).click();
  await expect(page).toHaveURL(/\/cong-cu$/);
});

test("chân trang trang giới thiệu có email liên hệ, trang Góp ý cũng ghi email", async ({ page }) => {
  await page.goto("/cong-cu");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Liên hệ" })).toHaveAttribute("href", "mailto:hello@songhanzi.com");
  await expect(footer.getByRole("link", { name: "hello@songhanzi.com" })).toHaveAttribute("href", "mailto:hello@songhanzi.com");
  await page.goto("/feedback");
  await expect(page.getByRole("link", { name: "hello@songhanzi.com" })).toHaveAttribute("href", "mailto:hello@songhanzi.com");
});
