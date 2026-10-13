import { expect, test, type Page } from "@playwright/test";

// Game Quán ăn: nhân vật đi trong quán. Test đọc order trên phiếu rồi bấm món/bàn (nhân vật tự đi tới), nên không phụ thuộc thứ tự ngẫu nhiên.
test.setTimeout(60_000);
const NUM: Record<string, number> = { 一: 1, 两: 2, 三: 3 };

async function open(page: Page) {
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 503, json: { error: "off" } }));
  await page.goto("/review/restaurant");
  await page.getByRole("button", { name: "Mở cửa quán" }).click();
}

const ticket = (page: Page) => page.getByTestId("ticket").first();

async function order(page: Page) {
  const zh = (await ticket(page).locator("p.font-serif").textContent()) ?? "";
  const table = Number(await ticket(page).getByLabel(/^Bàn \d/).textContent());
  return { table, items: [...zh.matchAll(/([一两三])[个杯碗根盘](包子|馒头|鸡蛋|豆浆|粥|面条|油条|饺子)/g)].map((m) => ({ dish: m[2], qty: NUM[m[1]] })) };
}

async function takeDishes(page: Page, items: { dish: string; qty: number }[]) {
  let total = 0;
  for (const { dish, qty } of items) {
    for (let i = 0; i < qty; i++) await page.getByRole("button", { name: new RegExp(`^Lấy ${dish}`) }).click();
    total += qty;
    await expect(page.getByTestId("tray")).toContainText(`${total}/6`, { timeout: 15_000 });
  }
}

test("lấy đúng món ở quầy rồi mang ra đúng bàn thì được xu và thấy nghĩa tiếng Việt", async ({ page }) => {
  await open(page);
  await expect(ticket(page)).toBeVisible();
  const { table, items } = await order(page);
  await takeDishes(page, items);
  await page.getByRole("button", { name: new RegExp(`^Bàn ${table}`) }).click();
  await expect(page.getByText(/Đúng rồi! \+¥1[05]\. Xin chào! Cho tôi/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("tray")).toContainText("trống");
  await expect(page.getByText(/^¥ 1[05]$/)).toBeVisible();
});

test("mang sai món thì bị báo, khay được giữ; đổ vào thùng rác thì khay trống", async ({ page }) => {
  await open(page);
  const { table, items } = await order(page);
  const wrong = ["包子", "馒头", "鸡蛋", "豆浆", "粥", "面条", "油条", "饺子"].find((d) => !items.some((i) => i.dish === d))!;
  await takeDishes(page, [{ dish: wrong, qty: 1 }]);
  await page.getByRole("button", { name: new RegExp(`^Bàn ${table}`) }).click();
  await expect(page.getByText("Chưa đúng món hoặc số lượng")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("tray")).toContainText("1/6");
  await page.getByRole("button", { name: /^Thùng rác/ }).click();
  await expect(page.getByTestId("tray")).toContainText("trống", { timeout: 15_000 });
});

test("đi bằng phím WASD và phím E lấy món ở quầy khi đứng gần", async ({ page }) => {
  await open(page);
  const player = page.getByTestId("player");
  const x0 = Number(await player.getAttribute("data-x"));
  await page.keyboard.down("d");
  await page.waitForTimeout(400);
  await page.keyboard.up("d");
  expect(Number(await player.getAttribute("data-x"))).toBeGreaterThan(x0 + 5);
  await page.keyboard.down("w");
  await page.waitForTimeout(500);
  await page.keyboard.up("w");
  // Đang gần quầy trên cùng: E lấy món gần nhất.
  await page.keyboard.press("e");
  await expect(page.getByTestId("tray")).toContainText("1/6");
});

test("chế độ chỉ nghe ẩn chữ trên phiếu order", async ({ page }) => {
  await open(page);
  await expect(ticket(page)).toBeVisible();
  await expect(ticket(page).locator("p.font-serif")).toHaveCount(1);
  await page.getByLabel("Chỉ nghe (ẩn chữ)").check();
  await expect(ticket(page).getByText("Bấm loa để nghe.")).toBeVisible();
  await expect(ticket(page).locator("p.font-serif")).toHaveCount(0);
});
