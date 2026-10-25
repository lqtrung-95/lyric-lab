import { expect, test } from "@playwright/test";

// Khám phá (bản thử): chạm vật hiện thẻ từ (pinyin, Hán Việt từ từ điển), nhiệm vụ mở sau 3 vật, đổi được bộ tranh, tiến độ nhớ sau khi tải lại.
test("chạm vật học từ, mở nhiệm vụ sau 3 vật, đổi bộ tranh và nhớ tiến độ", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 1300 });
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/kham-pha/phong");
  await expect(page.getByRole("heading", { name: "Phòng của bạn" })).toBeVisible();

  const start = page.getByRole("button", { name: "Nhận nhiệm vụ" });
  await expect(start).toBeDisabled();

  await page.getByRole("button", { name: /^床, / }).click();
  const card = page.getByRole("region", { name: "Từ 床" });
  await expect(card).toContainText("chuáng");
  await expect(card).toContainText("Hán Việt");
  await expect(page.getByRole("region", { name: "Sổ tay" })).toContainText("1/14");

  await page.getByRole("button", { name: /^猫, / }).click();
  await page.getByRole("button", { name: /^灯, / }).click();
  await expect(start).toBeEnabled();

  await page.getByRole("radio", { name: /Tranh B/ }).click();
  await expect(page.getByRole("radio", { name: /Tranh B/ })).toHaveAttribute("aria-checked", "true");

  await page.reload();
  await expect(page.getByRole("region", { name: "Sổ tay" })).toContainText("3/14");

  await page.getByRole("button", { name: "Nhận nhiệm vụ" }).click();
  const quest = page.getByRole("region", { name: "Nhiệm vụ của Gấu Trúc" });
  await expect(quest).toContainText("Câu 1/3");
  // Trong lúc làm nhiệm vụ không được lộ đáp án qua tên nút hay nhãn chữ Hán trên cảnh.
  await expect(page.getByRole("button", { name: /^床, / })).toHaveCount(0);
  await quest.getByRole("button", { name: "Dừng" }).click();
  await expect(quest).toBeHidden();
});

test("cảnh không tồn tại trả 404", async ({ page }) => {
  const res = await page.goto("/kham-pha/khong-co");
  expect(res?.status()).toBe(404);
});
