import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Công cụ luyện phát âm công khai: bảng pinyin, luyện thanh điệu (chỉ kiểm tra giao diện; DSP đã có unit test), trò nghe đoán thanh.
test("trang chủ Luyện phát âm liên kết tới 3 công cụ", async ({ page }) => {
  await page.goto("/phat-am");
  await expect(page.getByRole("heading", { level: 1, name: "Luyện phát âm tiếng Trung" })).toBeVisible();
  for (const name of [/Bảng pinyin có giọng đọc/, /Luyện thanh điệu/, /Nghe đoán thanh/]) await expect(page.getByRole("link", { name })).toBeVisible();
});

test("bảng pinyin: chuyển tab, ví dụ có nút nghe", async ({ page }) => {
  await page.goto("/phat-am/bang-pinyin");
  await expect(page.getByRole("button", { name: /Nghe bà \(爸\)/ })).toBeVisible();
  await page.getByRole("tab", { name: "Vần" }).click();
  await expect(page.getByRole("tab", { name: "Vần" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Lỗi hay gặp" }).click();
  await expect(page.getByText(/Không bật hơi/)).toBeVisible();
});

test("luyện thanh điệu: đổi thanh đổi chữ mẫu; micro bị từ chối thì báo lỗi", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error("denied"), { name: "NotAllowedError" }));
  });
  await page.goto("/phat-am/luyen-thanh-dieu");
  await expect(page.locator("div[lang=zh-Hans]", { hasText: "妈" })).toBeVisible();
  await page.getByRole("button", { name: "Thanh 3" }).click();
  await expect(page.locator("div[lang=zh-Hans]", { hasText: "马" })).toBeVisible();
  await page.getByRole("button", { name: "Ghi âm và đọc lại" }).click();
  await expect(page.getByText(/cho phép micro/)).toContainText("cho phép micro");
});

test("nghe đoán thanh: chơi hết 8 câu ra kết quả", async ({ page }) => {
  await page.goto("/phat-am/nghe-doan-thanh");
  for (let i = 0; i < 8; i++) {
    await page.getByRole("button", { name: /^Thanh 1/ }).click();
    await expect(page.getByRole("status").filter({ hasText: /đọc là/ })).toBeVisible();
    await page.getByRole("button", { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  await expect(page.getByTestId("quiz-done")).toBeVisible();
  await page.getByRole("button", { name: "Chơi lại" }).click();
  await expect(page.getByText(/Câu 1\/8/)).toBeVisible();
});

for (const path of ["/phat-am", "/phat-am/bang-pinyin", "/phat-am/luyen-thanh-dieu", "/phat-am/doc-to-cham-diem", "/phat-am/nghe-doan-thanh"]) {
  test(`a11y ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => v.id + ": " + v.nodes[0]?.html)).toEqual([]);
  });
}
