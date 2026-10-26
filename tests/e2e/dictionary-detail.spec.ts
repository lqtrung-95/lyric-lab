import { expect, test } from "@playwright/test";
import { stubYouTube } from "./helpers/youtube-stub";

// Trang chi tiết từ trên từ điển thật; chỉ dùng từ cơ bản ổn định (爱, 的).
test("đầu trang chi tiết: chữ Hán lớn, pinyin, phồn thể, Hán Việt, HSK, nghĩa tiếng Việt đã duyệt và nghĩa Anh", async ({ page }) => {
  await page.goto("/dictionary/" + encodeURIComponent("爱"));
  await expect(page.getByRole("heading", { level: 1, name: "爱" })).toBeVisible();
  const head = page.getByRole("region", { name: "Từ 爱" });
  await expect(head).toContainText("ài");
  await expect(head).toContainText("愛");
  await expect(head).toContainText("ái");
  await expect(head).toContainText("HSK 1");
  await expect(head.getByRole("button", { name: /Nghe phát âm 爱/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Nghĩa tiếng Việt" })).toContainText("yêu");
  await expect(page.getByRole("region", { name: "Nghĩa tiếng Anh" })).toContainText("to love");
});

test("từ nhiều âm hiện mỗi cách đọc một khối, cách đọc thông dụng (de) đứng đầu", async ({ page }) => {
  await page.goto("/dictionary/" + encodeURIComponent("的"));
  await expect(page.getByRole("region", { name: "Từ 的" })).toContainText(/^[\s\S]*de · /);
  const headings = page.getByRole("region", { name: "Nghĩa tiếng Anh" }).getByRole("heading", { level: 3 });
  await expect(headings.first()).toContainText("de");
  expect(await headings.count()).toBeGreaterThan(1);
});

test("nút Lưu thẻ ôn bật/tắt được khi từ có câu thật làm nguồn", async ({ page }) => {
  await page.goto("/dictionary/" + encodeURIComponent("爱"));
  await page.waitForLoadState("networkidle");
  const save = page.getByRole("button", { name: /thẻ ôn/ });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await expect(save).toContainText("Đã lưu thẻ ôn");
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "false");
});

test("đường dẫn không phải từ trong từ điển chuyển sang tìm kiếm", async ({ page }) => {
  await page.goto("/dictionary/xihuan");
  await expect(page).toHaveURL(/\/dictionary\?q=xihuan/);
  await expect(page.getByRole("region", { name: "Kết quả tra" })).toContainText("喜欢");
});

test("câu ví dụ thật: tô đậm từ, bật/tắt pinyin và bản dịch, xem thêm, xem đúng đoạn video", async ({ page }) => {
  await stubYouTube(page);
  await page.goto("/dictionary/" + encodeURIComponent("爱"));
  await page.waitForLoadState("networkidle");
  const section = page.getByRole("region", { name: "Câu ví dụ" });
  const items = section.getByRole("listitem");
  await expect(items.first()).toBeVisible();
  await expect(items.first().locator("mark").first()).toHaveText("爱");

  await section.getByRole("button", { name: "Pinyin" }).click();
  await expect(section.getByRole("button", { name: "Pinyin" })).toHaveAttribute("aria-pressed", "false");
  await section.getByRole("button", { name: "Bản dịch" }).click();
  await expect(section.getByRole("button", { name: "Bản dịch" })).toHaveAttribute("aria-pressed", "false");

  const more = section.getByRole("button", { name: /Xem thêm \d+ câu/ });
  if (await more.count()) {
    const before = await items.count();
    await more.click();
    expect(await items.count()).toBeGreaterThan(before);
  }

  await items.first().getByRole("button", { name: "Xem đoạn video" }).click();
  await expect(page.getByRole("region", { name: "Nghe thử đoạn" })).toBeVisible();
  await items.first().getByRole("button", { name: "Đọc to câu này" }).click();
  await expect(items.first().getByRole("button", { name: "Đọc to", exact: true })).toBeVisible();
});

test("từ ghép: liệt kê từ chứa chữ, xếp phổ biến trước, bấm để tra tiếp, nghe lần lượt bật/dừng được", async ({ page }) => {
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, body: "" }));
  await page.goto("/dictionary/" + encodeURIComponent("爱"));
  await page.waitForLoadState("networkidle");
  const section = page.getByRole("region", { name: "Từ ghép" });
  await expect(section.getByRole("link").first()).toContainText("爱好");
  const seq = section.getByRole("button", { name: "Nghe lần lượt" });
  await seq.click();
  await expect(section.getByRole("button", { name: "Dừng" })).toBeVisible();
  await section.getByRole("button", { name: "Dừng" }).click();
  await expect(section.getByRole("button", { name: "Nghe lần lượt" })).toBeVisible({ timeout: 15_000 });
  await section.getByRole("link", { name: /爱好/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "爱好" })).toBeVisible();
});
