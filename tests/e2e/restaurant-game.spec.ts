import { expect, test, type Page } from "@playwright/test";

// Trò chơi Quán ăn: đọc lời gọi món hiển thị trên màn hình rồi bấm đúng món và số lượng (không phụ thuộc thứ tự ngẫu nhiên).
const DISHES: Record<string, string> = { 包子: "包子", 馒头: "馒头", 鸡蛋: "鸡蛋", 豆浆: "豆浆", 粥: "粥", 面条: "面条", 油条: "油条", 饺子: "饺子" };
const NUM: Record<string, number> = { 一: 1, 两: 2, 三: 3 };

async function open(page: Page) {
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 503, json: { error: "off" } }));
  await page.goto("/review/restaurant");
  await page.getByRole("button", { name: "Mở cửa quán" }).click();
}

/** Từ câu gọi món suy ra khay đúng: [{món, số lượng}]. */
async function wanted(page: Page) {
  const zh = (await page.locator("div[lang='zh'] > p").first().textContent()) ?? "";
  return [...zh.matchAll(/([一两三])[个杯碗根盘](包子|馒头|鸡蛋|豆浆|粥|面条|油条|饺子)/g)].map((m) => ({ dish: DISHES[m[2]], qty: NUM[m[1]] }));
}

async function fill(page: Page, items: { dish: string; qty: number }[]) {
  for (const { dish, qty } of items) for (let i = 0; i < qty; i++) await page.getByRole("button", { name: new RegExp(`^Thêm ${dish}`) }).click();
}

test("phục vụ đúng cả ca: mỗi khách đúng lần đầu được ¥10, hết ca hiện kết quả và có thể chơi lại", async ({ page }) => {
  await open(page);
  await expect(page.getByText("Khách 1/7")).toBeVisible();
  for (let i = 0; i < 7; i++) {
    await fill(page, await wanted(page));
    await page.getByRole("button", { name: "Phục vụ" }).click();
    await expect(page.getByText("Đúng rồi! +¥10")).toBeVisible();
    await page.getByRole("button", { name: i < 6 ? "Khách tiếp theo" : "Xem kết quả" }).click();
  }
  await expect(page.getByRole("heading", { name: /Bạn kiếm được ¥70/ })).toBeVisible();
  await expect(page.getByText("7/7 khách phục vụ đúng ngay lần đầu.")).toBeVisible();
  await page.getByRole("button", { name: "Chơi ca mới" }).click();
  await expect(page.getByText("Khách 1/7")).toBeVisible();
});

test("sai lần đầu được thử lại (¥5), sai lần hai thì hiện đáp án và không có xu", async ({ page }) => {
  await open(page);
  // Khay sai chắc chắn: món thừa không có trong đơn (lấy món không nằm trong câu gọi).
  const want = (await wanted(page)).map((w) => w.dish);
  const wrong = Object.keys(DISHES).find((d) => !want.includes(d))!;
  await page.getByRole("button", { name: new RegExp(`^Thêm ${wrong}`) }).click();
  await page.getByRole("button", { name: "Phục vụ" }).click();
  await expect(page.getByText("Chưa đúng, nghe lại và thử lần nữa nhé.")).toBeVisible();
  await page.getByRole("button", { name: "Phục vụ" }).click();
  await expect(page.getByText("Khách gọi:")).toBeVisible();
  await expect(page.getByText("¥ 0", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Khách tiếp theo" })).toBeVisible();
});

test("chế độ chỉ nghe ẩn chữ tới khi phục vụ xong; thực đơn và khay dùng được bằng nút có tên", async ({ page }) => {
  await open(page);
  await page.getByLabel("Chỉ nghe (ẩn chữ)").check();
  await expect(page.getByText("Bấm nút loa để nghe khách gọi món.")).toBeVisible();
  const items = await page.locator("div[lang='zh'] > p").count();
  expect(items).toBe(0);
  await page.getByLabel("Chỉ nghe (ẩn chữ)").uncheck();
  const want = await wanted(page);
  await page.getByRole("button", { name: new RegExp(`^Thêm ${want[0].dish}`) }).click();
  await expect(page.getByRole("group", { name: "Khay của bạn" })).toContainText("×1");
  await page.getByRole("button", { name: /^Bớt một/ }).click();
  await expect(page.getByText("Khay trống")).toBeVisible();
});
