import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Bỏ bài khỏi "Bài hát gần đây" (/app) và "Bài hát của tôi" (thư viện): hỏi xác nhận trong hộp thoại, rồi cho hoàn tác. API được giả lập.
const REMOVE = "Bỏ “Tên ngắn” khỏi danh sách";
const confirm = (page: Page) => page.getByRole("dialog", { name: "Bỏ bài này khỏi danh sách?" });
const SONGS = [
  { videoId: "aaaaaaaaaaa", title: "Tên ngắn", channelTitle: "Kênh A", openedAt: 3 },
  { videoId: "bbbbbbbbbbb", title: "Bài thứ hai", channelTitle: "Kênh B", openedAt: 2 },
];

async function setup(page: Page) {
  await page.addInitScript((songs) => { if (!localStorage.getItem("seeded")) { localStorage.setItem("lyric-lab-recent-songs", JSON.stringify(songs)); localStorage.setItem("seeded", "1"); } }, SONGS);
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  await page.route("**/api/library/songs", (r) => r.fulfill({ json: { songs: [] } }));
  await page.route("**/api/discover**", (r) => r.fulfill({ json: { songs: [], hasMore: false } }));
}

for (const [name, url, tab] of [["trang chủ app", "/app", null], ["thư viện", "/library", "Bài hát của tôi"]] as const) {
  test(`${name}: bỏ bài, hoàn tác và được nhớ sau khi tải lại`, async ({ page }) => {
    await setup(page);
    await page.goto(url);
    if (tab) await page.getByRole("tab", { name: tab }).click();
    const card = (title: string) => page.getByRole("link", { name: new RegExp(title) });
    await expect(card("Tên ngắn")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("button", { name: REMOVE }).click();
    await expect(confirm(page)).toBeVisible();
    await expect(card("Tên ngắn")).toBeVisible(); // chưa xóa gì trước khi xác nhận
    await confirm(page).getByRole("button", { name: "Bỏ khỏi danh sách" }).click();
    await expect(card("Tên ngắn")).toHaveCount(0);
    await expect(card("Bài thứ hai")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Đã bỏ “Tên ngắn” khỏi danh sách" })).toBeVisible();

    await page.getByRole("button", { name: "Hoàn tác" }).click();
    await expect(card("Tên ngắn")).toBeVisible();

    await page.getByRole("button", { name: REMOVE }).click();
    await confirm(page).getByRole("button", { name: "Bỏ khỏi danh sách" }).click();
    await expect(card("Tên ngắn")).toHaveCount(0);
    await page.reload();
    if (tab) await page.getByRole("tab", { name: tab }).click();
    await expect(card("Tên ngắn")).toHaveCount(0);
    await expect(card("Bài thứ hai")).toBeVisible();
  });
}

test("nút bỏ bài đủ lớn cho cảm ứng (≥ 44px) và bấm được bằng bàn phím", async ({ page }) => {
  await setup(page);
  await page.goto("/app");
  const button = page.getByRole("button", { name: "Bỏ “Tên ngắn” khỏi danh sách" });
  const box = await button.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(confirm(page)).toBeVisible();
  await page.keyboard.press("Tab"); // Tab không thoát khỏi hộp thoại
  await page.keyboard.press("Enter"); // nút thứ hai: "Bỏ khỏi danh sách"
  await expect(page.getByRole("link", { name: /Tên ngắn/ })).toHaveCount(0);
});

test.describe("hộp thoại xác nhận", () => {
  test("focus ban đầu ở 'Giữ lại'; Hủy, Esc và bấm nền đều không xóa; đạt axe", async ({ page }) => {
    await setup(page);
    await page.goto("/app");
    const open = () => page.getByRole("button", { name: REMOVE }).click();
    await open();
    await expect(confirm(page)).toBeVisible();
    await expect(confirm(page).getByRole("button", { name: "Giữ lại" })).toBeFocused();
    expect((await new AxeBuilder({ page }).include("dialog").analyze()).violations).toEqual([]);

    await confirm(page).getByRole("button", { name: "Giữ lại" }).click();
    await expect(confirm(page)).toBeHidden();
    await expect(page.getByRole("link", { name: /Tên ngắn/ })).toBeVisible();

    await open();
    await page.keyboard.press("Escape");
    await expect(confirm(page)).toBeHidden();
    await expect(page.getByRole("link", { name: /Tên ngắn/ })).toBeVisible();

    await open();
    await page.mouse.click(5, 5); // vùng nền mờ ngoài hộp thoại
    await expect(confirm(page)).toBeHidden();
    await expect(page.getByRole("link", { name: /Tên ngắn/ })).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("lyric-lab-recent-songs") ?? "[]").length)).toBe(2);
  });
});
