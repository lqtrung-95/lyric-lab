import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Màn Nghe với dữ liệu mẫu hư cấu "夜车" (6 câu, mỗi câu 5 giây: câu n bắt đầu ở 5*(n-1)).
// YouTube IFrame API được thay bằng bản giả có thể điều khiển thời gian qua window.__t.
const STUB = `window.__t = 0; window.__playing = true; window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1 }, Player: function (el, opts) {
  el.replaceWith(document.createElement('div'));
  setTimeout(function () { opts.events.onReady({ target: {
    seekTo: function (s) { window.__yt.push('seek:' + s); window.__t = s; },
    playVideo: function () { window.__yt.push('play'); window.__playing = true; },
    pauseVideo: function () { window.__yt.push('pause'); window.__playing = false; },
    setPlaybackRate: function (r) { window.__yt.push('rate:' + r); },
    getCurrentTime: function () { return window.__t; },
    getPlayerState: function () { return window.__playing ? 1 : 2; } } }); }, 0);
  this.destroy = function () {}; } };
window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady();`;

const setTime = (page: Page, t: number) => page.evaluate((v) => { (window as unknown as { __t: number }).__t = v; }, t);
const calls = (page: Page) => page.evaluate(() => (window as unknown as { __yt: string[] }).__yt);
const line = (page: Page, n: number) => page.locator(`[data-line-index="${n - 1}"]`);

/**
 * Cuộn xuống đáy và đợi vị trí ổn định: `document.body.scrollHeight` đo ngay sau đổi cỡ cửa sổ có thể
 * chưa tính layout mới (font, sticky player) nên một lần `scrollTo` có khi dừng giữa chừng. Cuộn lại tới
 * khi vị trí không đổi nữa mới coi là đã tới đáy thật.
 */
async function scrollToBottom(page: Page) {
  await page.waitForFunction(
    () => {
      const before = window.scrollY;
      window.scrollTo(0, document.documentElement.scrollHeight);
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
      return atBottom && window.scrollY === before;
    },
    null,
    { polling: 100, timeout: 10_000 },
  );
}

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({ contentType: "text/javascript", body: STUB }));
  await page.goto("/dev/listen-fixture");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Stub YouTube nạp trễ và tự đặt lại thời gian về 0: chờ nó sẵn sàng trước khi test đổi thời gian.
  await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
  // Trang có thể tự trôi cuộn vài trăm px ngay sau khi tải trong môi trường Playwright (không tái hiện được khi
  // thao tác tay trên trình duyệt thật — nghi do timing dựng trang dưới automation, chưa rõ nguồn cụ thể). Cuộn
  // hẳn về đầu để mọi test trong file này xuất phát từ cùng một trạng thái cuộn, không phụ thuộc hiện tượng đó.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
});

test("lời chạy theo thời gian phát và panel 'Đang hát' đổi theo câu", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  await expect(page.getByText("Câu 02 đang phát", { exact: true })).toBeVisible();
  await expect(page.getByRole("complementary").getByText("离开")).toBeVisible();
  await setTime(page, 12);
  await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("complementary").getByText("星光")).toBeVisible();
  await expect(page.getByRole("complementary").getByText("离开")).toHaveCount(0);
});

test("từ vựng tô nền, ngữ pháp gạch chân: hai kiểu khác nhau", async ({ page }) => {
  await setTime(page, 6);
  const row = line(page, 2);
  // Nhãn cho trình đọc màn hình giờ ở aria-label (không phải text hiển thị, để không lẫn vào tên nút).
  await expect(row.locator('[aria-label^="Từ vựng:"]').first()).toBeAttached();
  await expect(row.locator(".ring-2").first()).toBeVisible(); // từ vựng: nền + viền
  await expect(row.locator(".border-b-2").first()).toBeVisible(); // ngữ pháp: gạch chân
});

test("bấm câu để nhảy tới đầu câu", async ({ page }) => {
  // Bấm ở góc trên-trái (vùng đệm của dòng): pinyin ruby làm dòng cao hơn nên tâm dòng (điểm click mặc định)
  // có thể trúng ngay nút tra từ (chặn nảy sự kiện) thay vì phần nền dòng.
  await line(page, 4).click({ position: { x: 8, y: 8 } });
  expect(await calls(page)).toContain("seek:15");
  await expect(line(page, 4)).toHaveAttribute("aria-current", "true");
});

test("lặp câu: phát tới hết câu thì quay về đầu câu, bấm lại để tắt", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  // .first(): thanh điều khiển nổi (mini) có thể cùng hiện nếu thanh chính bị video ghim che — cùng aria-label,
  // lấy đúng nút trên thanh chính (nằm trước trong DOM).
  const loop = page.getByRole("button", { name: "Lặp câu đang hát" }).first();
  await loop.click();
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu 2" })).toBeVisible();
  await setTime(page, 9.98);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __t: number }).__t)).toBe(5);
  await loop.click();
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu" })).toHaveCount(0);
});

test("lặp câu: cấu hình đúng số lần, hết lượt thì tự tắt và không quay đầu câu nữa", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  // Bảng cấu hình chỉ hiện sau khi đã bật lặp câu (nút mở bảng không nên chình ình lúc chưa dùng tới).
  const loop = page.getByRole("button", { name: "Lặp câu đang hát" }).first();
  await loop.click();
  await page.getByRole("button", { name: "Cấu hình lặp câu: số lần và khoảng nghỉ" }).first().click();
  await page.getByRole("button", { name: "2 lần" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu 2" })).toContainText("2 lần");

  // Hết câu lần 1: còn 1 lượt lặp → quay lại đầu câu.
  await setTime(page, 9.98);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __t: number }).__t)).toBe(5);
  expect((await calls(page)).filter((c) => c === "seek:5")).toHaveLength(1);

  // Hết câu lần 2: hết lượt lặp → không quay đầu câu nữa, "Lặp câu" tự tắt.
  await setTime(page, 9.98);
  await expect(page.getByRole("status").filter({ hasText: "Đang lặp câu" })).toHaveCount(0);
  expect((await calls(page)).filter((c) => c === "seek:5")).toHaveLength(1);
});

test("tốc độ 0,75x được áp dụng và nhớ sau khi tải lại", async ({ page }) => {
  await page.getByRole("button", { name: "0,75x" }).click();
  await expect.poll(() => calls(page)).toContain("rate:0.75");
  await page.reload();
  await expect(page.getByRole("button", { name: "0,75x" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => calls(page)).toContain("rate:0.75");
});

test("tắt pinyin và bản dịch, lựa chọn được nhớ", async ({ page }) => {
  // Pinyin giờ ghép theo từng chữ (ruby/rt trên đúng vị trí chữ Hán) thay vì một dòng riêng, nên kiểm bằng
  // sự có mặt của <rt> thay vì tìm nguyên câu pinyin ghép chuỗi.
  await expect(line(page, 1).locator("rt").first()).toBeVisible();
  await page.getByRole("button", { name: "Pinyin" }).first().click();
  await page.getByRole("button", { name: "Bản dịch" }).first().click();
  await expect(line(page, 1).locator("rt")).toHaveCount(0);
  await expect(page.getByText("Anh chưa từng nghĩ mình sẽ rời đi")).toHaveCount(0);
  await page.reload();
  await expect(line(page, 1).locator("rt")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Pinyin" }).first()).toHaveAttribute("aria-pressed", "false");
});

test("phím tắt: Space phát/dừng, mũi tên đổi câu, L lặp câu", async ({ page }) => {
  await setTime(page, 6);
  await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("Space");
  expect(await calls(page)).toContain("pause");
  await page.keyboard.press("ArrowRight");
  expect(await calls(page)).toContain("seek:10");
  await page.keyboard.press("ArrowLeft");
  expect(await calls(page)).toContain("seek:0"); // từ câu 3 (đang ở 10 s) lùi về câu 2 = 5 s
  await page.keyboard.press("l");
  await expect(page.getByRole("button", { name: "Lặp câu đang hát" })).toHaveAttribute("aria-pressed", "true");
});

test("mobile: panel 'Đang hát' thu gọn mặc định, mở ra thấy thẻ của câu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setTime(page, 6);
  const toggle = page.getByRole("button", { name: /Đang hát · Câu 02/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("complementary").getByText("rời đi, rời khỏi")).toBeHidden();
  await toggle.click();
  await expect(page.getByRole("complementary").getByText("rời đi, rời khỏi")).toBeVisible();
});

test.describe("chỉnh lời lệch nhạc", () => {
  test("nút ±0,5s dịch mốc lời, được nhớ sau khi tải lại và đặt lại được", async ({ page }) => {
    await setTime(page, 10.5); // câu 3 bắt đầu ở 10s
    await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Lời muộn hơn 0,5 giây" }).click();
    await page.getByRole("button", { name: "Lời muộn hơn 0,5 giây" }).click();
    await expect(page.getByText("Đang lệch +1 giây")).toBeVisible();
    await expect(line(page, 2)).toHaveAttribute("aria-current", "true"); // câu 3 giờ bắt đầu ở 11s
    await page.reload();
    await page.waitForFunction(() => typeof (window as unknown as { YT?: unknown }).YT !== "undefined");
    await setTime(page, 10.5);
    await expect(line(page, 2)).toHaveAttribute("aria-current", "true");
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Đặt lại (không lệch)" }).click();
    await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
  });

  test("đồng bộ nhanh: bấm dòng đang được hát đặt độ lệch, có bù phản xạ 0,25s", async ({ page }) => {
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Đồng bộ nhanh" }).click();
    await setTime(page, 12.25); // ca sĩ vừa bắt đầu hát câu 3 (mốc gốc 10s) nhưng lời đang lệch
    await line(page, 3).getByRole("button").first().click();
    await expect(page.getByText("Đang lệch +2 giây")).toBeVisible();
    expect((await calls(page)).filter((c) => c.startsWith("seek:"))).toEqual([]); // chế độ này không tua video
    await setTime(page, 12.5);
    await expect(line(page, 3)).toHaveAttribute("aria-current", "true");
  });

  test("nhãn 'Đang lệch' căn giữa dọc với nút 'Chỉnh lời'", async ({ page }) => {
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await page.getByRole("button", { name: "Lời muộn hơn 0,5 giây" }).click();
    const centerY = async (locator: import("@playwright/test").Locator) => {
      const box = (await locator.boundingBox())!;
      return box.y + box.height / 2;
    };
    const button = page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" });
    const badge = page.getByText("Đang lệch +0.5 giây");
    await expect(badge).toBeVisible();
    // Poll: bố cục có thể còn đang ổn định ngay sau khi bấm.
    await expect.poll(async () => Math.abs((await centerY(button)) - (await centerY(badge)))).toBeLessThanOrEqual(1);
  });

  test("bảng chỉnh lời mở ra đạt axe", async ({ page }) => {
    await page.getByRole("button", { name: "Lời bị lệch? Chỉnh lời" }).click();
    await expect(page.getByRole("button", { name: "Đồng bộ nhanh" })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
});

test.describe("thanh điều khiển nhanh khi cuộn xuống", () => {
  test("hiện khi thanh chính cuộn khuất, điều khiển được và ẩn lại khi cuộn lên", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    // Đổi cỡ viewport cũng có thể gây trôi cuộn như ở beforeEach — cuộn lại về đầu cho chắc.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const mini = page.getByRole("group", { name: "Điều khiển nhanh" });
    await expect(mini).toHaveCount(0); // thanh chính đang thấy: chưa cần thanh thu gọn
    await page.setViewportSize({ width: 1280, height: 520 });
    await scrollToBottom(page);
    await expect(mini).toBeVisible();

    await mini.getByRole("button", { name: /Tạm dừng|Phát/ }).click();
    expect((await calls(page)).some((c) => c === "pause" || c === "play")).toBe(true);
    await mini.getByRole("button", { name: "Tới 5 giây" }).click();
    expect((await calls(page)).some((c) => c.startsWith("seek:"))).toBe(true);
    await mini.getByRole("button", { name: /^Tốc độ 1x/ }).click();
    expect((await calls(page)).includes("rate:0.5")).toBe(true);
    // Chỉnh lời lệch ngay trên thanh: mở bảng nhỏ, "Muộn hơn 0,5s" thì hiện +0,5s.
    await mini.getByRole("button", { name: /^Chỉnh thời gian hiện lời/ }).click();
    await mini.getByRole("button", { name: "Muộn hơn 0,5 giây" }).click();
    await expect(mini.getByRole("group", { name: "Chỉnh lời lệch" }).locator("output")).toHaveText("+0,5s");
    await mini.getByRole("button", { name: "Đặt lại" }).click();
    // Chỉ kiểm tra thanh thu gọn (các dòng lời mờ dần là thiết kế có sẵn, đã được kiểm tra riêng ở accessibility.spec).
    expect((await new AxeBuilder({ page }).include('[aria-label="Điều khiển nhanh"]').analyze()).violations).toEqual([]);

    // Điện thoại: hàng nút có chữ nằm ngay dưới video ghim ở đầu màn hình, luôn hiện dù cuộn ở đâu.
    await page.setViewportSize({ width: 390, height: 800 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const inline = page.getByRole("group", { name: "Điều khiển nhanh" });
    await expect(inline).toBeVisible();
    await expect(inline.getByText("Chỉnh lời", { exact: true })).toBeVisible();
    const player = await page.locator("[data-sticky-player]").boundingBox();
    const bar = await inline.boundingBox();
    expect(bar!.y).toBeGreaterThanOrEqual(player!.y + player!.height - bar!.height - 2);

    // Cuộn lên đầu: khi cửa sổ đủ cao để thấy thanh chính thì thanh thu gọn ẩn lại.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(mini).toHaveCount(0);
  });
});
