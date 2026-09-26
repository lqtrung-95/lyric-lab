import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Tab "Khám phá" của thư viện. API được giả lập để test không phụ thuộc dữ liệu thật.
const song = (n: number) => ({ videoId: `disc${String(n).padStart(7, "0")}`, title: `Bài khám phá ${n}`, channelTitle: "Kênh", levelAvg: 3.4, listeners: n });

test("hiện danh sách, gửi đúng bộ lọc, 'Xem thêm' nối tiếp và đạt axe", async ({ page }) => {
  const urls: string[] = [];
  await page.route("**/api/discover**", (route) => {
    const u = new URL(route.request().url());
    urls.push(u.search);
    const offset = Number(u.searchParams.get("offset"));
    return route.fulfill({ json: offset === 0 ? { songs: [1, 2, 3].map(song), hasMore: true } : { songs: [4, 5].map(song), hasMore: false } });
  });
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/library");
  await page.getByRole("tab", { name: "Khám phá" }).click();
  await expect(page.getByText("Bài khám phá 1")).toBeVisible();
  await expect(page.getByText("HSK ~3.4 · 1 người đã nghe")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "Xem thêm" }).click();
  await expect(page.getByText("Bài khám phá 5")).toBeVisible();
  await expect(page.getByRole("button", { name: "Xem thêm" })).toHaveCount(0);

  await page.getByLabel("Trình độ").selectOption("3-4");
  await page.getByLabel("Sắp xếp").selectOption("popular");
  await expect.poll(() => urls.at(-1)).toMatch(/sort=popular.*band=3-4|band=3-4.*sort=popular/);
  await page.getByRole("searchbox", { name: "Tìm bài hát theo tên" }).fill("yêu");
  await expect.poll(() => urls.at(-1)).toContain("q=y%C3%AAu");
});

test("khám phá trống và lỗi có thông báo", async ({ page }) => {
  await page.route("**/api/discover**", (route) => route.fulfill({ json: { songs: [], hasMore: false } }));
  await page.goto("/library");
  await page.getByRole("tab", { name: "Khám phá" }).click();
  await expect(page.getByText("Chưa có bài nào khớp bộ lọc.")).toBeVisible();
  await page.unroute("**/api/discover**");
  await page.route("**/api/discover**", (route) => route.fulfill({ status: 500, json: { error: "x" } }));
  await page.getByLabel("Sắp xếp").selectOption("popular");
  await expect(page.getByText("Chưa tải được danh sách")).toBeVisible();
});
