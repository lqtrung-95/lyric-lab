import { expect, test } from "@playwright/test";
import { SCENES } from "../../lib/explore/scenes";
import { stubYouTube } from "./helpers/youtube-stub";

test("luyện từ: điền từ vào câu thật, chọn đáp án có phản hồi, sang câu khác", async ({ page }) => {
  await page.goto("/dictionary/" + encodeURIComponent("爱"));
  await page.waitForLoadState("networkidle");
  const section = page.getByRole("region", { name: "Luyện từ này" });
  await expect(section).toBeVisible();
  await section.getByRole("button", { name: "爱", exact: true }).click();
  await expect(section.getByRole("status")).toContainText("Chính xác");
  await section.getByRole("button", { name: "Câu khác" }).click();
  await expect(section.getByRole("group", { name: "Đáp án" })).toBeVisible();
});

test("từ có trong cảnh Khám phá hiện lối vào cảnh đó", async ({ page }) => {
  const term = Object.values(SCENES)[0].objects[0].term;
  await page.goto("/dictionary/" + encodeURIComponent(term));
  await expect(page.getByRole("link", { name: /Học trong Khám phá/ })).toHaveAttribute("href", /\/kham-pha\//);
});

test("trang chủ có ô tra từ nhanh, gửi sang trang Tra từ", async ({ page }) => {
  await page.goto("/app");
  // Form GET thuần: không cần chờ hydrate, nên chỉ cần ô nhập xuất hiện.
  const box = page.getByRole("search", { name: "Tra từ nhanh" }).getByRole("searchbox");
  await box.fill("xihuan");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/dictionary\?q=xihuan/);
  await expect(page.getByRole("region", { name: "Kết quả tra" })).toContainText("喜欢");
});

test("đường cũ /tra-tu chuyển hướng vĩnh viễn sang /dictionary", async ({ request }) => {
  const res = await request.get("/tra-tu/" + encodeURIComponent("爱"), { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toContain("/dictionary/");
});

test("popover tra từ ở màn nghe có liên kết Xem chi tiết sang trang từ (tab mới)", async ({ page }) => {
  await stubYouTube(page);
  await page.route("**/api/lookup**", (r) => r.fulfill({ json: { entry: { term: "城市", traditional: "城市", pinyin: "chéng shì", sinoViet: "thành thị", hskLevel: 3, meanings: ["city"] } } }));
  await page.route("**/api/explain", (r) => r.fulfill({ json: { meaningInContext: "thành phố", model: "t", fromCache: false } }));
  await page.goto("/dev/listen-fixture");
  await page.locator('[data-line-index="0"]').getByRole("button", { name: /城市/ }).click();
  const link = page.getByRole("dialog").getByRole("link", { name: "Xem chi tiết" });
  await expect(link).toHaveAttribute("href", "/dictionary/" + encodeURIComponent("城市"));
  await expect(link).toHaveAttribute("target", "_blank");
});
