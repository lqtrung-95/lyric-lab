import { expect, test, type Page } from "@playwright/test";

// Lọc và sắp xếp danh sách video theo cấp HSK. API giả lập; level người dùng mặc định là HSK 1 nên dải "HSK 1–2" được đánh dấu "hợp bạn" nhưng không tự chọn.
const v = (id: string, title: string, levelAvg: number | null, durationSec: number) => ({ videoId: id, title, channelTitle: "Kênh", durationSec, levelAvg, lineCount: 10 });
const VIDEOS = [
  v("aaaaaaaaaa1", "Video khó", 5.2, 900), v("aaaaaaaaaa2", "Video dễ", 1.6, 1200),
  v("aaaaaaaaaa3", "Video vừa", 3.1, 300), v("aaaaaaaaaa4", "Video chưa chấm", null, 600),
];

async function open(page: Page) {
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: VIDEOS } }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/video");
  await page.getByRole("button", { name: "Nhóm theo kênh" }).click(); // mặc định đang nhóm theo kênh; các bài kiểm tra này xem danh sách phẳng
}

test("mặc định hiện tất cả video; nút lọc chỉ gồm các dải có video, dải hợp level được đánh dấu nhưng không tự chọn", async ({ page }) => {
  await open(page);
  await expect(page.getByRole("link", { name: /Video khó/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Video chưa chấm/ })).toBeVisible();
  const group = page.getByRole("group", { name: "Lọc theo cấp HSK" });
  await expect(group.getByRole("button", { name: /^Tất cả/ })).toHaveAttribute("aria-pressed", "true");
  await expect(group.getByRole("button", { name: /HSK 1–2/ })).toContainText("hợp bạn");
  await expect(group.getByRole("button", { name: /HSK 4/ })).toHaveCount(0); // dải trống (không có video 3,5–4,5) bị ẩn
  await expect(group.getByRole("button", { name: /HSK 3/ })).toContainText("1");
});

test("chọn một dải chỉ còn video của dải đó; chọn lại Tất cả thì đủ; video chưa có level chỉ ở Tất cả", async ({ page }) => {
  await open(page);
  const group = page.getByRole("group", { name: "Lọc theo cấp HSK" });
  await group.getByRole("button", { name: /HSK 3/ }).click();
  await expect(page.getByRole("link", { name: /Video vừa/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Video dễ/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Video chưa chấm/ })).toHaveCount(0);
  await expect(group.getByRole("button", { name: /HSK 3/ })).toHaveAttribute("aria-pressed", "true");
  await group.getByRole("button", { name: /^Tất cả/ }).click();
  await expect(page.locator("ul a[href^='/video/']")).toHaveCount(4);
});

test("sắp xếp dễ → khó và ngắn → dài đổi đúng thứ tự thẻ", async ({ page }) => {
  await open(page);
  await page.getByLabel("Sắp xếp").selectOption("easy");
  const easy = await page.locator("ul a[href^='/video/']").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(easy).toEqual(["/video/aaaaaaaaaa2", "/video/aaaaaaaaaa3", "/video/aaaaaaaaaa1", "/video/aaaaaaaaaa4"]);
  await page.getByLabel("Sắp xếp").selectOption("short");
  const short = await page.locator("ul a[href^='/video/']").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(short).toEqual(["/video/aaaaaaaaaa3", "/video/aaaaaaaaaa4", "/video/aaaaaaaaaa1", "/video/aaaaaaaaaa2"]);
});

test("Nhóm theo kênh: gom video theo kênh (kênh nhiều video trước, mặc định bật), tắt thì về danh sách phẳng", async ({ page }) => {
  const mix = [
    { ...VIDEOS[0], channelTitle: "Kênh B" }, { ...VIDEOS[1], channelTitle: "Kênh A" },
    { ...VIDEOS[2], channelTitle: "Kênh A" }, { ...VIDEOS[3], channelTitle: "Kênh B" }, { ...v("aaaaaaaaaa5", "Video thêm", 2, 100), channelTitle: "Kênh A" },
  ];
  await page.route("**/api/videos", (r) => r.fulfill({ json: { videos: mix } }));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/video");
  const toggle = page.getByRole("button", { name: "Nhóm theo kênh" });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
  expect(headings.map((h) => h.replace(/\s+/g, " ").trim())).toEqual(["Kênh A 3 video", "Kênh B 2 video"]);
  await expect(page.getByRole("region", { name: "Kênh Kênh A" }).locator("a[href^='/video/']")).toHaveCount(3);
  await toggle.click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(0);
});
