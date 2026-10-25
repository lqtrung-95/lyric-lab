import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Hướng dẫn cài app lên màn hình chính (/install): tab iPhone/Android tự chọn theo thiết bị, nút cài một chạm của Chrome, báo khi mở trong Zalo/Facebook và khi đã cài.
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";

test.describe("máy tính (chưa rõ loại điện thoại)", () => {
  test("mặc định hiện hướng dẫn iPhone, đổi sang Android được, không lỗi trợ năng", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/install");
    await expect(page.getByRole("heading", { level: 1, name: "Cài SongHanzi lên điện thoại" })).toBeVisible();
    await expect(page.locator("b", { hasText: "Thêm vào Màn hình chính" })).toBeVisible(); // chữ trong bước (minh họa SVG cũng có chữ nên không dùng getByText)
    await expect(page.getByRole("button", { name: "iPhone / iPad" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("thông báo nhắc học")).toBeVisible(); // lợi ích riêng của iPhone
    expect((await new AxeBuilder({ page }).analyze()).violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""))).toEqual([]);
    await page.getByRole("button", { name: "Android" }).click();
    await expect(page.getByText("Cài đặt ứng dụng").first()).toBeVisible();
    await expect(page.getByText("Chia sẻ → SongHanzi")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cài app ngay" })).toHaveCount(0); // chưa có sự kiện cài của trình duyệt
  });
});

test.describe("Android", () => {
  test.use({ userAgent: ANDROID, viewport: { width: 390, height: 780 } });

  test("tự chọn tab Android; khi Chrome báo cài được thì có nút Cài app ngay, bấm gọi hộp thoại cài và báo thành công", async ({ page }) => {
    await page.goto("/install");
    await expect(page.getByRole("button", { name: "Android" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Cài app ngay" })).toHaveCount(0);
    await page.evaluate(() => {
      const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
        prompt: async () => { (window as unknown as { __prompted: boolean }).__prompted = true; },
        userChoice: Promise.resolve({ outcome: "accepted" }),
      });
      window.dispatchEvent(event);
    });
    const button = page.getByRole("button", { name: "Cài app ngay" });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.getByText("Đã cài xong!")).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __prompted?: boolean }).__prompted)).toBe(true);
    await expect(button).toHaveCount(0); // mỗi sự kiện chỉ dùng một lần
  });

  test("người từ chối hộp thoại cài: báo nhẹ nhàng, vẫn còn các bước làm tay", async ({ page }) => {
    await page.goto("/install");
    await expect(page.getByRole("button", { name: "Android" })).toHaveAttribute("aria-pressed", "true"); // đã hydrate xong
    await page.evaluate(() => {
      window.dispatchEvent(Object.assign(new Event("beforeinstallprompt", { cancelable: true }), { prompt: async () => undefined, userChoice: Promise.resolve({ outcome: "dismissed" }) }));
    });
    await page.getByRole("button", { name: "Cài app ngay" }).click();
    await expect(page.getByText("Bạn chưa cài.")).toBeVisible();
    await expect(page.getByText("Cài đặt ứng dụng", { exact: true }).first()).toBeVisible();
  });
});

test.describe("iPhone", () => {
  test.use({ userAgent: IPHONE, viewport: { width: 390, height: 780 } });

  test("tự chọn tab iPhone, không báo trình duyệt nhúng", async ({ page }) => {
    await page.goto("/install");
    await expect(page.getByRole("button", { name: "iPhone / iPad" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("note")).toHaveCount(0);
  });

  test("mở trong Zalo/Facebook thì báo phải mở bằng Safari trước", async ({ browser }) => {
    const context = await browser.newContext({ userAgent: `${IPHONE} Zalo/22.1`, viewport: { width: 390, height: 780 } });
    const page = await context.newPage();
    await page.goto("/install");
    await expect(page.getByRole("note")).toContainText("Mở bằng trình duyệt");
    expect((await new AxeBuilder({ page }).analyze()).violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""))).toEqual([]);
    await context.close();
  });

  test("đã cài (mở từ màn hình chính): chỉ báo đang dùng như app, không hiện các bước", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "standalone", { value: true }));
    await page.goto("/install");
    await expect(page.getByText("Bạn đang dùng SongHanzi như một app rồi")).toBeVisible();
    await expect(page.getByText("Thêm vào Màn hình chính")).toHaveCount(0);
  });
});

test("từ Cài đặt → Mẹo có lối vào trang hướng dẫn cài app", async ({ page }) => {
  // Lối vào "Cài app lên điện thoại" đã rút khỏi menu ⋯ (menu còn 4 mục); hướng dẫn nằm ở thẻ Mẹo của Cài đặt.
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto("/settings?tab=tips");
  await page.getByRole("link", { name: "Xem hướng dẫn cài app" }).click();
  await expect(page).toHaveURL(/\/install$/);
});

// Biểu ngữ mời cài ở trang chủ điện thoại: ẩn với trình duyệt tự động hoá trừ khi test bật cờ `__forceInstallBanner`; chỉ hiện khi đã thiết lập xong (cờ onboarded).
const banner = (page: import("@playwright/test").Page) => page.getByRole("complementary", { name: "Cài app lên điện thoại" });
const arm = (page: import("@playwright/test").Page, opts: { onboarded?: boolean } = {}) => page.addInitScript((onboarded) => {
  (window as unknown as { __forceInstallBanner: boolean }).__forceInstallBanner = true;
  if (onboarded) localStorage.setItem("lyric-lab-onboarded", "1");
}, opts.onboarded ?? true);

test.describe("biểu ngữ ở trang chủ", () => {
  test.use({ userAgent: ANDROID, viewport: { width: 390, height: 780 } });

  test("hiện trên điện thoại chưa cài, dẫn sang hướng dẫn; Để sau ẩn và nhớ sau khi tải lại", async ({ page }) => {
    await arm(page);
    await page.goto("/app");
    await expect(banner(page)).toBeVisible();
    expect((await new AxeBuilder({ page }).include('[aria-label="Cài app lên điện thoại"]').analyze()).violations).toEqual([]);
    await banner(page).getByRole("button", { name: "Để sau" }).click();
    await expect(banner(page)).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(1200);
    await expect(banner(page)).toHaveCount(0);
  });

  test("bấm Xem cách cài thì sang trang hướng dẫn", async ({ page }) => {
    await arm(page);
    await page.goto("/app");
    await banner(page).getByRole("link", { name: "Xem cách cài" }).click();
    await expect(page).toHaveURL(/\/install$/);
  });

  test("Chrome cho cài một chạm: nút Cài app gọi hộp thoại cài, cài xong thì ẩn biểu ngữ", async ({ page }) => {
    await arm(page);
    await page.goto("/app");
    await expect(banner(page)).toBeVisible();
    await page.evaluate(() => {
      window.dispatchEvent(Object.assign(new Event("beforeinstallprompt", { cancelable: true }), { prompt: async () => { (window as unknown as { __prompted: boolean }).__prompted = true; }, userChoice: Promise.resolve({ outcome: "accepted" }) }));
    });
    await banner(page).getByRole("button", { name: "Cài app" }).click();
    await expect(banner(page)).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __prompted?: boolean }).__prompted)).toBe(true);
  });

  test("không hiện khi chưa thiết lập xong, khi đã cài, hoặc với trình duyệt tự động hoá (mặc định)", async ({ page, browser }) => {
    await arm(page, { onboarded: false });
    await page.goto("/app");
    await page.waitForTimeout(1200);
    await expect(banner(page)).toHaveCount(0);

    const standalone = await browser.newContext({ userAgent: ANDROID, viewport: { width: 390, height: 780 } });
    const p2 = await standalone.newPage();
    await arm(p2);
    await p2.addInitScript(() => Object.defineProperty(navigator, "standalone", { value: true }));
    await p2.goto("/app");
    await p2.waitForTimeout(1200);
    await expect(banner(p2)).toHaveCount(0);
    await standalone.close();

    const plain = await browser.newContext({ userAgent: ANDROID, viewport: { width: 390, height: 780 } });
    const p3 = await plain.newPage();
    await p3.addInitScript(() => localStorage.setItem("lyric-lab-onboarded", "1")); // không bật cờ ép
    await p3.goto("/app");
    await p3.waitForTimeout(1200);
    await expect(banner(p3)).toHaveCount(0);
    await plain.close();
  });
});

test("máy tính không có biểu ngữ này", async ({ page }) => {
  await arm(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/app");
  await page.waitForTimeout(1200);
  await expect(banner(page)).toHaveCount(0);
});
