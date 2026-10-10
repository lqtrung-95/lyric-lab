import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { stubAnonymousSession } from "./helpers/stub-anonymous-session";

// Mục tiêu hằng ngày và cột mốc trên thẻ chuỗi ngày (API giả lập, không cần DB), và dòng cài đặt mục tiêu.
const WEEK = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"].map((day, i) => ({ day, studied: i < 5, isToday: i === 5 }));
const base = { current: 7, longest: 7, studiedToday: true, week: WEEK, weekCount: 5, learnedWords: 60, todayItems: 6, dailyGoal: 10, videoLines: 12 };

async function open(page: Page, data: object) {
  await stubAnonymousSession(page);
  await page.route("**/api/streak", (route) => route.fulfill({ json: data }));
  await page.goto("/app");
  return page.getByRole("region", { name: "Chuỗi ngày học" });
}

test("thẻ chuỗi ngày: tiến độ mục tiêu hôm nay và các cột mốc đã đạt, mốc kế tiếp", async ({ page }) => {
  const card = await open(page, base);
  await expect(card.getByText("Mục tiêu hôm nay")).toBeVisible();
  await expect(card.getByText("6/10 mục")).toBeVisible();
  await expect(card.getByRole("progressbar", { name: "Tiến độ mục tiêu hôm nay" })).toHaveAttribute("aria-valuenow", "6");
  const medals = card.getByRole("group", { name: "Thành tích" });
  for (const label of ["Chuỗi 7 ngày", "50 từ đã ôn", "10 câu học qua video"]) await expect(medals.getByRole("listitem").filter({ hasText: label })).toHaveCount(1);
  await expect(medals.getByText(/Mốc kế tiếp:.*Chuỗi 14 ngày \(còn 7 ngày\)/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});

test("đủ mục tiêu thì báo đạt; tắt mục tiêu thì mời đặt mục tiêu ở Cài đặt", async ({ page }) => {
  const card = await open(page, { ...base, todayItems: 14 });
  await expect(card.getByText("Đã đạt mục tiêu hôm nay")).toBeVisible();
  await expect(card.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10"); // không vượt mục tiêu
  await page.unroute("**/api/streak");
  await page.route("**/api/streak", (route) => route.fulfill({ json: { ...base, dailyGoal: 0 } }));
  await page.reload();
  await expect(card.getByRole("link", { name: "Đặt mục tiêu" })).toHaveAttribute("href", "/settings?tab=learning");
});

test("mốc mới đạt được báo một lần; lần đầu mở không báo dồn các mốc đã có", async ({ page }) => {
  const card = await open(page, base);
  await expect(card.getByRole("listitem").filter({ hasText: "Chuỗi 7 ngày" })).toHaveCount(1);
  await expect(page.getByRole("status").filter({ hasText: "Mốc mới" })).toHaveCount(0); // lần đầu: chỉ ghi nhận

  await page.unroute("**/api/streak");
  await page.route("**/api/streak", (route) => route.fulfill({ json: { ...base, current: 14, longest: 14 } }));
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Mốc mới: Chuỗi 14 ngày" })).toBeVisible();
  await page.reload();
  await expect(card.getByRole("listitem").filter({ hasText: "Chuỗi 14 ngày" })).toHaveCount(1);
  await expect(page.getByRole("status").filter({ hasText: "Mốc mới" })).toHaveCount(0); // đã báo rồi
});

test("Cài đặt: chọn mục tiêu mỗi ngày và lưu vào hồ sơ", async ({ page }) => {
  await stubAnonymousSession(page);
  const writes: string[] = [];
  await page.route("**/rest/v1/user_profiles**", async (route) => {
    const req = route.request();
    if (req.method() === "GET") return route.fulfill({ json: { new_cards_per_day: 15, onboarded: true, daily_goal: 20 } });
    writes.push(req.postData() ?? "");
    return route.fulfill({ status: 201, body: "" });
  });
  await page.goto("/settings?tab=learning");
  const select = page.getByLabel("Mục tiêu mỗi ngày");
  await expect(select).toHaveValue("20");
  await select.selectOption("5");
  await expect.poll(() => writes.some((w) => w.includes('"daily_goal":5'))).toBe(true);
  await select.selectOption("0");
  await expect(select.locator("option:checked")).toHaveText("Tắt");
});
