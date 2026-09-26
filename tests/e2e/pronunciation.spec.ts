import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Nút loa đọc chữ Hán: gọi /api/tts (giọng AI); khi lỗi thì rơi về giọng hệ thống (Web Speech API).
// Test thay `speak` để ghi lại thứ được đọc thay vì phát tiếng, và giả lập /api/tts để không tốn hạn mức Azure.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __spoken: unknown[] }).__spoken = [];
    window.speechSynthesis.speak = (u) => { (window as unknown as { __spoken: unknown[] }).__spoken.push({ text: u.text, lang: u.lang }); };
  });
});

const spoken = (page: import("@playwright/test").Page) => page.evaluate(() => (window as unknown as { __spoken: unknown[] }).__spoken);

test("bấm loa gọi /api/tts với đúng chữ Hán và đạt axe", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/api/tts**", (route) => { requests.push(decodeURIComponent(new URL(route.request().url()).searchParams.get("text") ?? "")); return route.fulfill({ status: 500, json: { error: "x" } }); });
  await page.goto("/dev/preview-fixture");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
  await card.getByRole("button", { name: "Nghe phát âm 离开" }).click();
  await expect.poll(() => requests).toEqual(["离开"]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("server lỗi hoặc hết hạn mức: rơi về giọng hệ thống zh-CN, nút loa không hỏng", async ({ page }) => {
  await page.route("**/api/tts**", (route) => route.fulfill({ status: 429, json: { error: "rate_limited" } }));
  await page.goto("/dev/preview-fixture");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
  await card.getByRole("button", { name: "Nghe phát âm 离开" }).click();
  await expect.poll(() => spoken(page)).toEqual([{ text: "离开", lang: "zh-CN" }]);
});

test("người dùng chọn giọng thiết bị: không gọi /api/tts", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/tts**", (route) => { calls++; return route.fulfill({ status: 500, json: {} }); });
  await page.addInitScript(() => localStorage.setItem("lyric-lab-tts-voice", "Tingting"));
  await page.goto("/dev/preview-fixture");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
  await card.getByRole("button", { name: "Nghe phát âm 离开" }).click();
  await expect.poll(() => spoken(page)).toEqual([{ text: "离开", lang: "zh-CN" }]);
  expect(calls).toBe(0);
});
