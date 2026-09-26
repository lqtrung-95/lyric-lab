import { expect, test } from "@playwright/test";

const SONGS = [
  { videoId: "aaaaaaaaaaa", title: "Tên ngắn", channelTitle: "Kênh A", openedAt: 3 },
  { videoId: "bbbbbbbbbbb", title: "Một tiêu đề rất dài để chắc chắn chiếm đủ hai dòng trong thẻ bài hát của thư viện và trang chủ nữa", channelTitle: "Kênh B", openedAt: 2 },
  { videoId: "ccccccccccc", title: "Vừa vừa", channelTitle: "Kênh C - Topic", openedAt: 1 },
];
const seed = (page: import("@playwright/test").Page) =>
  page.addInitScript((songs) => localStorage.setItem("lyric-lab-recent-songs", JSON.stringify(songs)), SONGS);

const heights = async (page: import("@playwright/test").Page) =>
  (await page.locator("ul a[href^='/learn/']").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height))));

test("thẻ bài hát ở thư viện và trang chủ cao bằng nhau dù tiêu đề dài ngắn khác nhau", async ({ page }) => {
  await seed(page);
  await page.route("**/api/library/songs", (r) => r.fulfill({ json: { songs: [] } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/library");
  await expect(page.locator("ul a[href^='/learn/']")).toHaveCount(3);
  expect(new Set(await heights(page)).size).toBe(1);
  await page.goto("/");
  await expect(page.locator("ul a[href^='/learn/']")).toHaveCount(3);
  expect(new Set(await heights(page)).size).toBe(1);
});

test("dán link đúng: nút chuyển sang trạng thái đang mở và bị khóa", async ({ page }) => {
  await page.route("**/api/analyze/**", () => new Promise(() => {})); // giữ trang bài học ở trạng thái chờ
  await page.goto("/");
  await page.getByLabel("Dán link YouTube của bài hát").fill("https://youtu.be/dQw4w9WgXcQ");
  const submit = page.getByRole("button", { name: /Phân tích bài hát|Đang mở bài hát/ });
  await submit.click();
  await expect(page.getByRole("button", { name: "Đang mở bài hát…" })).toBeDisabled();
});

test("bấm liên kết sang trang server chậm: hiện thanh tiến trình rồi tắt khi trang mới hiện", async ({ page }) => {
  await seed(page);
  await page.route("**/api/analyze/**", () => new Promise(() => {}));
  await page.goto("/");
  await page.route(/\/learn\/aaaaaaaaaaa/, async (route) => { await new Promise((r) => setTimeout(r, 1500)); return route.continue(); });
  const bar = page.locator("div.pointer-events-none.fixed.top-0[aria-hidden='true']");
  await page.getByRole("link", { name: /Tên ngắn/ }).click();
  await expect(bar).toBeVisible();
  await expect(page).toHaveURL(/\/learn\/aaaaaaaaaaa$/);
  await expect(bar).toHaveCount(0);
});

test("dropdown: mũi tên nằm trong ô, cách mép phải đủ xa", async ({ page }) => {
  await page.goto("/settings");
  const select = page.getByLabel("Thẻ mới mỗi ngày");
  const box = await select.boundingBox();
  const arrow = await select.locator("xpath=following-sibling::*[1]").boundingBox();
  expect(box && arrow).toBeTruthy();
  expect(box!.x + box!.width - (arrow!.x + arrow!.width)).toBeGreaterThanOrEqual(8);
  expect(arrow!.x).toBeGreaterThan(box!.x + box!.width / 2);
});
