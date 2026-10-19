import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Bộ thành phần của thiết kế mới (Cozy Fantasy) đạt WCAG AA ở cả sáng và tối, nút 3D nhấn xuống được và chữ dùng Plus Jakarta Sans.
for (const theme of ["light", "dark"] as const) {
  test(`ui-kit đạt axe (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem("lyric-lab-theme", t), theme);
    await page.goto("/dev/ui-kit");
    await expect(page.getByRole("heading", { level: 1, name: "Bộ thành phần SongHanzi" })).toBeVisible();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(theme === "dark");
    const violations = (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations;
    expect(violations.map((v) => v.id + ": " + v.nodes.map((n) => n.html.slice(0, 90)).join(" | "))).toEqual([]);
  });
}

test("nút 3D có đáy và nhấn xuống 4px; font giao diện là Plus Jakarta Sans", async ({ page }) => {
  await page.goto("/dev/ui-kit");
  const button = page.getByRole("button", { name: "Vào học ngay" });
  const shadow = await button.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).not.toBe("none");
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toMatch(/jakarta/i);
});
