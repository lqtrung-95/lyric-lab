import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { stubAnonymousSession } from "./helpers/stub-anonymous-session";

// Trang Hồ sơ: cấp, XP, chuỗi ngày và bộ sưu tập huy hiệu từ API game (giả lập).
const summary = {
  xp: { total: 340, today: 20, todayCap: 200, todaySources: [] },
  level: { n: 3, name: "Người nghe", progressXp: 40, nextXp: 100, maxed: false },
  streak: { current: 5, longest: 9, freezes: 1, studiedToday: true, week: [], frozenDays: [] },
  quests: [], badges: { earned: [], recent: [] }, ledger: [],
};
const badge = (over: Record<string, unknown>) => ({ hidden: false, unlocked: false, tier: null, nextTier: "bronze", progress: 0, nextTarget: 10, tiers: [], ...over });
const badges = [
  badge({ id: "words", group: "learn", title: "Thợ nhặt chữ", hint: "Học 10 từ", unlocked: true, tier: "silver", nextTier: "gold", progress: 30, nextTarget: 50 }),
  badge({ id: "streak", group: "streak", title: "Lửa bền", hint: "Giữ chuỗi 7 ngày", progress: 5, nextTarget: 7 }),
  badge({ id: "night", group: "learn", title: "???", hint: "Huy hiệu ẩn: cứ học rồi sẽ gặp", hidden: true, nextTarget: null, nextTier: null }),
];

test("hồ sơ: hiện cấp, XP, chuỗi ngày, huy hiệu theo nhóm và đạt axe", async ({ page }) => {
  await stubAnonymousSession(page);
  await page.route("**/api/game/summary", (r) => r.fulfill({ json: summary }));
  await page.route("**/api/game/badges", (r) => r.fulfill({ json: { badges } }));
  await page.goto("/profile");
  await expect(page.getByRole("heading", { level: 1, name: "Người nghe" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Tiến độ lên cấp" })).toHaveAttribute("aria-valuenow", "40");
  await expect(page.getByText("340")).toBeVisible();
  await expect(page.getByText("1/3")).toBeVisible();
  await expect(page.getByText("Bậc Bạc")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Tiến độ huy hiệu Lửa bền" })).toHaveAttribute("aria-valuenow", "5");
  await expect(page.getByText("Chưa mở")).toHaveCount(2);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.map((v) => v.id + ": " + v.nodes[0]?.html)).toEqual([]);
});

test("hồ sơ: API game chưa có thì báo rõ, không hiện số giả", async ({ page }) => {
  await stubAnonymousSession(page);
  await page.route("**/api/game/**", (r) => r.fulfill({ status: 500, json: { error: "server_error" } }));
  await page.goto("/profile");
  await expect(page.getByRole("alert").filter({ hasText: "hồ sơ" })).toContainText("Chưa tải được hồ sơ");
});
