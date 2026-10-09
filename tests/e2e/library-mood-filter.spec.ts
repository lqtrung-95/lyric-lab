import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Lọc bài theo nhóm cảm xúc ở Thư viện (Khám phá và Bài hát của tôi) và liên kết từ tag cảm xúc ở trang bài. API được giả lập.
const song = (n: number) => ({ videoId: `mood${String(n).padStart(7, "0")}`, title: `Bài cảm xúc ${n}`, channelTitle: "Kênh", levelAvg: 3.4, listeners: 0, likes: 0 });
const LIST = /\/api\/discover\?/;
const COUNTS = /\/api\/discover\/moods/;

async function mockDiscover(page: Page, counts: Record<string, number>) {
  const urls: string[] = [];
  await page.route(COUNTS, (route) => route.fulfill({ json: { counts } }));
  await page.route(LIST, (route) => {
    urls.push(new URL(route.request().url()).search);
    return route.fulfill({ json: { songs: [song(1), song(2)], hasMore: false, total: 2 } });
  });
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  return urls;
}

test("Khám phá: hiện chip có số bài, bỏ nhóm 0 bài, chọn chip gửi đúng bộ lọc và ghi lên URL", async ({ page }) => {
  const urls = await mockDiscover(page, { buon: 5, "lang-man": 12 });
  await page.goto("/library?tab=discover");
  const group = page.getByRole("group", { name: "Lọc theo cảm xúc" });
  await expect(group.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "true");
  await expect(group.getByRole("button", { name: "Buồn, đau lòng (5 bài)" })).toBeVisible();
  await expect(group.getByRole("button", { name: "Lãng mạn, ngọt ngào (12 bài)" })).toBeVisible();
  await expect(group.getByRole("button", { name: /Cô đơn/ })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await group.getByRole("button", { name: /Buồn, đau lòng/ }).click();
  await expect(page).toHaveURL(/tab=discover&mood=buon/);
  await expect.poll(() => urls.at(-1)).toContain("mood=buon");
  await expect(group.getByRole("button", { name: /Buồn, đau lòng/ })).toHaveAttribute("aria-pressed", "true");

  await group.getByRole("button", { name: /Buồn, đau lòng/ }).click(); // bấm lại để bỏ chọn
  await expect(page).not.toHaveURL(/mood=/);
  await expect.poll(() => urls.at(-1)).not.toContain("mood=");
});

test("mở thẳng /library?tab=discover&mood=… chọn sẵn nhóm đó; nhóm không hợp lệ bị bỏ qua", async ({ page }) => {
  const urls = await mockDiscover(page, { "lang-man": 12, buon: 5 });
  await page.goto("/library?tab=discover&mood=lang-man");
  await expect(page.getByRole("button", { name: /Lãng mạn, ngọt ngào/ })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => urls.at(-1)).toContain("mood=lang-man");
  await page.goto("/library?tab=discover&mood=%27%3Bdrop");
  await expect(page.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => urls.at(-1)).not.toContain("mood=");
});

test("không có số liệu cảm xúc (chưa chạy migration) thì ẩn hàng chip, danh sách vẫn dùng được", async ({ page }) => {
  await mockDiscover(page, {});
  await page.goto("/library?tab=discover");
  await expect(page.getByText("Bài cảm xúc 1")).toBeVisible();
  await expect(page.getByRole("group", { name: "Lọc theo cảm xúc" })).toHaveCount(0);
});

test("Bài hát của tôi: lọc theo cảm xúc cho cả bài chỉ lưu ở trình duyệt", async ({ page }) => {
  const recent = [1, 2, 3].map((n) => ({ ...song(n), openedAt: 1_700_000_000_000 - n }));
  await page.addInitScript((value) => localStorage.setItem("lyric-lab-recent-songs", value), JSON.stringify(recent));
  await page.route("**/api/library/songs", (route) => route.fulfill({ json: { songs: [] } }));
  await page.route(/\/api\/songs\/moods/, (route) => route.fulfill({ json: { moods: { [song(1).videoId]: ["buon"], [song(2).videoId]: ["lang-man", "buon"], [song(3).videoId]: [] } } }));
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/library");
  const group = page.getByRole("group", { name: "Lọc theo cảm xúc" });
  await expect(group.getByRole("button", { name: "Buồn, đau lòng (2 bài)" })).toBeVisible();
  await expect(page.getByText("Bài cảm xúc 3")).toBeVisible();
  await group.getByRole("button", { name: /Buồn, đau lòng/ }).click();
  await expect(page.getByText("Bài cảm xúc 1")).toBeVisible();
  await expect(page.getByText("Bài cảm xúc 2")).toBeVisible();
  await expect(page.getByText("Bài cảm xúc 3")).toHaveCount(0);
  await group.getByRole("button", { name: /Lãng mạn, ngọt ngào/ }).click();
  await expect(page.getByText("Bài cảm xúc 2")).toBeVisible();
  await expect(page.getByText("Bài cảm xúc 1")).toHaveCount(0);
});

test("trang bài: tag cảm xúc thuộc nhóm là liên kết tới Khám phá đã lọc", async ({ page }) => {
  await page.route("https://i.ytimg.com/**", (r) => r.fulfill({ status: 204 }));
  await page.goto("/dev/preview-fixture");
  const link = page.getByRole("link", { name: "#Hoài niệm" });
  await expect(link).toHaveAttribute("href", "/library?tab=discover&mood=hoai-niem");
  await expect(page.getByRole("link", { name: "#Hy vọng" })).toHaveAttribute("href", "/library?tab=discover&mood=hy-vong");
});

test("API cảm xúc luôn trả JSON hợp lệ, id sai bị bỏ qua", async ({ request }) => {
  const counts = await request.get("/api/discover/moods");
  expect(counts.status()).toBe(200);
  expect(typeof (await counts.json()).counts).toBe("object");
  const moods = await request.get("/api/songs/moods?ids=bad!id,%27%3B--,");
  expect(moods.status()).toBe(200);
  expect((await moods.json()).moods).toEqual({});
});

test("điện thoại: hàng chip một dòng cuộn ngang và tự cuộn tới chip đang chọn", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await mockDiscover(page, { buon: 5, "lang-man": 12, "hoai-niem": 8, "co-don": 3, "hy-vong": 9, "vui-tuoi": 2, "am-ap": 7, "giang-xe": 4 });
  await page.goto("/library?tab=discover&mood=giang-xe");
  const row = page.getByRole("group", { name: "Lọc theo cảm xúc" });
  const chip = row.getByRole("button", { name: /Giằng xé/ });
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  // Một dòng: mọi chip cùng độ cao; chip đang chọn nằm trọn trong vùng nhìn của hàng sau khi cuộn.
  await expect.poll(async () => {
    const [r, c] = await Promise.all([row.boundingBox(), chip.boundingBox()]);
    return !!r && !!c && c.x >= r.x - 1 && c.x + c.width <= r.x + r.width + 1;
  }).toBe(true);
  const heights = await row.getByRole("button").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(new Set(heights).size).toBe(1);
  expect(heights[0]).toBeGreaterThanOrEqual(44);
});

