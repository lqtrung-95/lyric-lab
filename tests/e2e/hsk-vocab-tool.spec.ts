import { expect, test } from "@playwright/test";

// Công cụ Từ vựng HSK có âm Hán Việt (đọc từ điển thật trong Supabase). Kiểm tra mục lục, bảng, tìm kiếm bỏ dấu, tải CSV, cấp không hợp lệ và chân trang ở đáy.
test("mục lục có 6 cấp HSK dẫn tới trang từng cấp", async ({ page }) => {
  await page.goto("/tu-vung-hsk");
  await expect(page.getByRole("heading", { level: 1, name: /Từ vựng HSK có âm Hán Việt/ })).toBeVisible();
  for (const l of [1, 2, 3, 4, 5, 6]) await expect(page.getByRole("link", { name: new RegExp(`^HSK ${l}\\s`) })).toBeVisible();
  await page.getByRole("link", { name: /^HSK 1\s/ }).click();
  await expect(page).toHaveURL(/\/tu-vung-hsk\/1$/);
});

test("trang HSK 1: bảng có từ cơ bản kèm pinyin và Hán Việt; tìm không dấu theo Hán Việt và pinyin; không khớp thì báo", async ({ page }) => {
  await page.goto("/tu-vung-hsk/1");
  const table = page.getByRole("table");
  const wo = table.getByRole("row").filter({ hasText: "我" }).first();
  await expect(wo).toContainText("wǒ");
  await expect(wo).toContainText(/ngã/i);
  const search = page.getByRole("searchbox", { name: "Tìm từ" });
  await search.fill("nga");
  await expect(table.getByRole("row").filter({ hasText: "我" }).first()).toBeVisible();
  await search.fill("ni");
  await expect(table.getByRole("row").filter({ hasText: "你" }).first()).toBeVisible();
  await search.fill("zzzzqqq");
  await expect(page.getByText(/Không có từ nào khớp/)).toBeVisible();
  await expect(page.getByRole("status")).toContainText("0/");
});

test("Tải CSV: tải file có tiêu đề và các dòng từ vựng", async ({ page }) => {
  await page.goto("/tu-vung-hsk/1");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Tải CSV" }).click()]);
  expect(download.suggestedFilename()).toBe("tu-vung-hsk-1.csv");
  const text = (await import("node:fs")).readFileSync((await download.path())!, "utf8");
  expect(text.startsWith("﻿Từ,Pinyin,Hán Việt,Nghĩa\r\n")).toBe(true);
  expect(text).toContain("我,wǒ,ngã,");
  expect(text.split("\r\n").length).toBeGreaterThan(300);
});

test("cấp không hợp lệ trả 404; chuyển cấp bằng thanh chọn cấp", async ({ page }) => {
  expect((await page.goto("/tu-vung-hsk/9"))?.status()).toBe(404);
  expect((await page.goto("/tu-vung-hsk/abc"))?.status()).toBe(404);
  await page.goto("/tu-vung-hsk/2");
  await page.getByRole("navigation", { name: "Chọn cấp HSK" }).getByRole("link", { name: "HSK 4" }).click();
  await expect(page).toHaveURL(/\/tu-vung-hsk\/4$/);
});

test("trang Công cụ ngắn vẫn đẩy chân trang xuống đáy màn hình, và liệt kê công cụ Từ vựng HSK", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/tools");
  await expect(page.getByRole("link", { name: /Từ vựng HSK có âm Hán Việt/ })).toBeVisible();
  const bottom = await page.locator("footer").evaluate((el) => el.getBoundingClientRect().bottom);
  expect(bottom).toBeGreaterThanOrEqual(899);
});
