import { expect, test } from "@playwright/test";

// Nét viết dùng dữ liệu hanzi-writer-data qua /api/tra-tu/strokes/[chữ] (không gọi CDN).
const open = async (page: import("@playwright/test").Page, term: string) => {
  await page.goto("/tra-tu/" + encodeURIComponent(term));
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Xem thứ tự nét, tập viết" }).click();
};

test("mở khối nét viết: số nét, chọn từng chữ của từ, ghi nguồn và giấy phép", async ({ page }) => {
  await open(page, "爱情");
  const section = page.getByRole("region", { name: "Nét viết" });
  await expect(section.getByText("10 nét")).toBeVisible();
  await expect(section.getByRole("img", { name: "Thứ tự nét của chữ 爱" })).toBeVisible();
  await section.getByRole("button", { name: "情" }).click();
  await expect(section.getByText("11 nét")).toBeVisible();
  await expect(section.getByRole("link", { name: "Arphic Public License" })).toHaveAttribute("href", "/licenses/ARPHICPL.TXT");
  await expect(section.getByRole("link", { name: "Make Me a Hanzi" })).toBeVisible();
});

test("tập viết: vẽ đúng nét thì có điểm; chế độ xem phát lại được", async ({ page }) => {
  await open(page, "一");
  const section = page.getByRole("region", { name: "Nét viết" });
  await expect(section.getByRole("button", { name: "Phát lại" })).toBeEnabled();
  await section.getByRole("button", { name: "Tập viết" }).click();
  await expect(section.getByRole("status")).toContainText("Nét 1/1");
  const box = (await section.getByRole("img", { name: /Thứ tự nét/ }).boundingBox())!;
  const y = box.y + box.height * 0.5;
  await page.mouse.move(box.x + box.width * 0.2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, y, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.8, y, { steps: 8 });
  await page.mouse.up();
  await expect(section.getByRole("status")).toContainText("100%");
  await section.getByRole("button", { name: "Viết lại" }).click();
  await expect(section.getByRole("status")).toContainText("Nét 1/1");
});

test("API nét: trả JSON cho chữ Hán, từ chối chuỗi không phải đúng một chữ Hán", async ({ request }) => {
  const ok = await request.get("/api/tra-tu/strokes/" + encodeURIComponent("爱"));
  expect(ok.status()).toBe(200);
  expect((await ok.json()).strokes).toHaveLength(10);
  expect((await request.get("/api/tra-tu/strokes/a")).status()).toBe(400);
  expect((await request.get("/api/tra-tu/strokes/" + encodeURIComponent("爱情"))).status()).toBe(400);
  expect((await request.get("/licenses/ARPHICPL.TXT")).status()).toBe(200);
});
