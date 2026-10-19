import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { hasSupabaseEnv } from "./helpers/seed-analysis";
import { stubAnonymousSession } from "./helpers/stub-anonymous-session";

// Lộ trình HSK 1 trên dữ liệu thật (khóa hsk-1 đã sinh bằng scripts/generate-hsk-course.mts). Đăng nhập ẩn danh và ghi tiến độ được giả lập.
test.skip(!hasSupabaseEnv, "cần cấu hình Supabase");

const noViolations = async (page: Page) => {
  await page.waitForTimeout(400);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations.map((v) => v.id + ": " + v.nodes[0]?.html)).toEqual([]);
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/tts**", (r) => r.fulfill({ status: 500, json: {} })); // không gọi Azure
});

test("bản đồ lộ trình: 36 chặng, nút bắt đầu chặng 1, đạt axe", async ({ page }) => {
  await page.goto("/hoc");
  await expect(page.getByRole("heading", { level: 1, name: "Lộ trình HSK 1" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Các chặng" }).getByRole("listitem")).toHaveCount(36);
  await expect(page.getByRole("link", { name: /Bắt đầu chặng 1: Đại từ cơ bản/ })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Tiến độ lộ trình" })).toHaveAttribute("aria-valuenow", "0");
  await noViolations(page);
});

test("mục Học có trên thanh điều hướng", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" }).first().getByRole("link", { name: "Học" })).toBeVisible();
});

test("chặng 1: làm quen → nghe câu thật → kiểm tra 10 câu → kết quả và lưu tiến độ", async ({ page }) => {
  await stubAnonymousSession(page);
  let saved: Record<string, unknown> | null = null;
  await page.route("**/rest/v1/user_unit_progress*", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: [] });
    saved = route.request().postDataJSON();
    return route.fulfill({ status: 201, body: "" });
  });
  await page.goto("/hoc/hsk-1/1");
  // Lần đầu vào trang chặng, dev server còn biên dịch tuyến này: chờ lâu hơn mặc định 5 giây.
  await expect(page.getByRole("heading", { level: 1, name: "Đại từ cơ bản" })).toBeVisible({ timeout: 20_000 });

  // Bước 1: có đủ 17 từ với pinyin, nghĩa Việt và nút nghe.
  await expect(page.getByRole("button", { name: /^Nghe \p{Script=Han}/u })).toHaveCount(17);
  await expect(page.getByText("tôi", { exact: false }).first()).toBeVisible();
  await noViolations(page);
  await page.getByRole("button", { name: /Nghe trong câu thật/ }).click();

  // Bước 2: câu thật từ video, có bản dịch và liên kết xem video.
  await expect(page.getByRole("link", { name: /Xem trong video/ }).first()).toBeVisible();
  await noViolations(page);
  await page.getByRole("button", { name: /Làm bài kiểm tra/ }).click();

  // Bước 3: chọn đáp án đầu tiên cho cả 10 câu.
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(new RegExp(`Câu ${i + 1}/10`))).toBeVisible();
    await page.getByRole("group", { name: "Các lựa chọn" }).getByRole("button").first().click();
    await page.getByRole("button", { name: /Câu tiếp|Xem kết quả/ }).click();
  }
  const result = page.getByTestId("unit-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText("%");
  expect(saved).toMatchObject({ unit_id: expect.any(String), best_score: expect.any(Number) });
  await noViolations(page);
});

test("chặng không tồn tại: báo rõ và có đường về lộ trình", async ({ page }) => {
  await page.goto("/hoc/hsk-1/999");
  await expect(page.getByText("Không có chặng này.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Về lộ trình" })).toBeVisible();
});

test("trên điện thoại: bản đồ không tràn ngang", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/hoc");
  await expect(page.getByRole("list", { name: "Các chặng" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
