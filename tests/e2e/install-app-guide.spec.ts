import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Hướng dẫn cài app lên màn hình chính (/cai-app): tab iPhone/Android tự chọn theo thiết bị, nút cài một chạm của Chrome, báo khi mở trong Zalo/Facebook và khi đã cài.
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";

test.describe("máy tính (chưa rõ loại điện thoại)", () => {
  test("mặc định hiện hướng dẫn iPhone, đổi sang Android được, không lỗi trợ năng", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cai-app");
    await expect(page.getByRole("heading", { level: 1, name: "Cài SongHanzi lên điện thoại" })).toBeVisible();
    await expect(page.getByText("Thêm vào Màn hình chính", { exact: true })).toBeVisible();
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
    await page.goto("/cai-app");
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
    await page.goto("/cai-app");
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
    await page.goto("/cai-app");
    await expect(page.getByRole("button", { name: "iPhone / iPad" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("note")).toHaveCount(0);
  });

  test("mở trong Zalo/Facebook thì báo phải mở bằng Safari trước", async ({ browser }) => {
    const context = await browser.newContext({ userAgent: `${IPHONE} Zalo/22.1`, viewport: { width: 390, height: 780 } });
    const page = await context.newPage();
    await page.goto("/cai-app");
    await expect(page.getByRole("note")).toContainText("Mở bằng trình duyệt");
    expect((await new AxeBuilder({ page }).analyze()).violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""))).toEqual([]);
    await context.close();
  });

  test("đã cài (mở từ màn hình chính): chỉ báo đang dùng như app, không hiện các bước", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "standalone", { value: true }));
    await page.goto("/cai-app");
    await expect(page.getByText("Bạn đang dùng SongHanzi như một app rồi")).toBeVisible();
    await expect(page.getByText("Thêm vào Màn hình chính")).toHaveCount(0);
  });
});

test("từ menu ⋯ trên điện thoại có lối vào trang cài app", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto("/app");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Cài app lên điện thoại" }).click();
  await expect(page).toHaveURL(/\/cai-app$/);
});
