import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Nút loa đọc chữ Hán (Web Speech API). Test thay `speak` để ghi lại thứ được đọc thay vì phát tiếng.
test("nút loa trên thẻ từ vựng đọc đúng chữ Hán bằng giọng zh-CN", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __spoken: unknown[] }).__spoken = [];
    window.speechSynthesis.speak = (u) => { (window as unknown as { __spoken: unknown[] }).__spoken.push({ text: u.text, lang: u.lang }); };
  });
  await page.goto("/dev/preview-fixture");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "离开", exact: true }) });
  await card.getByRole("button", { name: "Nghe phát âm 离开" }).click();
  expect(await page.evaluate(() => (window as unknown as { __spoken: unknown[] }).__spoken)).toEqual([{ text: "离开", lang: "zh-CN" }]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("trình duyệt không hỗ trợ đọc: không hiện nút loa", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, "speechSynthesis", { value: undefined }); });
  await page.goto("/dev/preview-fixture");
  await expect(page.getByRole("button", { name: /Nghe phát âm/ })).toHaveCount(0);
});
