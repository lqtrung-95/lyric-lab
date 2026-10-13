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
